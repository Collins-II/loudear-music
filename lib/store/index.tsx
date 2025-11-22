// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import audioReducer from "./audioSlice";
import themeReducer from "./themeSlice";
import cartReducer from "./cartSlice";
import currencySlice from "./currency-slice";

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    theme: themeReducer,
    cart: cartReducer,
    currency: currencySlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
