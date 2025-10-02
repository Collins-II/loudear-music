"use client";

import { useEffect } from "react";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "fluid";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  className,
  style,
}: AdSlotProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={style || { display: "block" }}
      data-ad-client="ca-pub-xxxxxxxxxx" // replace with your publisher ID
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
