"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";

import { AppDispatch, RootState } from "@/lib/store";
import { setCurrency, fetchExchangeRates } from "@/lib/store/currency-slice";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// 🌍 Supported Currencies
export const currencyOptions = [
  { id: "USD", name: "US Dollar", flag: "🇺🇸", code: "us" },
  { id: "EUR", name: "Euro", flag: "🇪🇺", code: "eu" },
  { id: "ZMW", name: "Zambian Kwacha", flag: "🇿🇲", code: "zm" },
  { id: "GBP", name: "British Pound", flag: "🇬🇧", code: "gb" },
  { id: "CNY", name: "Chinese Yuan", flag: "🇨🇳", code: "cn" },
  { id: "ZAR", name: "South African Rand", flag: "🇿🇦", code: "za" },
  { id: "NGN", name: "Nigerian Naira", flag: "🇳🇬", code: "ng" },
  { id: "KES", name: "Kenyan Shilling", flag: "🇰🇪", code: "ke" },
  { id: "SAR", name: "Saudi Riyal", flag: "🇸🇦", code: "sa" },
  { id: "QAR", name: "Qatari Riyal", flag: "🇶🇦", code: "qa" },
];

export default function CurrencyDropdown() {
  const dispatch = useDispatch<AppDispatch>();

  const selectedCurrency = useSelector(
    (state: RootState) => state.currency.selectedCurrency
  );

  const [open, setOpen] = useState(false);

  // 🌍 Detect Currency by IP
  /*useEffect(() => {
    async function detectCurrency() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const country = data?.country_code?.toLowerCase();
        const match = currencyOptions.find((c) => c.code === country);

        dispatch(setCurrency(match?.id || "ZMW"));
      } catch {
        dispatch(setCurrency("ZMW"));
      }
    }

    detectCurrency();
  }, [dispatch]);*/

  // 🔁 Fetch exchange rates
  useEffect(() => {
    dispatch(fetchExchangeRates());
  }, [dispatch]);

  const current =
    currencyOptions.find((c) => c.id === selectedCurrency) || {
      id: "xx",
      flag: "🌍",
      code: "xx",
    };

  const handleSelect = (id: string) => {
    dispatch(setCurrency(id));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center hover:text-neutral-400 justify-between px-3 py-2"
        >
          <div className="text-black/90 dark:text-white flex items-center gap-2">
            {/* Show flag CDN image or fallback emoji */}
            {current.code !== "xx" ? (
              <Image
                src={`https://flagcdn.com/w40/${current.code}.png`}
                alt={current.id}
                width={22}
                height={22}
                onError={(e) => (e.currentTarget.src = "")}
                className="rounded-full"
              />
            ) : (
              <span className="text-lg">{current.flag}</span>
            )}

            <span>{selectedCurrency}</span>
          </div>

          <ChevronDown size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="bg-white dark:bg-black/90 text-black/90 dark:text-white w-60 p-0">
        <div className="max-h-64 overflow-y-auto">
          {currencyOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary hover:text-white transition ${
                selectedCurrency === item.id ? "bg-secondary text-white" : ""
              }`}
            >
              {/* Flag CDN */}
              <Image
                src={`https://flagcdn.com/w40/${item.code}.png`}
                alt={item.name}
                width={22}
                height={22}
                onError={(e) => (e.currentTarget.src = "")}
                className="rounded-full"
              />

              <span>{item.id} — {item.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
