"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Album = void 0;
const mongoose_1 = require("mongoose");
const AlbumSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String },
    tags: [{ type: String }],
    songs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Song" }],
    coverUrl: { type: String, required: true },
    duration: { type: Number },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    downloads: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
// ✅ Comments
AlbumSchema.virtual("commentCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    count: true,
    match: { targetModel: "Album" },
});
AlbumSchema.virtual("latestComments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    match: { targetModel: "Album", parent: null },
    options: { sort: { createdAt: -1 }, limit: 3 },
});
AlbumSchema.set("toObject", { virtuals: true });
AlbumSchema.set("toJSON", { virtuals: true });
exports.Album = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Album) || (0, mongoose_1.model)("Album", AlbumSchema);
