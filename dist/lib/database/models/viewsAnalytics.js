"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewAnalytics = void 0;
const mongoose_1 = require("mongoose");
const ViewAnalyticsSchema = new mongoose_1.Schema({
    itemId: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: "contentModel" },
    contentModel: {
        type: String,
        enum: ["Song", "Album", "Video"],
        required: true,
    },
    week: { type: String, required: true },
    views: { type: Number, default: 0 },
}, {
    timestamps: true,
});
exports.ViewAnalytics = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.ViewAnalytics) || (0, mongoose_1.model)("ViewAnalytics", ViewAnalyticsSchema);
