import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/auth", "/auth/register", "/api/public"];
const ARTIST_PATHS = ["/artist", "/studio", "/upload", "/dashboard/artist"];
const USER_PATHS = ["/dashboard", "/profile", "/account"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  if (
    PUBLIC_PATHS.some((p) => p !== "/" && pathname.startsWith(p)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // ✅ Get NextAuth token (Edge compatible)
  const token = await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // 🚫 Not logged in → redirect to login
  if (!token) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token?.isNewUser && req.nextUrl.pathname !== "/auth/register") {
    return NextResponse.redirect(new URL("/auth/register", req.url));
  }

  // ✅ Logged-in user
  const userRole = (token as any).role || "fan";

  // 🎭 Role-based access
  if (ARTIST_PATHS.some((p) => pathname.startsWith(p))) {
    if (userRole !== "artist") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (USER_PATHS.some((p) => pathname.startsWith(p))) {
    if (!["fan", "artist"].includes(userRole)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // ✅ Allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio/dashboard/:path*",
    "/artist/:path*",
    "/studio/:path*",
    "/upload/:path*",
  ],
};
