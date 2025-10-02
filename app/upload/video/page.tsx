"use client";

import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Video, Film } from "lucide-react";
import { toast } from "sonner";
import SingleVideoUploadForm from "@/components/forms/video-upload-form";
import AlbumVideoUploadForm from "@/components/forms/video-upload-form";

export default function UploadVideosPage() {
  // Success Handlers
  const handleSingleVideoSuccess = () => {
    toast.success("Video uploaded successfully!");
  };

  const handleAlbumVideoSuccess = () => {
    toast.success("Video album uploaded successfully!");
  };

  return (
    <main className="bg-gradient-to-t from-white via-neutral-950 to-black min-h-screen py-16 md:px-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto space-y-12 pt-12"
      >
    {/* Example Ad Section */}
        <div className="bg-blue-200 rounded-xl p-6 text-center shadow-md">
          <p className="text-gray-700 font-semibold">Ad Space</p>
          <p className="text-sm text-gray-600">Promote your brand</p>
        </div>

        {/* Upload Section */}
        <div className=" rounded-2xl space-y-4 py-12">
          {/* Billboard-Style Header */}
          <div className="text-center space-y-4 px-6">
            <div className="w-full flex gap-2 items-center">
              <span className="w-full h-[8px] bg-white -z-0"></span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Upload Video
            </h1>
            <span className="w-full h-[8px] bg-white -z-0"></span>
            </div>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Share your music videos and visual albums. Let the world see your art in motion.
            </p>
          </div>
      
          <div className="w-full pt-12">
            <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <SingleVideoUploadForm onSuccess={handleSingleVideoSuccess} />
                </motion.div>
          </div>
        </div>

        {/* Example Ad Section */}
        <div className="bg-blue-200 rounded-xl p-6 text-center shadow-md">
          <p className="text-gray-700 font-semibold">Ad Space</p>
          <p className="text-sm text-gray-600">Promote your brand</p>
        </div>
      </motion.div>
    </main>
  );
}
