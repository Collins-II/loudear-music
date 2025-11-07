"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
const mongoose_1 = require("mongoose");
require("./comment"); // Ensure Comment model is loaded
const SongSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    genre: { type: String, trim: true },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    duration: { type: Number },
    // ➕ New fields for better metadata
    album: { type: String },
    explicit: { type: Boolean, default: false },
    bpm: { type: Number },
    key: { type: String, trim: true },
    mood: { type: String, trim: true },
    label: { type: String, trim: true },
    // ➕ Visibility for control (public/private/unlisted)
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "private",
    },
    // Engagement tracking
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// ✅ Virtuals for comments
SongSchema.virtual("commentCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    count: true,
    match: { targetModel: "Song" },
});
SongSchema.virtual("latestComments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    justOne: false,
    match: { targetModel: "Song", parent: null },
    options: { sort: { createdAt: -1 }, limit: 5 },
});
// Ensure virtuals appear in JSON/object output
SongSchema.set("toObject", { virtuals: true });
SongSchema.set("toJSON", { virtuals: true });
exports.Song = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Song) || (0, mongoose_1.model)("Song", SongSchema);
