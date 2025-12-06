"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, CreditCard } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { getCurrencySymbol, formatNumberWithCommas } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import crypto from "crypto";

/**
 * UNIVERSAL MEDIA MONETIZATION FLOW
 * ---------------------------------
 * This version supports MEDIA purchases for:
 *  - song
 *  - beat
 *  - album
 *  - video
 *
 * Backend receives:
 *
 * POST /api/mobile-money/pay
 * {
 *   provider,
 *   phone,
 *   amount,
 *   currency,
 *   reference,
 *   idempotencyKey,
 *   artistId,
 *   metadata: {
 *     mediaId: "...",
 *     mediaType: "song" | "beat" | "album" | "video",
 *     title,
 *     artistId
 *   }
 * }
 */

type MonetizedDownloadSheetProps = {
  open: boolean;
  onClose: () => void;

  /** Price for this media item */
  price: number;

  /** Display info */
  coverUrl?: string;
  title?: string;
  artist?: string;

  /** Universal media identifiers */
  mediaId: string;
  mediaType: "song" | "beat" | "album" | "video";

  /** Who receives the money */
  artistId?: string | null;

  /** Download handlers */
  onPaidDownload?: () => void;
  onDownload: () => void;

  animationData?: any | null;
};

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 20;

export default function MonetizedDownloadSheet({
  open,
  onClose,
  price,
  coverUrl,
  title,
  artist,
  mediaId,
  mediaType,
  artistId,
  onPaidDownload,
  onDownload,
  animationData = null,
}: MonetizedDownloadSheetProps) {
  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );
  const convertPrice = useConvertPrice();

  const [processing, setProcessing] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mmProvider, setMmProvider] = useState<"MTN" | "Airtel" | null>(null);
  const [mmPhone, setMmPhone] = useState("");
  const [mmStep, setMmStep] =
    useState<"form" | "initiated" | "confirming" | "done">("form");

  const [currentTxId, setCurrentTxId] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement | null>(null);

  /** Dynamic animation if provided */
  const Lottie = animationData
    ? dynamic(() => import("lottie-react").then((m) => m.default), {
        ssr: false,
        loading: () => null,
      })
    : null;

  const vibrate = (pattern: number | number[] = 10) => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator)
        navigator.vibrate(pattern);
    } catch {}
  };

  /**
   * Reset when closed
   */
  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setPaid(false);
      setError(null);
      setMmProvider(null);
      setMmPhone("");
      setMmStep("form");
      setCurrentTxId(null);
    } else {
      setTimeout(() => sheetRef.current?.focus(), 120);
    }
  }, [open]);

  /**
   * ESC closes sheet
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /**
   * Disable background scrolling
   */
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  /**
   * CARD CHECKOUT
   */
  const handleCardPayment = async () => {
    setCardProcessing(true);
    try {
      const payload = {
        name: title ?? "Media Purchase",
        price: Math.round(price * 100),
        quantity: 1,
        currency: selectedCurrency,
        mediaId,
        mediaType,
        image: coverUrl ?? null,
        artistId,
      };

      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error("Checkout failed");

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError((err as any)?.message ?? "Checkout failed. Try again.");
    } finally {
      setCardProcessing(false);
    }
  };

  /**
   * Download after success
   */
  const finishPaymentSuccess = async () => {
    setPaid(true);
    onPaidDownload?.();
    vibrate([10, 20, 10]);

    try {
      await onDownload();
    } catch (err) {
      console.error("Auto-download failed", err);
      setError("Payment succeeded but automatic download failed.");
    }
  };

  /**
   * POLLING
   */
  async function pollTransactionStatus(
    txId: string,
    attempts = 0
  ): Promise<"completed" | "failed" | "pending"> {
    try {
      const res = await fetch(
        `/api/mobile-money/test-pay/status?txId=${encodeURIComponent(txId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) return "pending";

      const json = await res.json();
      const status = json?.status;
      if (status === "completed") return "completed";
      if (status === "failed") return "failed";

      if (attempts >= POLL_MAX_ATTEMPTS) return "pending";
    } catch {}

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    return pollTransactionStatus(txId, attempts + 1);
  }

  /**
   * MOBILE MONEY INITIATION
   */
  const submitMobileMoney = async () => {
    setError(null);

    if (!mmProvider) return setError("Select a provider");
    if (!/^\d{7,15}$/.test(mmPhone)) return setError("Enter a valid phone number");

    setProcessing(true);
    setMmStep("initiated");

    const idempotencyKey =
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const payload = {
        provider: mmProvider,
        phone: mmPhone,
        amount: Number(price),
        currency: selectedCurrency,
        purpose: "media_purchase",
        reference: `loudear_${idempotencyKey}`,
        idempotencyKey,

        artistId,

        metadata: {
          mediaId,
          mediaType,
          title,
          artistId,
        },
      };

      const res = await fetch("/api/mobile-money/test-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to initiate");

      const txId =
        json.transactionId ?? json.transaction_id ?? json.txId ?? null;

      setCurrentTxId(txId);
      setMmStep("confirming");

      const final = await pollTransactionStatus(txId);
      if (final === "completed") {
        await finishPaymentSuccess();
        setMmStep("done");
      } else if (final === "failed") {
        setError("Payment failed. Try again.");
        setMmStep("form");
      } else {
        setError("Payment pending. Check your phone.");
      }
    } catch (err: any) {
      console.error("[MM_ERROR]", err);
      setError(err?.message ?? "Mobile money failed");
      setMmStep("form");
    } finally {
      setProcessing(false);
    }
  };

  const confirmMtn = async () => {
    if (!currentTxId) return setError("No transaction to confirm");

    setProcessing(true);
    setMmStep("confirming");

    try {
      const final = await pollTransactionStatus(currentTxId);
      if (final === "completed") {
        await finishPaymentSuccess();
        setMmStep("done");
      } else if (final === "failed") {
        setError("Payment failed.");
        setMmStep("form");
      } else {
        setError("Still pending. Check your phone.");
      }
    } catch {
      setError("Could not confirm.");
      setMmStep("form");
    } finally {
      setProcessing(false);
    }
  };

  const simulateLocalCancel = () => {
    setMmProvider(null);
    setMmPhone("");
    setMmStep("form");
    setCurrentTxId(null);
    setError(null);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 150) onClose();
  };

  /**
   * UI
   */
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative w-full max-w-2xl mx-4 md:mx-auto rounded-t-2xl shadow-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-white/10 dark:border-neutral-800 p-4 md:p-6"
          >
            {/* HEADER */}
            <div className="w-full flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-gray-300/60 dark:bg-neutral-700/60 mb-3" />
            </div>

            {/* MEDIA INFO */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={title ?? "cover"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      🎵
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-sm md:text-base font-semibold truncate">
                    {title}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">
                    {artist}
                  </div>
                </div>
              </div>

              <button
                aria-label="close-button"
                onClick={() => {
                  vibrate(6);
                  onClose();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRICE */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-50 to-violet-50 dark:from-neutral-800 dark:to-neutral-800/60">
                  {animationData && Lottie ? (
                    <Lottie animationData={animationData} loop style={{ width: 48, height: 48 }} />
                  ) : (
                    <motion.div
                      className="w-8 h-8"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    >
                      💿
                    </motion.div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-gray-500">One-time purchase</div>
                  <div className="text-lg font-semibold">
                    {getCurrencySymbol(selectedCurrency)}
                    {formatNumberWithCommas(convertPrice(Number(price)))}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-gray-400">Secure • Instant</div>
            </div>

            {/* CARD PAYMENT */}
            <div className="mt-5">
              <button
                onClick={handleCardPayment}
                disabled={cardProcessing || paid}
                className={`w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  cardProcessing || paid
                    ? "opacity-60 bg-gray-200 dark:bg-neutral-800"
                    : "bg-black text-white hover:shadow-lg"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {cardProcessing ? "Processing…" : paid ? "Purchased" : "Pay with Card"}
              </button>
            </div>

            {/* MOBILE MONEY */}
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Mobile Money (Zambia)</div>

              {/* Provider buttons */}
              <div className="grid grid-cols-2 gap-2">
                {(["MTN", "Airtel"] as const).map((provider) => {
                  const isActive = mmProvider === provider;
                  return (
                    <button
                      key={provider}
                      onClick={() => {
                        setMmProvider(provider);
                        setMmStep("form");
                        setMmPhone("");
                        vibrate(6);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold border ${
                        isActive
                          ? "ring-2 ring-indigo-400 bg-indigo-50 dark:bg-neutral-800"
                          : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <div className="w-6 h-6 relative">
                        <Image
                          src={
                            provider === "MTN"
                              ? "/assets/logo/mtn.svg"
                              : "/assets/logo/airtel.svg"
                          }
                          alt={provider}
                          fill
                          className="object-contain"
                        />
                      </div>
                      {provider === "MTN" ? "MTN Mobile Money" : "Airtel Money"}
                    </button>
                  );
                })}
              </div>

              {/* Provider input section */}
              {mmProvider && (
                <div className="mt-3 p-3 rounded-md bg-white dark:bg-neutral-900 border">
                  {mmStep === "form" && (
                    <>
                      <div className="text-xs text-gray-500 mb-2">
                        Enter phone number for {mmProvider}.
                      </div>

                      <input
                        type="tel"
                        value={mmPhone}
                        onChange={(e) =>
                          setMmPhone(e.target.value.replace(/[^\d]/g, ""))
                        }
                        placeholder="e.g. 0971000000"
                        className="w-full px-3 py-2 rounded-md bg-white dark:bg-neutral-900 border text-sm"
                      />

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={submitMobileMoney}
                          disabled={processing}
                          className="flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white"
                        >
                          {processing
                            ? "Processing…"
                            : `Pay ${new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: selectedCurrency,
                              }).format(price)}`}
                        </button>

                        <button
                          onClick={simulateLocalCancel}
                          className="px-3 py-2 rounded-md border"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}

                  {mmStep === "initiated" && (
                    <div className="text-sm text-gray-600">
                      Payment initiated — check your phone.
                    </div>
                  )}

                  {mmStep === "confirming" && (
                    <>
                      <div className="text-sm font-medium mb-2">Confirm Payment</div>
                      <div className="text-xs text-gray-500 mb-3">
                        Approve the prompt on your {mmProvider} phone.
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={confirmMtn}
                          disabled={processing}
                          className="flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => setMmStep("form")}
                          className="px-3 py-2 rounded-md border"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}

                  {mmStep === "done" && (
                    <div className="text-sm text-green-600">
                      Payment successful — download starting…
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Errors & Success Messages */}
            {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

            {paid && !error && (
              <div className="mt-4 text-sm text-green-600">
                Thank you! Your download is starting…
              </div>
            )}

            <div className="mt-4 text-xs text-gray-400">
              By purchasing you agree to the{" "}
              <button className="underline">Terms</button> and{" "}
              <button className="underline">Privacy Policy</button>.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
