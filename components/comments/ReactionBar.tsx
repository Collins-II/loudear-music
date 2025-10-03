"use client";

import { useState } from "react";
import { Heart, Flame, Laugh, ThumbsUp, ThumbsDown } from "lucide-react";
import type { CommentSerialized } from "@/actions/getSongById";

type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

interface Props {
  comment: CommentSerialized;
  userId?: string;
  onToggle: (commentId: string, type: ReactionType) => void;
}

export function ReactionBar({ comment, userId, onToggle }: Props) {
  const [userReactions, setUserReactions] = useState<any>(
    comment.reactions ?? [] // server should return this
  );

  const buttons = [
    { key: "heart", Icon: Heart, title: "Heart", color: "text-red-500" },
    { key: "fire", Icon: Flame, title: "Fire", color: "text-orange-400" },
    { key: "laugh", Icon: Laugh, title: "Haha", color: "text-yellow-400" },
    { key: "up", Icon: ThumbsUp, title: "Upvote", color: "text-green-400" },
    { key: "down", Icon: ThumbsDown, title: "Downvote", color: "text-gray-500" },
  ] as const;

  const handleToggle = (type: ReactionType) => {
    if (!userId) return alert("Sign in to react.");
    const isActive = userReactions.includes(type);

    // Optimistic update
    setUserReactions((prev:any) =>
      isActive ? prev.filter((r:any) => r !== type) : [...prev, type]
    );

    onToggle(comment._id, type);
  };

  return (
    <div
      className="flex gap-3 mt-2 text-xs text-gray-500 items-center"
      role="group"
      aria-label="Reactions"
    >
      {buttons.map((b) => {
        const count = comment.reactions?.[b.key as ReactionType] ?? 0;
        const active = userReactions.includes(b.key as ReactionType);
        return (
          <button
            key={b.key}
            onClick={() => handleToggle(b.key as ReactionType)}
            className={`flex items-center gap-1 transition ${
              active ? `${b.color} font-bold` : "hover:opacity-80"
            }`}
          >
            <b.Icon className="w-4 h-4" />
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
