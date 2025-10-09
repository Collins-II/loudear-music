"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import ButtonCircle from "../shared/ButtonCircle";
import Input from "../shared/Input";

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
     
<div className="relative w-full">
  <div className="flex items-center bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all duration-200">
    {/* Text Input */}
    <Input
      fontClass=""
      sizeClass="h-16 px-5 py-4"
      rounded="rounded-3xl"
      placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
    />

    {/* Send / Reply Button */}
    <ButtonCircle
      onClick={handleSubmit}
      disabled={isSending || !text.trim()}
      className={`flex items-center justify-center shrink-0 w-12 h-12 m-2 rounded-full transition-all duration-300 
        ${
          isSending
            ? "bg-gray-300 dark:bg-neutral-700 cursor-not-allowed"
            : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        }`}
    >
      {isSending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ArrowRightIcon className="w-5 h-5" />
      )}
    </ButtonCircle>
  </div>
</div>

    </div>
  );
}
