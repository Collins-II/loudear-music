// lib/interactions.ts
export type InteractionType = "like" | "unlike" | "share" | "download" | "views";

interface InteractionParams {
  type: InteractionType;
  model: string; // e.g., "Song", "Video", "Property"
  itemId: string;
  userId?: string;
  setLiked?: (v: (prev: boolean) => boolean) => void;
  setLikeCount?: (v: (prev: number) => number) => void;
  setDownloadCount?: (v: (prev: number) => number) => void;
  onUnauthorized?: () => void;
}

export async function handleInteractionUtil({
  type,
  model,
  itemId,
  userId,
  setLiked,
  setLikeCount,
  setDownloadCount,
  onUnauthorized,
}: InteractionParams): Promise<void> {
  if (!userId) {
    if (onUnauthorized) return onUnauthorized();
    alert("Please sign in to interact.");
    return;
  }

  try {
    // 🔄 Optimistic UI updates
    if (type === "like") {
      setLiked?.((prev) => !prev);
      setLikeCount?.((prev) => (prev ? Math.max(0, prev - 1) : prev + 1));
    } else if (type === "download") {
      setDownloadCount?.((prev) => prev + 1);
    }

    // 🚀 API call
    const res = await fetch(`/api/interactions/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, model, userId }),
    });

    if (!res.ok) {
      console.error("❌ Interaction failed:", res.statusText);
    }
  } catch (err) {
    console.error("⚠️ Interaction error:", err);
  }
}
