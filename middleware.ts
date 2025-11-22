import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/auth",
  "/auth/error",
  "/api/public",
  "/favicon.ico",
  "/manifest.json",
  "/robots.txt",
  "/assets",
  "/images",
  "/_next",
];

const ARTIST_PATHS = ["/artist", "/studio/dashboard"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static & public paths
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXT_AUTH_SECRET,
  });

  // If logged out → allow only public paths, block private pages
  if (!token) {
    if (!pathname.startsWith("/auth")) {
      const loginUrl = new URL("/auth", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const isNewUser = token.isNewUser ?? false;
  const role = token.role ?? "fan";

  // NEW USER → must finish onboarding
  if (isNewUser) {
    if (!pathname.startsWith("/auth/register")) {
      return NextResponse.redirect(new URL("/auth/register", req.url));
    }
    return NextResponse.next();
  }

  // Returning user → block access to onboarding page
  if (!isNewUser && pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Artist protected routes
  if (ARTIST_PATHS.some((p) => pathname.startsWith(p)) && role !== "artist") {
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/studio/:path*",
    "/artist/:path*",
    "/upload/:path*",
    "/profile/:path*",
    "/account/:path*",
    "/auth/register",
    "/dashboard/:path*",
  ],
};
