"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface CurrencyState {
  selectedCurrency: string;
  exchangeRates: Record<string, number>;
}

const initialState: CurrencyState = {
  selectedCurrency: "USD",
  exchangeRates: { USD: 1 },
};

// Async action to fetch exchange rates
export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async () => {
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await res.json();
      return data.rates;
    } catch (error) {
      console.error("Failed to fetch exchange rates", error);
      throw error;
    }
  }
);

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchExchangeRates.fulfilled, (state, action) => {
      state.exchangeRates = { USD: 1, ...action.payload };
    });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;