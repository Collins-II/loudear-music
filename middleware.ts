import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/auth", "/auth/error"];
const ARTIST_PATHS = ["/artist", "/studio", "/upload"];
const USER_PATHS = ["/studio", "/profile", "/account"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public routes
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === "/" ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // 🚫 Not logged in
  if (!token) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (token as any).role || "fan";
  const isNewUser = (token as any).isNewUser ?? false;

  // 🧩 Force new users into register until setup done
  if (isNewUser && pathname !== "/auth/register") {
    return NextResponse.redirect(new URL("/auth/register", req.url));
  }

  // 🚫 Block existing users from register
  if (!isNewUser && pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🎭 Role-based control
  if (ARTIST_PATHS.some((p) => pathname.startsWith(p))) {
    if (userRole !== "artist") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  if (USER_PATHS.some((p) => pathname.startsWith(p))) {
    if (!["fan", "artist"].includes(userRole)) {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio/dashboard/:path*",
    "/artist/:path*",
    "/studio/:path*",
    "/upload/:path*",
    "/auth/register",
  ],
};
