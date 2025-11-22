"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export const useConvertPrice = () => {
  const { selectedCurrency, exchangeRates } = useSelector((state: RootState) => state.currency);

  return (amount: number): string => {
    if (!exchangeRates[selectedCurrency]) return "N/A";
    return (amount * exchangeRates[selectedCurrency]).toFixed(2);
  };
};
