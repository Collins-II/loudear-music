"use server";

import { incrementInteraction } from "@/actions/getSongById";

export async function handleInteraction(
  id: string,
  model: "Song" | "Album" | "Video",
  type: "view" | "like" | "download" | "share"
) {
  try {
    await incrementInteraction(id, model, type);
    return { success: true };
  } catch (err: any) {
    console.error("[Interaction Error]", err);
    return { success: false, error: err.message };
  }
}
