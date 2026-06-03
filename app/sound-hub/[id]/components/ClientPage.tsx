"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image, { ImageLoaderProps } from "next/image";
import { Heart, DownloadCloud, Flame, Eye } from "lucide-react";
import { getSocket } from "@/lib/socketClient";
import CustomPlayer from "@/components/music/CustomPlayer";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/components/modals/ShareModal";
import { timeAgo } from "@/lib/utils";
import HorizontalSlider from "@/components/sliders/HorizontalSlider";
import { SliderCard } from "@/components/sliders/SliderCard";
import Comments from "@/components/comments/Comments";
import ChartStatsCard from "@/components/charts/ChartStatsCard";
import SharePanel from "@/components/SharePanel";
import InteractiveButtons from "@/components/interactive-buttons";
import ViewStats from "@/components/stats/ViewStats";
import { handleInteractionUtil } from "@/lib/interactions";
import { useRouter } from "next/navigation";
import { StanButton } from "@/components/auth/StanButton";
import type { User as UserType } from "next-auth";
import PurchaseSheet from "@/components/modals/DownloadModal"; // reuse existing sheet for paid flow
import { BeatSerialized, LicenseTier } from "@/actions/getItemsWithStats";

/**
 * Beat details page
 * - preserves original page structure but adapts to Beat model
 * - shows license tiers with purchase CTA
 * - syncs plays/purchases/downloads via socket
 */


interface ClientPageProps {
  data: BeatSerialized;
  relatedBeats?: BeatSerialized[];
}

export default function BeatDetailsPage({ data, relatedBeats = [] }: ClientPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as UserType | undefined;
  const userId = session?.user?.id;

  // UI state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(data.viewCount ?? 0); // repurpose for likes if you track them elsewhere
  const [purchaseCount, setPurchaseCount] = useState<number>(data.downloadCount ?? 0);
  const [downloadCount, setDownloadCount] = useState<number>(data.downloadCount ?? 0);
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LicenseTier | null>(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // socket: live sync for plays/purchases/downloads and user liked
  useEffect(() => {
    if (!data?._id) return;
    const socket = getSocket();
    socket.emit("join", `beat:${data._id}`);

    const onInteraction = (payload: any) => {
      const itemId = payload.itemId ?? payload.id;
      if (!itemId || itemId !== data._id) return;

      if (payload.counts) {
        if (typeof payload.counts.plays === "number") {
          // don't overwrite local previousViewCount UI
        }
        setPurchaseCount((p) => payload.counts.purchases ?? p);
        setDownloadCount((d) => payload.counts.downloads ?? d);
      }

      if (typeof payload.userLiked !== "undefined") {
        setLiked(Boolean(payload.userLiked));
      }
    };

    socket.on("interaction:update", onInteraction);
    return () => socket.off("interaction:update", onInteraction);
  }, [data?._id]);

  // interactions util (reuse existing)
  const handleInteraction = useCallback(
    (type: "like" | "unlike" | "share" | "download" | "views" | "purchase") => {
      handleInteractionUtil({
        type,
        model: "Beat",
        itemId: data._id,
        userId,
        setLiked,
        setLikeCount, // still used if likes exist
        setDownloadCount,
        onUnauthorized: () => alert("Please sign in to interact."),
      } as any);
    },
    [data?._id, userId]
  );

  // download preview or full audio (client-side)
  const handleDownload = async (full = false) => {
    const url = full ? data.audioUrl : data.audioSnippet;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const u = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = `${typeof data.producer === "string" ? "producer" : (data.producer as any).name} - ${data.title}${full ? '' : ' (preview)'}"`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(u);
      // count as download
      await handleInteraction("download");
    } catch (err) {
      console.error("Download error", err);
    }
  };

  // purchase flow (client side placeholder)
  const handleStartPurchase = (tier: LicenseTier) => {
    setSelectedTier(tier);
    setPurchaseOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedTier) return;
    if (!session) return alert("Please sign in to purchase a license.");
    setProcessingPurchase(true);
    try {
      // placeholder: call your purchase API
      const res = await fetch(`/api/beats/${data._id}/purchase`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tierId: selectedTier.name }),
      });
      if (!res.ok) throw new Error("Purchase failed");

      // optimistic UI update
      setPurchaseCount((c) => c + 1);
      // notify backend via interaction util as well
      await handleInteraction("purchase");
      setPurchaseOpen(false);
      alert(`Purchase successful — ${selectedTier.name}`);
    } catch (err) {
      console.error(err);
      alert("Purchase failed. Try again.");
    } finally {
      setProcessingPurchase(false);
    }
  };

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/beats/${data._id}`;

  const customImageLoader = ({ src, width, quality }: ImageLoaderProps) => {
    try {
      const url = new URL(src);
      if (url.hostname.includes("res.cloudinary.com")) {
        return `${src}?w=${width}&q=${quality || 80}&f=auto`;
      }
      return src;
    } catch {
      return src;
    }
  };

  // helper to format price (assume ZMW currency unit - adapt as needed)
  const formatPrice = (p?: number) => {
    if (p == null) return "Free";
    // if stored in cents, divide by 100 — adjust according to your backend
    return `ZMW ${Number(p).toFixed(2)}`;
  };

  return (
    <main className="bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* MAIN */}
        <section className="lg:col-span-8 space-y-8">
          <div className="italic bg-white dark:bg-neutral-900 dark:border-white/5 overflow-hidden">
            <div className="md:flex items-center gap-6 py-6">
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="relative w-full h-80 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  <Image
                    src={!imgError && data.coverUrl ? data.coverUrl : "/assets/images/placeholder_cover.jpg"}
                    alt={data.title}
                    fill
                    loader={customImageLoader}
                    className="object-cover"
                    onError={() => setImgError(true)}
                    priority
                  />

                  {data.trendingPosition && data.trendingPosition <= 10 && (
                    <div className="absolute left-3 top-3 flex items-center gap-2 bg-gradient-to-r from-pink-600 to-orange-400 px-3 py-1 rounded-full text-xs font-semibold text-white shadow">
                      <Flame size={14} /> HOT
                    </div>
                  )}

                  {typeof data.chartPosition === "number" && (
                    <div className="absolute right-3 top-3 px-3 py-1 rounded-full bg-black/80 text-white text-sm font-bold">
                      #{data.chartPosition}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight capitalize">{data.title}</h1>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      By <span className="font-semibold text-black dark:text-white">{typeof data.producer === 'string' ? data.producer : (data.producer as any).name}</span>
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium text-gray-600">{data.genre}</span> • <span className="text-xs text-gray-500">{timeAgo(data.createdAt)}</span>
                    </p>

                    <div className="mt-2 text-sm text-gray-500">
                      {data.bpm && <span className="mr-3">BPM: <strong>{data.bpm}</strong></span>}
                      {data.key && <span>Key: <strong>{data.key}</strong></span>}
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <Badge className="uppercase px-3 py-1 text-xs">Beat</Badge>
                  </div>
                </div>

                <div className="mt-6 flex flex-col items-start gap-4 flex-wrap">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{data.viewCount ?? 0}</span>
                      <span className="text-xs text-gray-400">plays</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{likeCount}</span>
                      <span className="text-xs text-gray-400">likes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DownloadCloud className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{downloadCount}</span>
                      <span className="text-xs text-gray-400">downloads</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{purchaseCount}</span>
                      <span className="text-xs text-gray-400">purchases</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {data.tags?.map((t, i) => (
                      <Badge onClick={() => router.push(`/search?q=${t.toLocaleLowerCase()}`)} variant="outline" key={i} className="cursor-pointer rounded-full uppercase px-3 py-1 text-xs">{t}</Badge>
                    ))}
                  </div>

                  <StanButton
                    artistId={typeof data.producer === 'string' ? '' : (data.producer as any)._id}
                    initialStanCount={typeof data.producer === 'string' ? 0 : (data.producer as any).stan}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Player with preview + buy CTA */}
          <CustomPlayer
            src={data.audioSnippet}
            title={data.title}
            artist={typeof data.producer === 'string' ? 'Producer' : (data.producer as any).name}
            coverUrl={data.coverUrl}
            onDownload={() => {
              // preview download
              handleDownload(false);
            }}
            //onPlayChange={(playing: boolean) => setPreviewPlaying(playing)}
          />

          <div className="flex items-center justify-between flex-wrap">
            <InteractiveButtons
              liked={liked}
              downloading={false}
              price={ 20}
              handleDownload={() => handleDownload(false)}
              handleInteraction={() => handleInteraction("like")}
            />

            <ViewStats current={data.viewCount as number} previous={data.previousViewCount as number} />
          </div>

          {/* About / description */}
          {data.description && (
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <h3 className="mt-6 text-2xl md:text-3xl font-extrabold">About this beat</h3>
              <p className="italic">{data.description}</p>
            </article>
          )}

          {/* License tiers 
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Licenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(selectedTier : [{ id: 'default', title: 'Standard', price: data.price ?? 0, description: 'Single beat license' }]).map((tier) => (
                <div key={tier.id} className="rounded-lg border p-4 bg-white dark:bg-neutral-900">
                  <h4 className="font-semibold">{tier.title}</h4>
                  <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
                  {tier.usageRights && tier.usageRights.length > 0 && (
                    <ul className="text-xs mt-2 list-disc list-inside text-gray-500">
                      {tier.usageRights.map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-bold">{formatPrice(tier.price)}</div>
                    <button onClick={() => handleStartPurchase(tier)} className="px-3 py-2 rounded-md bg-black text-white">Buy</button>
                  </div>
                </div>
              ))}
            </div>
            
          </div> */}

          {/* Related beats */}
          {relatedBeats?.length > 0 && (
            <div className="mt-6">
              <HorizontalSlider title="You might also like">
                {relatedBeats.map((beat) => (
                  <SliderCard
                    key={beat._id}
                    id={beat._id}
                    title={beat.title}
                    artist={typeof beat.producer === 'string' ? 'Producer' : (beat.producer as any).name}
                    cover={beat.coverUrl as string}
                    downloads={beat.downloadCount as number}
                    publishedAt={beat.createdAt as string}
                    genre={beat.genre}
                    views={beat.viewCount}
                    href={`/beats/${beat._id}`}
                  />
                ))}
              </HorizontalSlider>
            </div>
          )}

          {/* Comments */}
          <div className="mt-8">
            <Comments model="Beat" id={data._id} initialComments={[]} user={user as UserType} />
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-6">
            <SharePanel
              userId={userId as string}
              title={data.title}
              artist={typeof data.producer === 'string' ? 'Producer' : (data.producer as any).name}
              shareCount={0}
              onShare={() => handleInteraction("share")}
            />

            <ChartStatsCard
              data={{
                trendingPosition: data.trendingPosition,
                chartPosition: data.chartPosition,
                peak: data.chartHistory?.[0]?.peak,
                plays: data.viewCount,
                likes: likeCount,
                shares: 0,
                downloads: downloadCount,
              }}
            />

            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white text-center">
              <h5 className="font-bold">Promote your beats</h5>
              <p className="text-sm mt-1">Featured placements and sync opportunities available.</p>
              <button onClick={() => router.push('/promote')} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md">Learn more</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={pageUrl}
        title={data.title}
      />

      <PurchaseSheet
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        price={selectedTier?.price ?? 0}
        coverUrl={data.coverUrl}
        title={data.title}
        artist={typeof data.producer === 'string' ? 'Producer' : (data.producer as any).name}
        artistId={typeof data.producer === 'string' ? '' : (data.producer as any)._id}
        mediaId={data._id}
        mediaType="beat"
        onDownload={() => handleDownload(true)}
        onPaidDownload={handleConfirmPurchase}
      />
    </main>
  );
}
