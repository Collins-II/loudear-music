import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "fan" | "artist";
      stageName?: string | null;
      bio?: string;
      location?: string;
      phone?: string;
      genres?: string[];
      isNewUser?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "fan" | "artist";
    isNewUser?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.META_CLIENT_ID!,
      clientSecret: process.env.META_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXT_AUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * 1️⃣ Handle Sign-In — create or update user
     */
    async signIn({ user }) {
      await connectToDatabase();

      let dbUser = await User.findOne({ email: user.email });

      if (!dbUser) {
        dbUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: "fan",
        });

        (user as any).id = dbUser._id as string;
        (user as any).role = "fan";
        (user as any).isNewUser = true;
      } else {
        dbUser.name = user.name || dbUser.name;
        dbUser.image = user.image || dbUser.image;
        await dbUser.save();

        (user as any).id = dbUser._id as string;
        (user as any).role = dbUser.role;
        (user as any).isNewUser = false;
      }

      return true;
    },

    /**
     * 2️⃣ JWT — store key info persistently
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || "fan";
        token.isNewUser = (user as any).isNewUser ?? false;
      } else if (token.email) {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          // ⚙️ Keep token clean for existing users
          if (token.isNewUser && dbUser.name && dbUser.bio) {
            token.isNewUser = false;
          }
        }
      }
      return token;
    },

    /**
     * 3️⃣ Session — hydrate from DB
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id!;
        session.user.role = token.role!;
        session.user.isNewUser = token.isNewUser ?? false;
      }

      return session;
    },

    /**
     * 4️⃣ Redirect — handle new user onboarding
     */
    async redirect({ url, baseUrl }) {
      // Prevent existing users from `/auth/register`
      if (url.includes("/auth/register") && !url.includes("isNewUser=true")) {
        return baseUrl;
      }
      if (url.includes("isNewUser=true")) {
        return `${baseUrl}/auth/register`;
      }
      return baseUrl;
    },
  },

  /**
   * 5️⃣ Custom Pages
   */
  pages: {
    signIn: "/auth",
    error: "/auth/error",
    newUser: "/auth/register",
  },
};
