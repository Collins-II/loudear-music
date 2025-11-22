import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Disable only during dev (important for Windows builds)
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest.json$/], // prevents trace file lock issues
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "flagcdn.com",
      "images.pexels.com",
      "cdn-images.dzcdn.net",
      "i.ytimg.com",
      "img.youtube.com",
      "images.unsplash.com",
      "lh3.googleusercontent.com",
      "www.pngall.com",
      "maps.googleapis.com",
      "res.cloudinary.com",
      "pngimg.com",
      "image-cdn-fa.spotifycdn.com",
      "mosaic.scdn.co",
      "image-cdn-ak.spotifycdn.com",
      "i.scdn.co",
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: "200mb", // or higher if needed
    },
  },
  // ✅ This ensures .next/trace is not locked during build
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
};

export default withPWA(nextConfig);