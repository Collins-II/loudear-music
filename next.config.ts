import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
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
      "i.scdn.co"
    ],
  },
};

export default withPWA(nextConfig);
