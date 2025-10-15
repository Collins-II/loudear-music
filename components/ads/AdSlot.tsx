"use client";

import { useEffect } from "react";

interface GoogleAdProps {
  slot: string;
  className?: string;
  format?: string;
  responsive?: boolean;
}

export default function GoogleAd({
  slot,
  className,
  format = "auto",
  responsive = true,
}: GoogleAdProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
