"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartHistory = void 0;
const mongoose_1 = require("mongoose");
const ChartHistorySchema = new mongoose_1.Schema({
    category: { type: String, required: true },
    region: { type: String, enum: ["Zambia", "Nigeria", "Global"], default: "Global" },
    week: { type: String, required: true },
    items: [
        {
            itemId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            rank: Number,
            score: Number,
            peak: Number,
            weeksOn: Number,
        },
    ],
});
exports.ChartHistory = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.ChartHistory) || (0, mongoose_1.model)("ChartHistory", ChartHistorySchema);
