import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { connectToDatabase } from "@/lib/database";
import { User } from "@/lib/database/models/user";

// ------------------------------------
// ✅ Extended Type Declarations
// ------------------------------------
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
    email?: string;
    role?: "fan" | "artist";
    stageName?: string;
    isNewUser?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "fan" | "artist";
    isNewUser?: boolean;
  }
}

// ------------------------------------
// ⚙️ NextAuth Configuration
// ------------------------------------
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
    // ---------------------------------------------------
    // 1️⃣ Handle Sign-In — create or update user
    // ---------------------------------------------------
    async signIn({ user }) {
      try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
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
      } catch (error) {
        console.error("[AUTH_SIGNIN_ERROR]", error);
        return false;
      }
    },

    // ---------------------------------------------------
    // 2️⃣ JWT — persist essential data
    // ---------------------------------------------------
async jwt({ token, user }) {
  if (user) {
    token.id = (user as any).id;
    token.role = (user as any).role || "fan";
    token.isNewUser = (user as any).isNewUser ?? false;
  } else {
    // Periodically recheck user role in DB every hour
    //const shouldRefresh = !token.lastCheck || Date.now() - (token.lastCheck as number) > 60 * 60 * 1000;
    if (token.email) {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: token.email });
      if (dbUser) token.role = dbUser.role;
      token.lastCheck = Date.now();
    }
  }
  return token;
},


    // ---------------------------------------------------
    // 3️⃣ Session — hydrate with DB data
    // ---------------------------------------------------
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
          session.user.stageName = dbUser.stageName
        }
      }

      return session;
    },

    // ---------------------------------------------------
    // 4️⃣ Redirect — clean new-user flow
    // ---------------------------------------------------
    async redirect({ url, baseUrl }) {
      try {
        const urlObj = new URL(url, baseUrl);
        const isNewUser = urlObj.searchParams.get("isNewUser");
        const userId = urlObj.searchParams.get("id");

        // redirect first-time users to registration details page
        if (isNewUser === "true" && userId) {
          return `${baseUrl}/auth/register`;
        }

        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (urlObj.origin === baseUrl) return url;
        return baseUrl;
      } catch (err) {
        console.error("[AUTH_REDIRECT_ERROR]", err);
        return baseUrl;
      }
    },
  },

  // ---------------------------------------------------
  // 5️⃣ Event Hook — mark new users for redirect
  // ---------------------------------------------------
  events: {
    async signIn({ user }) {
      if ((user as any).isNewUser) {
        (user as any).redirect = `/auth/${(user as any).id}/user-details?isNewUser=true`;
      }
    },
  },

  // ---------------------------------------------------
  // 6️⃣ Custom Pages
  // ---------------------------------------------------
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/register",
  },
};
