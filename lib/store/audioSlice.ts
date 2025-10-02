// store/slices/audioSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DownloadState {
  url: string | null;
  progress: number; // 0 - 100
  status: "idle" | "downloading" | "completed" | "failed";
}

interface AudioState {
  currentTrack: string | null;
  isPlaying: boolean;
  volume: number;
  download: DownloadState;
}

const initialState: AudioState = {
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  download: {
    url: null,
    progress: 0,
    status: "idle",
  },
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<string>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    // download actions
    startDownload: (state, action: PayloadAction<string>) => {
      state.download = {
        url: action.payload,
        progress: 0,
        status: "downloading",
      };
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.download.progress = action.payload;
    },
    completeDownload: (state) => {
      state.download.status = "completed";
    },
    failDownload: (state) => {
      state.download.status = "failed";
    },
    resetDownload: (state) => {
      state.download = {
        url: null,
        progress: 0,
        status: "idle",
      };
    },
  },
});

export const {
  setTrack,
  play,
  pause,
  setVolume,
  startDownload,
  updateProgress,
  completeDownload,
  failDownload,
  resetDownload,
} = audioSlice.actions;

export default audioSlice.reducer;
