import React from "react";
import { ExternalLink, BarChart3, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YTStat } from "@/data/types";


function VideoCard({ videoId, stat }: { videoId: string; stat?: YTStat }) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  return (
    <Card className="border-white/10 bg-white/5 text-white backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-base font-semibold">
          {stat?.title || "YouTube Video"}
        </CardTitle>
        <div className="text-xs text-white/70">
          <span className="mr-2">{stat?.channelTitle || "Channel"}</span>
          {stat?.publishedAt && (
            <span>• {new Date(stat.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={stat?.title || videoId}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />{stat?.viewCount?.toLocaleString() ?? "—"} views</span>
            <span className="inline-flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />{stat?.likeCount?.toLocaleString() ?? "—"} likes</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{stat?.commentCount?.toLocaleString() ?? "—"} comments</span>
          </div>
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
            Watch <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default VideoCard;