"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
const mongoose_1 = require("mongoose");
require("./comment"); // Ensure Comment model is loaded
const SongSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    duration: { type: Number },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// ✅ Comments
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
SongSchema.set("toObject", { virtuals: true });
SongSchema.set("toJSON", { virtuals: true });
exports.Song = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Song) || (0, mongoose_1.model)("Song", SongSchema);
