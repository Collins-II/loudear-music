"use client";

import { useState } from "react";
import { Edit2, Trash2, Flag, User, CornerUpRight, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
//import { ReactionBar } from "./ReactionBar";
import { motion, AnimatePresence } from "framer-motion";
import { CommentSerialized } from "@/actions/getSongById";
import Image from "next/image";

interface Props {
  comment: CommentSerialized;
  userId?: string;
  onReply: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleReaction: (commentId: string, type: any) => void;
  isAdmin?: boolean;
}

export function CommentItem({
  comment,
  userId,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  isAdmin,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const own = userId && comment.user?._id === userId;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-start">
        {comment.user?.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name}
            width={20}
            height={20}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}

        <div className="flex-1">
          <div className="bg-muted rounded-xl px-4 py-3 border shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-gray-900">
                {comment.user?.name}
              </p>
              <div className="flex gap-2">
                {own && (
                  <>
                    <button
                      aria-label="edit"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </button>
                    <button
                      aria-label="delete"
                      onClick={() => onDelete(comment._id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                  </>
                )}
                {!own && (
                  <button
                    aria-label="flag"
                    onClick={() => alert("Flagged for moderation")}
                  >
                    <Flag className="w-4 h-4 text-yellow-500 hover:text-yellow-600" />
                  </button>
                )}
                {isAdmin && (
                  <button
                    aria-label="delete-admin"
                    onClick={() => onDelete(comment._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                aria-label="edit-textarea"
                className="w-full border p-2 rounded mt-2 text-sm"
                defaultValue={comment.content}
                onBlur={(e) => {
                  setIsEditing(false);
                  onEdit(comment._id, e.target.value);
                }}
              />
            ) : (
              <div className="mt-2 prose prose-sm max-w-none text-gray-800">
                <ReactMarkdown>{comment.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* ✅ Actions: reactions + reply */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            {/*<ReactionBar
              comment={comment}
              userId={userId}
              onToggle={onToggleReaction}
            />*/}
            {userId && (
              <button
                onClick={() => onReply(comment._id)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                <CornerUpRight className="h-3.5 w-3.5" />
                Reply
              </button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Hide Replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> Show Replies ({comment.replies.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* ✅ Nested replies with animation */}
          <AnimatePresence>
            {showReplies && comment.replies && comment.replies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="pl-6 mt-3 space-y-3 border-l border-gray-200"
              >
                {comment.replies.map((reply:any) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    userId={userId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleReaction={onToggleReaction}
                    isAdmin={isAdmin}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
