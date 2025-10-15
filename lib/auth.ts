import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";

// Extend Session type with LoudEar metadata
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "fan" | "artist";
      bio?: string;
      location?: string;
      phone?: number;
      genres?: string[];
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "fan", // default role for new Google users
          });
        } else {
          // keep info fresh
          existing.name = user.name || existing.name;
          existing.image = user.image || existing.image;
          await existing.save();
        }
      }
      return true;
    },

    async session({ session }) {
      if (session.user?.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id as string;
          session.user.role = dbUser.role;
          session.user.bio = dbUser.bio;
          session.user.location = dbUser.location;
          session.user.genres = dbUser.genres;
          session.user.phone = dbUser.phone;
        }
      }
      return session;
    },
  },
};
