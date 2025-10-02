// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import audioReducer from "./audioSlice";
import themeReducer from "./themeSlice"

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    theme: themeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
