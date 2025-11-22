"use client";
import { useEffect, useState } from "react";
import { TrendingItem } from "@/app/search/components/IndexSearch";
import { TopRecordsBoard } from "./analytics/TopRecords";

const CardList = () => {
    const [trending, setTrending] = useState<TrendingItem[]>([]);
    const [loading, setLoading] = useState(false);
     /* 🧠 Fetch trending */
      useEffect(() => {
        setLoading(true)
        fetch("/api/trending/global/user?limit=5")
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => setTrending(data.items || []))
          .catch(() => {})
          .finally(() => setLoading(false));
      }, []);

  return (
    <div className="">
      <TopRecordsBoard list={trending} loading={loading} />
    </div>
  );
};

export default CardList;
