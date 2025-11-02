// pages/api/youtube.ts

import type { NextApiRequest, NextApiResponse } from "next";

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;  // e.g. "youtube-music-api3.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_HOST || !RAPIDAPI_KEY) {
  throw new Error("Missing RAPIDAPI_HOST or RAPIDAPI_KEY in env");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).json({ error: "Missing 'path' query param" });
  }

  const url = `https://${RAPIDAPI_HOST}${path}`;

  try {
    const apiRes = await fetch(url, {
      headers: {
        "X-RapidAPI-Host": RAPIDAPI_HOST as string,
        "X-RapidAPI-Key": RAPIDAPI_KEY as string ,
      },
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error("Proxy error:", apiRes.status, text);
      return res
        .status(apiRes.status)
        .json({ error: `Upstream error: ${apiRes.statusText}`, details: text });
    }

    const json = await apiRes.json();

    // Set caching if desired — e.g. 5 min
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");

    return res.status(200).json(json);
  } catch (error) {
    console.error("Proxy fetch failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
