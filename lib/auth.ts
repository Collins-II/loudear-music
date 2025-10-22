import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";

// ✅ Extend the Session and JWT interfaces
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
      phone?: string;
      genres?: string[];
    };
  }

  interface User {
    id: string;
    role?: "fan" | "artist";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "fan" | "artist";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXT_AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 🔹 1️⃣ Handle sign-in and sync DB user
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "fan", // default role
          });

          user.id = newUser._id as string;
          user.role = newUser.role;
        } else {
          existing.name = user.name || existing.name;
          existing.image = user.image || existing.image;
          await existing.save();

          user.id = existing._id as string;
          user.role = existing.role;
        }
      }

      return true;
    },

    // 🔹 2️⃣ Sync role & ID into JWT
    async jwt({ token, user }) {
      // On initial sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role || "fan";
      } else {
        // On subsequent requests, ensure DB updates propagate
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id as string;
          token.role = dbUser.role || "fan";
        }
      }

      return token;
    },

    // 🔹 3️⃣ Sync JWT info into Session (client-side accessible)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "fan" | "artist";
      }

      // Optionally fetch extra fields from DB (only on server)
      if (session.user.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.bio = dbUser.bio;
          session.user.location = dbUser.location;
          session.user.genres = dbUser.genres;
          session.user.phone = dbUser.phone;
          session.user.image = dbUser.image;
        }
      }

      return session;
    },
  },
};
