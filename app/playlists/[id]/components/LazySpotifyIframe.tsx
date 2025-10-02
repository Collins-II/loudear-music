import { useState, useRef, useEffect } from "react";

interface LazySpotifyIframeProps {
  playlistId: string;
  title: string;
}

export function LazySpotifyIframe({ playlistId, title }: LazySpotifyIframeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="
        w-full 
        overflow-hidden 
        rounded-xl 
        shadow-lg 
        bg-gray-100 
        flex 
        items-center 
        justify-center
        aspect-[3/4]   /* Mobile default */
        sm:aspect-[4/5] /* Tablet */
        md:aspect-[16/9] /* Desktop */
      "
    >
      {isVisible ? (
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          title={title}
          className="w-full h-full rounded-xl"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      ) : (
        <span className="text-gray-500 text-center px-4">
          Loading Spotify playlist…
        </span>
      )}
    </div>
  );
}
