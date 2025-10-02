import { Schema, model, models } from "mongoose";

const GalleryItemSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const GallerySchema = new Schema(
  {
    items: [GalleryItemSchema],
  },
  { timestamps: true }
);

const Gallery = models.Gallery || model("Gallery", GallerySchema);
export default Gallery;
