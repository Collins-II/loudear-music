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
      stageName?: string | null;
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
    stageName?: string;
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
     * 1️⃣ Handle sign-in and tag new users
     */
    async signIn({ user }) {
      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create a default fan profile
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            role: "fan",
          });

          (user as any).id = newUser._id as string;
          (user as any).role = "fan";
          (user as any).isNewUser = true;
        } else {
          existingUser.name = user.name || existingUser.name;
          existingUser.image = user.image || existingUser.image;
          await existingUser.save();

          (user as any).id = existingUser._id as string;
          (user as any).role = existingUser.role;
          (user as any).isNewUser = false;
        }

        return true;
      } catch (err) {
        console.error("[AUTH_SIGNIN_ERROR]", err);
        return false;
      }
    },

    /**
     * 2️⃣ Persist new-user flag and ID in JWT
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || "fan";
        token.isNewUser = (user as any).isNewUser ?? false;
      }
      return token;
    },

    /**
     * 3️⃣ Hydrate session with full profile data
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "fan" | "artist";
      }

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

    /**
     * 4️⃣ Redirect logic for new users
     */
    async redirect({ baseUrl, url }) {
      // Extract `isNewUser` flag from JWT via internal NextAuth URL
      try {
        // The redirect callback doesn't get token directly, so we rely on `url` inspection.
        // NextAuth adds internal callback URLs like `${baseUrl}/api/auth/callback/google`
        // We redirect from the default post-login redirect here.
        //const newUserCookie = "next-auth.newUser";
        if (url.includes("/api/auth/callback")) {
          // Always redirect to homepage after OAuth handshake
          return baseUrl;
        }

        // Check if redirected after sign-in
        if (url.includes("newUser=true")) {
          return `${baseUrl}/auth/register`;
        }

        return url.startsWith(baseUrl) ? url : baseUrl;
      } catch (err) {
        console.error("[AUTH_REDIRECT_ERROR]", err);
        return baseUrl;
      }
    },
  },

  events: {
    /**
     * 5️⃣ Auto-append ?newUser=true after sign-in event for first-timers
     */
    async signIn({ user }) {
      if ((user as any).isNewUser) {
        // This automatically adds the flag to redirect URL
        (user as any).redirect = "/auth/register?newUser=true";
      }
    },
  },

  /**
   * 6️⃣ Custom pages for UX
   */
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/register", // ✅ built-in NextAuth redirect for first-time users
  },
};
