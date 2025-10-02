import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHeroSection {
  id: number;
  title: string;
  tagline: string;
  artistName: string;
  subtitle: string;
  description: string;
  ctaMusic: string;
  ctaVideos: string;
  ctaEvents: string;
  heroImage: string;
}

export interface IHero extends Document {
  sections: IHeroSection[];
  coverUrl: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSectionSchema = new Schema<IHeroSection>(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    artistName: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    ctaMusic: { type: String, required: true },
    ctaVideos: { type: String, required: true },
    ctaEvents: { type: String, required: true },
    heroImage: { type: String, required: true },
  },
  { _id: false } // prevent extra _id for subdocs
);

const HeroSchema = new Schema<IHero>(
  {
    sections: { type: [HeroSectionSchema], required: true },
    coverUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite issues in dev/hot-reload
const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
