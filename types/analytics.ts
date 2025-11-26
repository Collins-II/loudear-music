// types/analytics.ts
export type TimeseriesPoint = { date: string; plays: number };

export type TopTrack = {
  id: string;
  title: string;
  plays: number;
  listeners: number;
  revenueCents: number;
  duration: number;
  image?: string;
};

export type GeoRow = { country: string; code: string; plays: number };

export type Overview = {
  playsToday: number;
  listenersToday: number;
  revenueCents: number;
  plays30d: number;
};

export type ArtistAnalyticsResponse = {
  artistId: string;
  overview?: Overview;
  timeseries?: TimeseriesPoint[];
  topTracks?: TopTrack[];
  geo?: GeoRow[];
};
