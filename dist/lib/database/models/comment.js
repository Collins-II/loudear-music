"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
// lib/database/models/comment.ts
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    targetModel: {
        type: String,
        enum: ["Song", "Album", "Video", "Post"],
        required: true,
    },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: "targetModel" },
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    content: { type: String, required: true, trim: true },
    // Track likes as user references
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    // Nested replies
    replies: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }],
    // Reactions: heart, fire, laugh, up, down
    reactions: {
        heart: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        up: { type: Number, default: 0 },
        down: { type: Number, default: 0 },
    },
}, { timestamps: true });
// ✅ Virtuals for counts
CommentSchema.virtual("likeCount").get(function () {
    var _a;
    return ((_a = this.likes) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
CommentSchema.virtual("replyCount").get(function () {
    var _a;
    return ((_a = this.replies) === null || _a === void 0 ? void 0 : _a.length) || 0;
});
// ✅ Populate virtuals in JSON/Objects
CommentSchema.set("toObject", { virtuals: true });
CommentSchema.set("toJSON", { virtuals: true });
exports.Comment = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.Comment) || (0, mongoose_1.model)("Comment", CommentSchema);
