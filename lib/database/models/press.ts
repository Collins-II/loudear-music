import { Schema, model, models } from "mongoose";

const SectionSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    tagline: String,
    subtitle: String,
    body: String,
    ctaMusic: String,
    ctaVideo: String,
    ctaEvent: String,
    image: String,
    publicId: String,
  },
  { _id: false }
);

const PressSchema = new Schema(
  {
    sections: { type: [SectionSchema], required: true },
  },
  { timestamps: true }
);

const Press =
  models.Press || model("Press", PressSchema);

export default Press;
