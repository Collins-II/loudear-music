"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import { Composer } from "./Composer";
import { CommentItem } from "./CommentItem";
import { getSocket } from "@/lib/socketClient";
import type { CommentSerialized } from "@/actions/getItemsWithStats";
import type { User as UserType } from "next-auth";
import Image from "next/image";

type ReactionType = "heart" | "fire" | "laugh" | "up" | "down";

interface CommentsProps {
  model: "Song" | "Post" | "Video" | "Album" | string;
  id: string;
  initialComments: CommentSerialized[];
  user?: UserType;
  isAdmin?: boolean;
}

export default function Comments({
  model,
  id,
  initialComments,
  user,
  isAdmin = false,
}: CommentsProps) {
  const [comments, setComments] = useState<CommentSerialized[]>(initialComments || []);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  /** ----------------------
   * Socket Setup
   * ---------------------- */
  useEffect(() => {
    if (!id || !model) return;
    const socket = getSocket();
    const room = `${model}:${id}`;
    socket.emit("join", room);

    socket.on(
      "comment:new",
      (payload: { room: string; comment: CommentSerialized; parent?: string | null; tempId?: string }) => {
        if (payload.room !== room) return;

        setComments((prev) => {
          const replaceOrAdd = (list: CommentSerialized[]): CommentSerialized[] =>
            list.map((c) => {
              // Replace temp with real comment
              if (payload.tempId && c._id === payload.tempId) {
                return { ...payload.comment };
              }
              return {
                ...c,
                replies: c.replies ? replaceOrAdd(c.replies) : [],
              };
            });

          // Check if already exists
          const exists = prev.some(
            (c) => c._id === payload.tempId || c._id === payload.comment._id
          );

          if (!payload.parent) {
            return exists ? replaceOrAdd(prev) : [payload.comment, ...prev];
          }

          const attachReply = (list: CommentSerialized[]): CommentSerialized[] =>
            list.map((c) =>
              c._id === payload.parent
                ? {
                    ...c,
                    replies: exists
                      ? replaceOrAdd(c.replies || [])
                      : [payload.comment, ...(c.replies || [])],
                  }
                : { ...c, replies: c.replies ? attachReply(c.replies) : [] }
            );

          return attachReply(prev);
        });
      }
    );

    socket.on("comment:reaction", (payload: { commentId: string; reactions: Record<ReactionType, number> }) => {
      const updateReactions = (list: CommentSerialized[]): CommentSerialized[] =>
        list.map((c) =>
          c._id === payload.commentId
            ? { ...c, reactions: payload.reactions }
            : { ...c, replies: c.replies ? updateReactions(c.replies) : [] }
        );
      setComments((prev) => updateReactions(prev));
    });

    socket.on("comment:update", (payload: { id: string; content: string }) => {
      const updateContent = (list: CommentSerialized[]): CommentSerialized[] =>
        list.map((c) =>
          c._id === payload.id
            ? { ...c, content: payload.content }
            : { ...c, replies: c.replies ? updateContent(c.replies) : [] }
        );
      setComments((prev) => updateContent(prev));
    });

    socket.on("comment:delete", (payload: { id: string }) => {
      const removeComment = (list: CommentSerialized[]): CommentSerialized[] =>
        list
          .filter((c) => c._id !== payload.id)
          .map((c) => ({ ...c, replies: c.replies ? removeComment(c.replies) : [] }));
      setComments((prev) => removeComment(prev));
    });

    return () => {
      socket.emit("leave", room);
      socket.off("comment:new");
      socket.off("comment:reaction");
      socket.off("comment:update");
      socket.off("comment:delete");
    };
  }, [id, model]);

  /** ----------------------
   * Submit Comment
   * ---------------------- */
  const handleSubmit = async (text: string, parent?: string | null): Promise<void> => {
    if (!text.trim() || !user?.id) return;
    setIsSending(true);

   /* const tempId = `temp-${Date.now()}`;
    const tempComment: CommentSerialized = {
      _id: tempId,
      content: text,
      user: {
        _id: user.id,
        name: user.name || "You",
        image: typeof user.image === "string" ? user.image : undefined,
      },
      targetModel: model as "Song" | "Album" | "Video" | "Post",
      targetId: id,
      parent: parent ?? null,
      likes: [],
      likeCount: 0,
      replyCount: 0,
      replies: [],
      reactions: { heart: 0, fire: 0, laugh: 0, up: 0, down: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setComments((prev) =>
      parent
        ? prev.map((c) =>
            c._id === parent
              ? { ...c, replies: [tempComment, ...(c.replies || [])] }
              : c
          )
        : [tempComment, ...prev]
    );*/

    try {
      await fetch("/api/interactions/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          model,
          userId: user.id,
          content: text,
          parent: parent ?? null,
          //tempId,
        }),
      });
      setReplyTo(null);
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSending(false);
    }
  };

  /** ----------------------
   * Other Actions
   * ---------------------- */
  const handleEdit = async (commentId: string, text: string): Promise<void> => {
    try {
      await fetch(`/api/interactions/comment/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, userId: user?.id }),
      });
    } catch (err) {
      console.error("Error editing comment:", err);
    }
  };

  const handleDelete = async (commentId: string): Promise<void> => {
    try {
      await fetch(`/api/interactions/comment/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleToggleReaction = async (commentId: string, type: ReactionType): Promise<void> => {
    if (!user?.id) {
      alert("Please sign in to react.");
      return;
    }
    try {
      await fetch("/api/interactions/comment-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: commentId, type, userId: user.id }),
      });
    } catch (err) {
      console.error("Error toggling reaction:", err);
    }
  };

  /** ----------------------
   * Render
   * ---------------------- */
  return (
    <div className="space-y-6">
      <h3 className="w-full relative text-slate-900 text-xl md:text-2xl font-extrabold tracking-tight mb-6">
        <span className="relative z-10 bg-white pr-3">Comments</span>
        <span className="hidden md:block absolute left-0 top-1/2 w-full h-[4px] bg-black -z-0"></span>
      </h3>

      {/* Root Composer */}
      <div className="flex gap-3 items-start">
        <div className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {user?.image ? (
            <Image
              src={user.image}
              alt="user-profile-image"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <Composer
          onSubmit={(text) => handleSubmit(text)}
          isSending={isSending && !replyTo}
        />
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 font-medium">
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </p>

      {/* Comment List */}
      <AnimatePresence>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <motion.div
              key={c._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <CommentItem
                comment={c}
                userId={user?.id}
                onReply={setReplyTo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleReaction={handleToggleReaction}
                isAdmin={isAdmin}
              />
              {replyTo === c._id && (
                <div className="ml-12 mt-2">
                  <Composer
                    onSubmit={(text) => handleSubmit(text, c._id)}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    isSending={isSending}
                  />
                </div>
              )}
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
