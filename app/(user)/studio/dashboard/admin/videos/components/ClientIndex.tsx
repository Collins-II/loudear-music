"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DataTable } from "@/components/data-table";

interface IndexProps {
    data: any[]
}

export default function VideoIndex({ data }: IndexProps) {
  const [videos ] = useState(data);

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

      <motion.div
        layout
      >
       <DataTable type="video" initialData={videos as any} />
      </motion.div>
    </div>
  );
}
