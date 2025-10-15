// lib/database/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: "fan" | "artist"; // LoudEar roles
  bio?: string;
  location?: string;
  phone?: number;
  genres?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },

    // Platform-specific role
    role: {
      type: String,
      enum: ["fan", "artist"],
      default: "fan",
    },

    // Extra metadata for LoudEar platform
    bio: { type: String },
    location: { type: String },
    phone: { type: Number },
    genres: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent recompilation errors in dev hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
