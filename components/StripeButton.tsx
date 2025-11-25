"use client";

import { RootState } from "@/lib/store";
import { useConvertPrice } from "@/lib/store/currency-utils";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function StripeButton() {
  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );
  const items = useSelector((state: RootState) => state.cart.items);
  const convertPrice = useConvertPrice();
  const [loading, setLoading] = useState(false);

  const renderLoading = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

 const handleCheckout = async () => {
    if (!items.length) return alert("Your cart is empty.");

    setLoading(true);

    try {
      const preparedItems = items.map((i) => ({
        name: i.title || "Beat License",
        price: convertPrice(30),
        quantity: 1,
        currency: selectedCurrency,
        beatId: i.beatId,
        licenseId: i.licenseId,
        image: i.image || null,
      }));

      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: preparedItems }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        console.error("Checkout error:", data);
        throw new Error("Checkout session failed");
      }

      // ⭐ NEW STRIPE FLOW — USE THE RETURNED URL
      window.location.href = data.url;

    } catch (err) {
      console.error(err);
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full flex justify-center rounded-full bg-red-500 px-6 py-3 text-lg font-bold text-white 
                 hover:text-primary-600 shadow-lg transition duration-300
                 hover:bg-black/90 focus:outline-none focus:ring-2 
                 focus:ring-primary-400 disabled:opacity-60"
    >
      {loading ? renderLoading() : <ArrowRightIcon className="w-5 h-5" />}
    </button>
  );
}

