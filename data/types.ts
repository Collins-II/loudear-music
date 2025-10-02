export type Track = {
  _id: string;            // optional because Mongoose adds it automatically
  title: string;
  artist: string;
  album?: string;          // ObjectId reference to Album
  coverUrl: string;       // optional cover image
  url: string;             // audio file URL
  publicId: string;        // Cloudinary public ID
  duration: number;
  createdAt: Date;
};

export type Album = {
  _id?: string;
  title: string;
  artist: string;
  coverUrl: string;         // album cover image URL
  publicId: string;         // Cloudinary public ID
  songs: Track[]; // populated ISong[] or ObjectId[]
  createdAt?: Date;
}

export type Video = {
  _id?: string;
  id: string;
  title: string;
  thumbnail: string;
  category?: string;
  publishedAt?: string;
  createdAt?: Date
}

export type YTStat = {
  videoId: string;
  title?: string;
  channelTitle?: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
};