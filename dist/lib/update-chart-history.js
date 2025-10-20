"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChartHistory = updateChartHistory;
const database_1 = require("@/lib/database");
const chartHistory_1 = require("@/lib/database/models/chartHistory");
const song_1 = require("@/lib/database/models/song");
const album_1 = require("@/lib/database/models/album");
const video_1 = require("@/lib/database/models/video");
const dayjs_1 = __importDefault(require("dayjs"));
/**
 * Updates weekly chart history for songs, albums, or videos.
 * Supports region-based analytics updates (Zambia, Nigeria, Global).
 */
async function updateChartHistory(category, region = "Global" // pass region dynamically from analytics
) {
    await (0, database_1.connectToDatabase)();
    const currentWeek = `${(0, dayjs_1.default)().year()}-W${String((0, dayjs_1.default)().isoWeek()).padStart(2, "0")}`;
    const prevWeek = `${(0, dayjs_1.default)().subtract(1, "week").year()}-W${String((0, dayjs_1.default)().subtract(1, "week").isoWeek()).padStart(2, "0")}`;
    const Model = category === "songs" ? song_1.Song : category === "albums" ? album_1.Album : video_1.Video;
    // Fetch items with interaction data
    const items = await Model.find()
        .select("_id views likes downloads shares")
        .lean();
    // Compute "chart score" (adjustable formula)
    const scored = items
        .map((i) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return ({
            itemId: i._id,
            score: ((_b = (_a = i.views) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) +
                ((_d = (_c = i.likes) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) * 2 +
                ((_f = (_e = i.shares) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) * 3 +
                ((_h = (_g = i.downloads) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0) * 1.5,
        });
    })
        .sort((a, b) => b.score - a.score);
    // 🟩 Fetch last week's chart for this category & region
    const prevChart = await chartHistory_1.ChartHistory.findOne({
        category,
        region,
        week: prevWeek,
    }).lean();
    // 🟩 Fallback to empty items if no previous chart
    const prevItems = Array.isArray(prevChart === null || prevChart === void 0 ? void 0 : prevChart.items) ? prevChart.items : [];
    // 🟩 Compute rank, peak, weeksOn
    const itemsForChart = scored.map((entry, index) => {
        const prevItem = prevItems.find((i) => String(i.itemId) === String(entry.itemId));
        const peak = prevItem ? Math.min(prevItem.peak, index + 1) : index + 1;
        const weeksOn = prevItem ? prevItem.weeksOn + 1 : 1;
        return Object.assign(Object.assign({}, entry), { rank: index + 1, peak,
            weeksOn });
    });
    // 🟩 Upsert the chart document (category + region + week)
    await chartHistory_1.ChartHistory.findOneAndUpdate({ category, region, week: currentWeek }, { category, region, week: currentWeek, items: itemsForChart }, { upsert: true, new: true });
    console.log(`✅ Updated ${category} chart for ${region} (${currentWeek}) with ${itemsForChart.length} items`);
}
