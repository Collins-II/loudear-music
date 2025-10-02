import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaSpotify, FaApple, FaTiktok } from "react-icons/fa";
import { Card } from "@/components/ui/card";

const platforms = [
  {
    name: "Facebook",
    url: "https://facebook.com/YoMapsYo",
    icon: <FaFacebookF className="w-6 h-6" />,
    color: "hover:bg-blue-600",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/YoMapsYo",
    icon: <FaInstagram className="w-6 h-6" />,
    color: "hover:bg-pink-600",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/YoMapsYo",
    icon: <FaTwitter className="w-6 h-6" />,
    color: "hover:bg-sky-500",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/YoMapsYo",
    icon: <FaYoutube className="w-6 h-6" />,
    color: "hover:bg-red-600",
  },
  {
    name: "Spotify",
    url: "https://spotify.com/YoMapsYo",
    icon: <FaSpotify className="w-6 h-6" />,
    color: "hover:bg-green-600",
  },
  {
    name: "Apple Music",
    url: "https://music.apple.com/YoMapsYo",
    icon: <FaApple className="w-6 h-6" />,
    color: "hover:bg-gray-800",
  },
  {
    name: "TikTok",
    url: "https://tiktok.com/@YoMapsYo",
    icon: <FaTiktok className="w-6 h-6" />,
    color: "hover:bg-black",
  },
];

export default function SocialMediaPlatforms() {
  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-amber-500">
          Connect with Yo Maps Yo
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 justify-center">
          {platforms.map((platform) => (
            <Card
              key={platform.name}
              className={`p-6 flex flex-col items-center justify-center text-center shadow-md rounded-2xl transition transform hover:scale-105 cursor-pointer ${platform.color}`}
              onClick={() => window.open(platform.url, "_blank")}
            >
              <div className="mb-3 text-amber-500">{platform.icon}</div>
              <p className="text-sm font-semibold">{platform.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
