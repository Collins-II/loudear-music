"use client";

import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Music, Disc } from "lucide-react";
import { toast } from "sonner";
import SingleUploadForm from "@/components/forms/single-upload-form";
import AlbumUploadForm from "@/components/forms/album-upload-form";

export default function UploadMusicPage() {
  // Success Handlers
  const handleSingleSuccess = () => {
    toast.success("Single uploaded successfully!");
  };

  const handleAlbumSuccess = () => {
    toast.success("Album uploaded successfully!");
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
        <div className="rounded-2xl space-y-6 p-6">
          {/* Billboard-Style Header */}
          <div className="text-center space-y-4 px-6">
            <div className="w-full flex gap-2 items-center">
              <span className="w-full h-[8px] bg-white -z-0"></span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Upload Music
            </h1>
            <span className="w-full h-[8px] bg-white -z-0"></span>
            </div>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Get your singles and albums live on the platform. Share your sound with the world.
            </p>
          </div>

          <div>
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid grid-cols-2 gap-2 max-w-md mx-auto mb-8 bg-neutral-800/80 p-2 rounded-xl border border-neutral-700">
                <TabsTrigger
                  value="single"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-6 py-3 flex items-center gap-2 text-lg font-semibold text-neutral-400 hover:text-white transition"
                >
                  <Music className="w-5 h-5" /> Single
                </TabsTrigger>
                <TabsTrigger
                  value="album"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg px-6 py-3 flex items-center gap-2 text-lg font-semibold text-neutral-400 hover:text-white transition"
                >
                  <Disc className="w-5 h-5" /> Album
                </TabsTrigger>
              </TabsList>

              {/* Single Upload */}
              <TabsContent value="single" className="border-none space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <SingleUploadForm onSuccess={handleSingleSuccess} />
                </motion.div>
              </TabsContent>

              {/* Album Upload */}
              <TabsContent value="album" className="border-none space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="w-full"
                >
                  <AlbumUploadForm onSuccess={handleAlbumSuccess} />
                </motion.div>
              </TabsContent>
            </Tabs>
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
