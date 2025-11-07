"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewCounts = getViewCounts;
exports.getWeekIdentifier = getWeekIdentifier;
exports.getPreviousWeek = getPreviousWeek;
exports.getOrCreateViewAnalytics = getOrCreateViewAnalytics;
exports.incrementViewCount = incrementViewCount;
exports.getWeeklyGrowthStats = getWeeklyGrowthStats;
const mongoose_1 = require("mongoose");
const viewsAnalytics_1 = require("./database/models/viewsAnalytics");
/**
 * Fetch total and previous week view counts for an item
 */
async function getViewCounts(itemId, model) {
    var _a, _b;
    if (!mongoose_1.Types.ObjectId.isValid(itemId))
        throw new Error("Invalid ObjectId");
    const analytics = await viewsAnalytics_1.ViewAnalytics.find({
        itemId,
        $or: [{ contentModel: model }, { model }],
    }).lean();
    const totalViews = analytics.reduce((sum, entry) => sum + (entry.views || 0), 0);
    const sorted = analytics.sort((a, b) => (a.week < b.week ? 1 : -1));
    const previousViewCount = (_b = (_a = sorted[1]) === null || _a === void 0 ? void 0 : _a.views) !== null && _b !== void 0 ? _b : 0;
    return { totalViews, previousViewCount };
}
/**
 * Get ISO week string (e.g., "2025-W41")
 */
function getWeekIdentifier(date = new Date()) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${week}`;
}
/**
 * Get previous week identifier (e.g., from W41 → W40)
 */
function getPreviousWeek() {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    return getWeekIdentifier(now);
}
/**
 * Increment or fetch view analytics for a given item and model.
 */
async function getOrCreateViewAnalytics(itemId, model, incrementView = false) {
    const week = getWeekIdentifier();
    const normalizedItemId = typeof itemId === "string" ? new mongoose_1.Types.ObjectId(itemId) : itemId;
    let doc = await viewsAnalytics_1.ViewAnalytics.findOne({ itemId: normalizedItemId, model, week });
    if (!doc) {
        doc = await viewsAnalytics_1.ViewAnalytics.create({
            itemId: normalizedItemId,
            model,
            week,
            views: 0,
        });
    }
    if (incrementView) {
        doc.views += 1;
        await doc.save();
    }
    return doc;
}
/**
 * Atomically increments view count (no race conditions)
 */
async function incrementViewCount(itemId, model) {
    const week = getWeekIdentifier();
    await viewsAnalytics_1.ViewAnalytics.updateOne({ itemId, model, week }, { $inc: { views: 1 } }, { upsert: true });
}
/**
 * Compare current week vs previous week view performance.
 * Returns { currentWeek, previousWeek, growth, growthRate }
 */
async function getWeeklyGrowthStats(itemId, model) {
    var _a, _b;
    const thisWeek = getWeekIdentifier();
    const prevWeek = getPreviousWeek();
    const [current, previous] = await Promise.all([
        viewsAnalytics_1.ViewAnalytics.findOne({ itemId, model, week: thisWeek }).lean(),
        viewsAnalytics_1.ViewAnalytics.findOne({ itemId, model, week: prevWeek }).lean(),
    ]);
    const currentViews = (_a = current === null || current === void 0 ? void 0 : current.views) !== null && _a !== void 0 ? _a : 0;
    const prevViews = (_b = previous === null || previous === void 0 ? void 0 : previous.views) !== null && _b !== void 0 ? _b : 0;
    const growth = currentViews - prevViews;
    const growthRate = prevViews > 0 ? (growth / prevViews) * 100 : currentViews > 0 ? 100 : 0;
    return {
        currentWeek: currentViews,
        previousWeek: prevViews,
        growth,
        growthRate: Math.round(growthRate * 10) / 10, // round to 1 decimal
    };
}
