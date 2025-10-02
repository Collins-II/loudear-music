// store/slices/themeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ArtistTheme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  font?: string;
};

interface ThemeState {
  currentTheme: ArtistTheme;
  themes: ArtistTheme[];
}

const initialState: ThemeState = {
  currentTheme: {
    id: "cleo",
    name: "Cleo Ice Queen",
    colors: {
      primary: "#9333ea", // Indigo/Purple Hip-Hop vibe
      secondary: "#f472b6", // Pink for female touch
      background: "#0f0f0f",
      text: "#ffffff",
    },
    font: "font-sans",
  },
  themes: [
    {
      id: "cleo",
      name: "Cleo Ice Queen",
      colors: {
        primary: "#9333ea",
        secondary: "#f472b6",
        background: "#0f0f0f",
        text: "#ffffff",
      },
      font: "font-sans",
    },
    {
      id: "artist2",
      name: "Afro Jazz Star",
      colors: {
        primary: "#f59e0b", // Warm yellow
        secondary: "#10b981", // Green tones
        background: "#1a1a1a",
        text: "#fef3c7",
      },
      font: "font-serif",
    },
  ],
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      const theme = state.themes.find((t) => t.id === action.payload);
      if (theme) state.currentTheme = theme;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
