"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SingleUploadForm from "@/components/forms/single-upload-form";
import { PaginationControls } from "@/components/paginated-controls";
import { DataTable, schema } from "@/components/data-table";
import { getSongs } from "@/app/actions/getSongs";
import { z } from "zod";

// ✅ Import the schema used by your DataTable

// ✅ Infer TS type directly from schema so it matches
type SongRow = z.infer<typeof schema>;

interface IndexProps {
    data: SongRow[]
}

export default function ClientIndex({ data }: IndexProps) {
  const [songs, setSongs] = useState<SongRow[]>(data);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

/*  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const data = await getSongs();
        console.log("SONG_DATA",data) // ✅ call function
        setSongs(data); // already normalized
        setTotalPages(1); // placeholder until pagination is added
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      }
    };
    fetchSongs();
  }, [page]);*/

  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎶 Songs Management</h1>
        <Button onClick={() => setOpen(true)}>Upload Song</Button>
      </div>

      <motion.div layout>
        {/* ✅ DataTable now receives normalized schema */}
        <DataTable data={songs} />
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-6xl overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Upload New Song</DialogTitle>
          </DialogHeader>
          <SingleUploadForm
            onSuccess={() => {
              setOpen(false);
              setPage(1); // refresh on new upload
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
