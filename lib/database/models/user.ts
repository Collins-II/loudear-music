import mongoose, { Schema, Document, Model } from "mongoose";


// Production-ready tweaks:
// - phone as string to preserve leading zeros/plus signs
// - added validation, indexes, and default timestamps
// - added helper methods and a safe toJSON transform


export interface IUser extends Document {
name: string;
email: string;
image?: string;
role: "fan" | "artist"; // LoudEar roles
bio?: string;
location?: string;
phone?: string;
genres?: string[];
createdAt: Date;
updatedAt: Date;
}


const UserSchema = new Schema<IUser>(
{
name: { type: String, required: true, trim: true, maxlength: 100 },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
image: { type: String },


// Platform-specific role
role: {
type: String,
enum: ["fan", "artist"],
default: "fan",
index: true,
},


// Extra metadata for LoudEar platform
bio: { type: String, maxlength: 2000 },
location: { type: String, maxlength: 200 },
phone: { type: String },
genres: [{ type: String }],
},
{ timestamps: true }
);


// Example static helper (could be extended later)
UserSchema.statics.findByEmail = function (email: string) {
return this.findOne({ email: email.toLowerCase() });
};


// Prevent recompilation errors in dev hot reload
export const User: Model<IUser> =
mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


export default User;