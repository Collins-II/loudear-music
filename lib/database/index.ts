// lib/database/index.ts
import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://actscloud28:556088@cluster0.9nkkkej.mongodb.net/loudear_portal?retryWrites=true&w=majority";

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

// Extend globalThis to store cached connection
declare global {
  var mongoose: MongooseGlobal;
}

// Use global cache to prevent multiple connections in dev
const cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export const connectToDatabase = async () => {
  if (!MONGODB_URL) throw new Error("MONGODB_URL is missing");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
    };

    // ✅ Use mongoose.default if needed in ESM
    cached.promise = mongoose.connect(MONGODB_URL, opts)
      .then((m) => {
        console.log("[MONGOOSE] Connected successfully");
        return m;
      })
      .catch((err) => {
        console.error("[MONGOOSE] Initial connection failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
