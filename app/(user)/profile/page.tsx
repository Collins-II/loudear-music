"use client"

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

 function ArtistProfilePage() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:to-neutral-900 p-6 md:p-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-32 w-32 border-4 border-primary/40 shadow-lg">
            <AvatarImage src="/artist-avatar.jpg" alt="Artist" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              LoudEar Artist Name
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl">
              Hip-Hop / Afrobeat artist, producer, and songwriter bringing sonic innovation and rhythm to global audiences.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
              <Button variant="outline">Edit Profile</Button>
              <Button>Upload New Track</Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Songs", value: 42 },
            { label: "Albums", value: 5 },
            { label: "Videos", value: 9 },
            { label: "Followers", value: "12.4K" },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="text-center border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-neutral-900/50"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                  {stat.value}
                </CardTitle>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs for About / Songs / Albums / Videos */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-flex">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="pt-6">
            <Card className="bg-white/70 dark:bg-neutral-900/50 border border-gray-200 dark:border-white/10">
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">Biography</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  LoudEar Artist has released chart-topping hits and continues to push creative boundaries. With a passion for blending genres and storytelling through sound, their work resonates across continents.
                </p>
                <h3 className="text-lg font-semibold pt-4">Social Links</h3>
                <div className="flex gap-3">
                  <Button variant="outline">Instagram</Button>
                  <Button variant="outline">YouTube</Button>
                  <Button variant="outline">Spotify</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="songs" className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition border-gray-200 dark:border-white/10"
                >
                  <CardContent className="p-4">
                    <img
                      src="/placeholder.jpg"
                      alt="song cover"
                      className="rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Song Title {i + 1}
                    </h4>
                    <p className="text-sm text-gray-500">3:45</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="albums" className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg transition border-gray-200 dark:border-white/10"
                >
                  <CardContent className="p-4">
                    <img
                      src="/album-cover.jpg"
                      alt="album cover"
                      className="rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Album Name {i + 1}
                    </h4>
                    <p className="text-sm text-gray-500">Released 2024</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden group">
                  <div className="relative">
                    <img
                      src="/video-thumbnail.jpg"
                      alt="video thumbnail"
                      className="rounded-lg group-hover:opacity-80 transition"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Button variant="secondary">Play</Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Video Title {i + 1}
                    </h4>
                    <p className="text-sm text-gray-500">2.1M views</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.section>
    </div>
  );
}

export default ArtistProfilePage;