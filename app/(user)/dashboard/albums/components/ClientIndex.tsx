"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AlbumUploadForm from "@/components/forms/album-upload-form";
import { AlbumCard } from "@/components/album-card";
import { PaginationControls } from "@/components/paginated-controls";
import { IAlbum } from "@/lib/database/models/album";
import z from "zod";
import { DataTable, schema } from "@/components/data-table";

type SongRow = z.infer<typeof schema>;

interface IndexProps {
    data: SongRow[]
}

export default function AlbumIndex({ data }: IndexProps) {
  const [albums, setAlbums] = useState<SongRow[]>(data);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 /* useEffect(() => {
    const fetchAlbums = async () => {
      const res = await fetch(`/api/albums?page=${page}&limit=6`);
      const data = await res.json();
      setAlbums(data.albums);
      setTotalPages(data.totalPages);
    };
    fetchAlbums();
  }, [page]);*/

  return (
    <div className="py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">💿 Albums Management</h1>
        <Button onClick={() => setOpen(true)}>Upload Album</Button>
      </div>

      <motion.div
        layout
      >
       <DataTable data={albums} />
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-6xl">
          <DialogHeader>
            <DialogTitle>Upload New Album</DialogTitle>
          </DialogHeader>
          <AlbumUploadForm
            onSuccess={() => {
              setOpen(false);
              setPage(1);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
