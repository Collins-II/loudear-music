// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  // Ideally call OpenAI or your internal LLM to generate short ad copy
  // Placeholder simple echo / template:
  const copy = `🔥 New release! ${prompt}. Stream now — limited time!`;
  return NextResponse.json({ copy });
}
