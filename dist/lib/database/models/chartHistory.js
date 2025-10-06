"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartHistory = void 0;
// lib/database/models/chartHistory.ts
const mongoose_1 = require("mongoose");
/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */
const ChartHistorySchema = new mongoose_1.Schema({
    category: { type: String, enum: ["songs", "albums", "artists"], required: true },
    region: { type: String, default: "global" },
    week: { type: String, required: true }, // e.g. "2025-W40"
    items: [
        {
            itemId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            position: { type: Number, required: true },
            peak: { type: Number, required: true },
            weeksOn: { type: Number, required: true },
        },
    ],
}, { timestamps: true });
/* -------------------------------------------------------------------------- */
/*                                    Model                                   */
/* -------------------------------------------------------------------------- */
exports.ChartHistory = (mongoose_1.models === null || mongoose_1.models === void 0 ? void 0 : mongoose_1.models.ChartHistory) || (0, mongoose_1.model)("ChartHistory", ChartHistorySchema);
