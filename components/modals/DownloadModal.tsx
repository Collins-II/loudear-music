"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, CreditCard} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { getCurrencySymbol, formatNumberWithCommas } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

type MonetizedDownloadSheetProps = {
open: boolean;
onClose: () => void;
price?: number;
coverUrl?: string;
title?: string;
artist?: string;
beatId?: string;
licenseId?: string;
onPaidDownload?: () => void;
onDownload: () => void;
animationData?: any | null;
};

export default function MonetizedDownloadSheet({
open,
onClose,
price = 1.49,
coverUrl,
title,
artist,
beatId,
licenseId,
onPaidDownload,
onDownload,
animationData = null,
}: MonetizedDownloadSheetProps) {
const selectedCurrency = useSelector((state: RootState) => state.currency.selectedCurrency);
const convertPrice = useConvertPrice();
const [processing, setProcessing] = useState(false);
const [paid, setPaid] = useState(false);
const [error, setError] = useState<string | null>(null);

const [mmProvider, setMmProvider] = useState<string | null>(null);
const [mmPhone, setMmPhone] = useState("");
const [mmStep, setMmStep] = useState<"form" | "confirm" | "done">("form");

const sheetRef = useRef<HTMLDivElement | null>(null);

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

useEffect(() => {
if (!open) {
setProcessing(false);
setPaid(false);
setError(null);
setMmProvider(null);
setMmPhone("");
setMmStep("form");
} else {
setTimeout(() => sheetRef.current?.focus(), 120);
}
}, [open]);

useEffect(() => {
const onKey = (e: KeyboardEvent) => {
if (e.key === "Escape") onClose();
};
if (open) window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [open, onClose]);

useEffect(() => {
if (!open) return;
const orig = document.body.style.overflow;
document.body.style.overflow = "hidden";
return () => {
document.body.style.overflow = orig;
};
}, [open]);

const handleCardPayment = async () => {
setProcessing(true);
try {
const payload = {
name: title || "Beat License",
price: Math.round(price * 100),
quantity: 1,
currency: selectedCurrency,
beatId: beatId ?? null,
licenseId: licenseId ?? null,
image: coverUrl ?? null,
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
  alert("Checkout failed. Try again.");
} finally {
  setProcessing(false);
}

};

const finishPaymentSuccess = async () => {
setPaid(true);
onPaidDownload?.();
vibrate([10, 20, 10]);

try {
  onDownload();
} catch (err) {
  console.error("Auto-download failed", err);
  setError("Payment succeeded but automatic download failed.");
}

};

const simulateMtnMoMo = async () => {
setProcessing(true);
setError(null);
await new Promise((r) => setTimeout(r, 1200));
setMmStep("confirm");
setProcessing(false);
};

const confirmMtn = async () => {
setProcessing(true);
await new Promise((r) => setTimeout(r, 1000));
await finishPaymentSuccess();
setMmStep("done");
setProcessing(false);
};

const simulateAirtel = async () => {
setProcessing(true);
await new Promise((r) => setTimeout(r, 1000));
await finishPaymentSuccess();
setMmStep("done");
setProcessing(false);
};

const simulateZamtel = async () => {
setProcessing(true);
await new Promise((r) => setTimeout(r, 1000));
await finishPaymentSuccess();
setMmStep("done");
setProcessing(false);
};

const submitMobileMoney = async () => {
if (!mmProvider) return setError("Select a provider");
if (!/^\d{9,15}$/.test(mmPhone)) return setError("Enter a valid phone");

setError(null);

switch (mmProvider) {
  case "MTN":
    await simulateMtnMoMo();
    break;
  case "AIRTEL":
    await simulateAirtel();
    break;
  case "ZAMTEL":
    await simulateZamtel();
    break;
  default:
    setError("Unsupported provider");
}

};

const handleDragEnd = (_: any, info: PanInfo) => {
if (info.offset.y > 150) onClose();
};

return ( <AnimatePresence>
{open && ( <div className="fixed inset-0 z-[60] flex items-end justify-center">
<motion.div
className="absolute inset-0 bg-black/50 backdrop-blur-sm"
initial={{ opacity: 0 }}
animate={{ opacity: 0.55 }}
exit={{ opacity: 0 }}
onClick={onClose}
/>

```
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
        className="relative w-full max-w-2xl mx-4 md:mx-auto rounded-t-2xl shadow-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-white/10 dark:border-neutral-800 p-4 md:p-6"
      >
        {/* HEADER */}
        <div className="w-full flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-gray-300/60 dark:bg-neutral-700/60 mb-3" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800 flex-shrink-0">
              {coverUrl ? (
                <Image src={coverUrl} alt={title ?? "cover"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  🎵
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm md:text-base font-semibold truncate">{title}</div>
              <div className="text-xs md:text-sm text-gray-500 truncate">{artist}</div>
            </div>
          </div>

          <button
            onClick={() => {
              vibrate(6);
              onClose();
            }}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100/60 dark:hover:bg-neutral-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRICE & ANIMATION */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-50 to-violet-50 dark:from-neutral-800 dark:to-neutral-800/60">
              {animationData && Lottie ? (
                <Lottie animationData={animationData} loop style={{ width: 48, height: 48 }} />
              ) : (
                <motion.svg
                  initial={{ scale: 0.98, opacity: 0.9 }}
                  animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                  fill="none"
                >
                  <motion.circle cx="12" cy="12" r="9" stroke="url(#g)" strokeWidth="1.5" />
                  <defs>
                    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              )}
            </div>

            <div>
              <div className="text-xs text-gray-500">One-time purchase</div>
              <div className="text-lg font-semibold">
                {price
                ? `${getCurrencySymbol(selectedCurrency)}${formatNumberWithCommas(convertPrice(Number(price)))}`
                : "Free"}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-gray-400">
            Secure • Encrypted • Instant
          </div>
        </div>

        {/* PRIMARY ACTIONS */}
        <div className="mt-5 grid gap-3">
          <button
            onClick={handleCardPayment}
            disabled={processing || paid}
            className={`w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
              ${processing || paid ? "opacity-60 bg-gray-100 dark:bg-neutral-800" : "bg-black text-white hover:shadow-lg"}
            `}
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {processing
                ? "Processing…"
                : paid
                ? "Purchased"
                : `Pay with Card · ${new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: selectedCurrency,
                  }).format(price)}`}
            </span>
          </button>
        </div>

        {/* MOBILE MONEY SECTION */}
        <div className="mt-6">
          <div className="text-sm font-medium mb-2">Mobile Money (Zambia)</div>

          <div className="grid grid-cols-3 gap-2">
            {["MTN", "AIRTEL", "ZAMTEL"].map((provider) => (
              <button
                key={provider}
                onClick={() => {
                  setMmProvider(provider);
                  setMmStep("form");
                  setMmPhone("");
                  vibrate(6);
                }}
                className={`py-2 rounded-md text-sm font-semibold ${
                  mmProvider === provider
                    ? "ring-2 ring-indigo-400 bg-indigo-50"
                    : "bg-white dark:bg-neutral-900 border border-white/6"
                }`}
              >
                {provider === "MTN"
                  ? "MTN Mobile Money"
                  : provider === "AIRTEL"
                  ? "Airtel Money"
                  : "Zamtel Kwacha"}
              </button>
            ))}
          </div>

          {/* PROVIDER INPUT BLOCK */}
          {mmProvider && (
            <div className="mt-3 p-3 rounded-md bg-white/50 dark:bg-neutral-900/50 border border-white/10">
              {mmStep === "form" && (
                <>
                  <div className="text-xs text-gray-500 mb-2">
                    Enter your phone number to pay via {mmProvider}.
                  </div>

                  <input
                    type="tel"
                    value={mmPhone}
                    onChange={(e) =>
                      setMmPhone(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="e.g. 0971000000"
                    className="w-full px-3 py-2 rounded-md bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-sm"
                  />

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={submitMobileMoney}
                      disabled={processing}
                      className="flex-1 px-3 py-2 rounded-md bg-indigo-600 text-white text-sm"
                    >
                      {processing
                        ? "Processing…"
                        : `Pay ${new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: selectedCurrency,
                          }).format(price)}`}
                    </button>

                    <button
                      onClick={() => {
                        setMmProvider(null);
                        setMmPhone("");
                        setMmStep("form");
                      }}
                      className="px-3 py-2 rounded-md border"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {mmStep === "confirm" && mmProvider === "MTN" && (
                <>
                  <div className="text-sm font-medium mb-2">Confirm Payment</div>
                  <div className="text-xs text-gray-500 mb-3">
                    Check your phone and approve the MTN STK push.
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={confirmMtn}
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
                  Payment received — your download should begin automatically.
                </div>
              )}
            </div>
          )}
        </div>

        {/* STATUS MESSAGES */}
        {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

        {paid && !error && (
          <div className="mt-4 text-sm text-green-600">
            Thank you! Your download is starting…
          </div>
        )}

        {/* LEGAL */}
        <div className="mt-4 text-xs text-gray-400">
          By purchasing you agree to the{" "}
          <button className="underline">Terms</button> and{" "}
          <button className="underline">Privacy Policy</button>.
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
)}

