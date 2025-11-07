"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = require("mongoose");
const VideoSchema = new mongoose_1.Schema({
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    genre: { type: String, trim: true },
    releaseDate: { type: Date },
    description: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    // URLs for video & thumbnail
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    // Video details
    videographer: { type: String, trim: true },
    duration: { type: Number },
    // ➕ Extended metadata
    label: { type: String, trim: true },
    copyright: { type: String, trim: true },
    mood: { type: String, trim: true },
    // ➕ Visibility support
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
// ✅ Comments Virtuals
VideoSchema.virtual("commentCount", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    count: true,
    match: { targetModel: "Video" },
});
VideoSchema.virtual("latestComments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "targetId",
    match: { targetModel: "Video", parent: null },
    options: { sort: { createdAt: -1 }, limit: 3 },
});
// Include virtuals in output
VideoSchema.set("toObject", { virtuals: true });
VideoSchema.set("toJSON", { virtuals: true });
exports.Video = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Video) || (0, mongoose_1.model)("Video", VideoSchema);
