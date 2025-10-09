"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Flag,
  CornerUpRight,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CommentSerialized } from "@/actions/getItemsWithStats";

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex space-x-4 py-4 border-b border-neutral-200 dark:border-neutral-700"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.user?.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {comment.user?.name || "Anonymous"}
            </p>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {own && (
              <>
                <button
                  aria-label="edit"
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:text-blue-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  aria-label="delete"
                  onClick={() => onDelete(comment._id)}
                  className="p-1 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {!own && (
              <button
                aria-label="flag"
                onClick={() => alert("Flagged for moderation")}
                className="p-1 hover:text-yellow-500 transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            {isAdmin && (
              <button
                aria-label="admin-delete"
                onClick={() => onDelete(comment._id)}
                className="p-1 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Text */}
        <div className="mt-2">
          {isEditing ? (
            <textarea
              aria-label="edit-textarea"
              className="w-full border border-neutral-300 dark:border-neutral-600 bg-transparent rounded-lg p-2 text-sm text-neutral-800 dark:text-neutral-200"
              defaultValue={comment.content}
              onBlur={(e) => {
                setIsEditing(false);
                onEdit(comment._id, e.target.value);
              }}
              autoFocus
            />
          ) : (
            <ReactMarkdown >
              {comment.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions: Reply & Replies Toggle */}
        <div className="flex items-center gap-4 mt-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {userId && (
            <button
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1 hover:text-blue-500 transition"
            >
              <CornerUpRight className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 hover:text-blue-500 transition"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide Replies
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Show Replies (
                  {comment.replies.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Replies */}
        <AnimatePresence>
          {showReplies && comment.replies && comment?.replies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-6 mt-3 space-y-4 border-l border-neutral-200 dark:border-neutral-700"
            >
              {comment.replies.map((reply: any) => (
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
    </motion.div>
  );
}
