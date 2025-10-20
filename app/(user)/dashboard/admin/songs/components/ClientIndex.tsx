"use client";

import { useState} from "react";
import { motion } from "framer-motion";
import { DataTable} from "@/components/data-table";

// ✅ Import the schema used by your DataTable

// ✅ Infer TS type directly from schema so it matches

interface IndexProps {
    data: any
}

export default function ClientIndex({ data }: IndexProps) {
  const [songs] = useState(data);
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
      <motion.div layout>
        {/* ✅ DataTable now receives normalized schema */}
        <DataTable type="song" initialData={songs as any} />
      </motion.div>
    </div>
  );
}
