// lib/database/models/contact.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  heading: string;
  email: string;
  phone?: string;
  subHeading?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    heading: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    subHeading: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Prevent recompiling model in Next.js hot reload
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;
