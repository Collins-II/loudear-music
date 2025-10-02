"use client";

import { useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  replyTo?: string | null;
  onCancelReply?: () => void;
  isSending?: boolean;
}

export function Composer({ onSubmit, replyTo, onCancelReply, isSending }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await onSubmit(text);
    setText("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {replyTo && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
          <span className="text-xs text-blue-600 font-medium">
            Replying to a comment
          </span>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>
      )}

      <Textarea
        placeholder={replyTo ? "Write your reply..." : "Write a comment..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSending || !text.trim()}
          className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {replyTo ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );
}
