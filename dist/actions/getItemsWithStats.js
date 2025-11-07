"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoWithStats = exports.getAlbumWithStats = exports.getSongWithStats = exports.serializeVideo = exports.serializeAlbum = exports.serializeSong = void 0;
exports.serializeItem = serializeItem;
exports.incrementInteraction = incrementInteraction;
exports.getItemWithStats = getItemWithStats;
const mongoose_1 = require("mongoose");
const database_1 = require("@/lib/database");
const comment_1 = require("@/lib/database/models/comment");
const song_1 = require("@/lib/database/models/song");
const album_1 = require("@/lib/database/models/album");
const video_1 = require("@/lib/database/models/video");
const chartHistory_1 = require("@/lib/database/models/chartHistory");
const viewsAnalytics_1 = require("@/lib/database/models/viewsAnalytics");
const get_views_analytics_1 = require("@/lib/get-views-analytics");
const update_chart_history_1 = require("@/lib/update-chart-history");
const dayjs_1 = __importDefault(require("dayjs"));
const isoWeek_1 = __importDefault(require("dayjs/plugin/isoWeek"));
const user_1 = __importDefault(require("@/lib/database/models/user"));
dayjs_1.default.extend(isoWeek_1.default);
function serializeComments(comments = []) {
    return comments.map((c) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return ({
            _id: String((_a = c._id) !== null && _a !== void 0 ? _a : ""),
            user: {
                _id: String((_c = (_b = c.user) === null || _b === void 0 ? void 0 : _b._id) !== null && _c !== void 0 ? _c : ""),
                name: (_e = (_d = c.user) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "Unknown",
                image: (_g = (_f = c.user) === null || _f === void 0 ? void 0 : _f.image) !== null && _g !== void 0 ? _g : undefined,
            },
            content: (_h = c.content) !== null && _h !== void 0 ? _h : "",
            targetModel: (_j = c.targetModel) !== null && _j !== void 0 ? _j : "Song",
            targetId: String((_k = c.targetId) !== null && _k !== void 0 ? _k : ""),
            parent: c.parent ? String(c.parent) : null,
            likes: ((_l = c.likes) !== null && _l !== void 0 ? _l : []).map((id) => String(id)),
            likeCount: Array.isArray(c.likes) ? c.likes.length : 0,
            replyCount: Array.isArray(c.replies) ? c.replies.length : 0,
            reactions: (_m = c.reactions) !== null && _m !== void 0 ? _m : {
                heart: 0,
                fire: 0,
                laugh: 0,
                up: 0,
                down: 0,
            },
            replies: c.replies ? serializeComments(c.replies) : [],
            createdAt: (_q = (_p = (_o = c.createdAt) === null || _o === void 0 ? void 0 : _o.toISOString) === null || _p === void 0 ? void 0 : _p.call(_o)) !== null && _q !== void 0 ? _q : new Date().toISOString(),
            updatedAt: (_t = (_s = (_r = c.updatedAt) === null || _r === void 0 ? void 0 : _r.toISOString) === null || _s === void 0 ? void 0 : _s.call(_r)) !== null && _t !== void 0 ? _t : new Date().toISOString(),
        });
    });
}
/* ------------------------------------------------------------------ */
/* SERIALIZE ITEM */
/* ------------------------------------------------------------------ */
async function serializeItem(doc, type, includeAnalytics = true) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
    if (!doc)
        return null;
    const base = {
        _id: String(doc._id),
        author: {
            _id: String((_b = (_a = doc.author) === null || _a === void 0 ? void 0 : _a._id) !== null && _b !== void 0 ? _b : ""),
            name: (_d = (_c = doc.author) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "Unknown",
            image: (_f = (_e = doc.author) === null || _e === void 0 ? void 0 : _e.image) !== null && _f !== void 0 ? _f : "",
            role: (_h = (_g = doc.author) === null || _g === void 0 ? void 0 : _g.role) !== null && _h !== void 0 ? _h : "artist",
            stan: typeof ((_j = doc.author) === null || _j === void 0 ? void 0 : _j.stanCount) === "number"
                ? doc.author.stanCount
                : Array.isArray((_k = doc.author) === null || _k === void 0 ? void 0 : _k.stan)
                    ? doc.author.stan.length
                    : 0,
        },
        artist: (_l = doc.artist) !== null && _l !== void 0 ? _l : "Unknown Artist",
        title: (_m = doc.title) !== null && _m !== void 0 ? _m : "Untitled",
        features: Array.isArray(doc.features) ? doc.features : [],
        genre: (_o = doc.genre) !== null && _o !== void 0 ? _o : "Unknown",
        description: (_p = doc.description) !== null && _p !== void 0 ? _p : "",
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        coverUrl: (_r = (_q = doc.coverUrl) !== null && _q !== void 0 ? _q : doc.thumbnailUrl) !== null && _r !== void 0 ? _r : "",
        createdAt: (_u = (_t = (_s = doc.createdAt) === null || _s === void 0 ? void 0 : _s.toISOString) === null || _t === void 0 ? void 0 : _t.call(_s)) !== null && _u !== void 0 ? _u : new Date().toISOString(),
        updatedAt: (_x = (_w = (_v = doc.updatedAt) === null || _v === void 0 ? void 0 : _v.toISOString) === null || _w === void 0 ? void 0 : _w.call(_v)) !== null && _x !== void 0 ? _x : new Date().toISOString(),
        totalViews: 0,
        viewCount: 0,
        likeCount: (_0 = (_z = (_y = doc.likes) === null || _y === void 0 ? void 0 : _y.length) !== null && _z !== void 0 ? _z : doc.likeCount) !== null && _0 !== void 0 ? _0 : 0,
        downloadCount: (_3 = (_2 = (_1 = doc.downloads) === null || _1 === void 0 ? void 0 : _1.length) !== null && _2 !== void 0 ? _2 : doc.downloadCount) !== null && _3 !== void 0 ? _3 : 0,
        shareCount: (_6 = (_5 = (_4 = doc.shares) === null || _4 === void 0 ? void 0 : _4.length) !== null && _5 !== void 0 ? _5 : doc.shareCount) !== null && _6 !== void 0 ? _6 : 0,
        commentCount: (_7 = doc.commentCount) !== null && _7 !== void 0 ? _7 : 0,
        latestComments: serializeComments((_8 = doc.latestComments) !== null && _8 !== void 0 ? _8 : []),
    };
    if (includeAnalytics && doc._id) {
        try {
            const { totalViews, previousViewCount } = await (0, get_views_analytics_1.getViewCounts)(doc._id, type);
            base.viewCount = totalViews;
            base.previousViewCount = previousViewCount;
        }
        catch (err) {
            console.error(`Failed to load view analytics for ${type} ${doc._id}`, err);
        }
    }
    else {
        base.viewCount = (_11 = (_10 = (_9 = doc.views) === null || _9 === void 0 ? void 0 : _9.length) !== null && _10 !== void 0 ? _10 : doc.viewCount) !== null && _11 !== void 0 ? _11 : 0;
    }
    if (type === "Song")
        return Object.assign(Object.assign({}, base), { album: (_12 = doc.album) !== null && _12 !== void 0 ? _12 : null, language: (_13 = doc.language) !== null && _13 !== void 0 ? _13 : null, releaseDate: (_14 = doc.releaseDate) !== null && _14 !== void 0 ? _14 : null, fileUrl: (_15 = doc.fileUrl) !== null && _15 !== void 0 ? _15 : "" });
    if (type === "Album") {
        const songs = Array.isArray(doc.songs) && doc.songs.length > 0
            ? await Promise.all(doc.songs.map((s) => serializeItem(s, "Song", false)))
            : [];
        return Object.assign(Object.assign({}, base), { songs });
    }
    return Object.assign(Object.assign({}, base), { fileUrl: (_17 = (_16 = doc.videoUrl) !== null && _16 !== void 0 ? _16 : doc.fileUrl) !== null && _17 !== void 0 ? _17 : "", videographer: (_18 = doc.videographer) !== null && _18 !== void 0 ? _18 : "Unknown", releaseDate: (_19 = doc.releaseDate) !== null && _19 !== void 0 ? _19 : null });
}
const serializeSong = async (doc) => {
    return serializeItem(doc, "Song");
};
exports.serializeSong = serializeSong;
const serializeAlbum = async (doc) => {
    return serializeItem(doc, "Album");
};
exports.serializeAlbum = serializeAlbum;
const serializeVideo = async (doc) => {
    return serializeItem(doc, "Video");
};
exports.serializeVideo = serializeVideo;
/* ------------------------------------------------------------------ */
/* INTERACTIONS + ANALYTICS */
/* ------------------------------------------------------------------ */
async function incrementInteraction(id, model, type, userId) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new Error("Invalid ObjectId");
    await (0, database_1.connectToDatabase)();
    const Model = model === "Song" ? song_1.Song : model === "Album" ? album_1.Album : video_1.Video;
    const fieldMap = {
        view: "views",
        like: "likes",
        download: "downloads",
        share: "shares",
    };
    if (type === "unlike") {
        await Model.updateOne({ _id: id }, { $pull: { likes: new mongoose_1.Types.ObjectId(userId) } });
        return { success: true, action: "unliked" };
    }
    if (type === "view") {
        const nowWeek = `${(0, dayjs_1.default)().year()}-W${String((0, dayjs_1.default)().isoWeek()).padStart(2, "0")}`;
        await Model.updateOne({ _id: id }, { $addToSet: { views: new mongoose_1.Types.ObjectId(userId) } });
        await viewsAnalytics_1.ViewAnalytics.updateOne({ itemId: id, contentModel: model, week: nowWeek }, { $inc: { views: 1 } }, { upsert: true });
        await (0, update_chart_history_1.updateChartHistory)(model.toLowerCase() + "s");
        return { success: true, action: "view" };
    }
    const field = fieldMap[type];
    if (!field)
        throw new Error(`Unsupported interaction type: ${type}`);
    await Model.updateOne({ _id: id }, { $addToSet: { [field]: new mongoose_1.Types.ObjectId(userId) } });
    if (["like", "share", "download"].includes(type)) {
        if (Math.random() < 0.1) {
            await (0, update_chart_history_1.updateChartHistory)(model.toLowerCase() + "s");
        }
    }
    return { success: true, action: type };
}
/* ------------------------------------------------------------------ */
/* DYNAMIC STATS FETCHER */
/* ------------------------------------------------------------------ */
async function getItemWithStats(model, id) {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (!mongoose_1.Types.ObjectId.isValid(id))
            throw new Error("Invalid ObjectId");
        await (0, database_1.connectToDatabase)();
        const Model = model === "Song" ? song_1.Song : model === "Album" ? album_1.Album : video_1.Video;
        let query = Model.findById(id).populate({
            path: "author",
            select: "_id name image role stan",
        });
        if (model === "Album") {
            query = query.populate({
                path: "songs",
                select: "_id title artist coverUrl fileUrl views likes downloads shares genre releaseDate",
            });
        }
        const doc = await query.lean();
        if (!doc)
            return null;
        const [commentCountRes, latestCommentsRes] = await Promise.allSettled([
            comment_1.Comment.countDocuments({ targetId: id, targetModel: model }),
            comment_1.Comment.find({ targetId: id, targetModel: model, parent: null })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate([
                { path: "user", select: "_id name image" },
                {
                    path: "replies",
                    populate: { path: "user", select: "_id name image" },
                    options: { sort: { createdAt: 1 }, limit: 5 },
                },
            ])
                .lean(),
        ]);
        const commentCount = commentCountRes.status === "fulfilled" ? commentCountRes.value : 0;
        const latestComments = latestCommentsRes.status === "fulfilled"
            ? serializeComments(latestCommentsRes.value)
            : [];
        const sinceDate = (0, dayjs_1.default)().subtract(365, "day").toDate();
        const recentItems = await Model.find({ createdAt: { $gte: sinceDate } })
            .select("_id views likes shares downloads")
            .lean();
        const scored = recentItems
            .map((i) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                _id: i._id,
                trendingScore: ((_b = (_a = i.views) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) +
                    ((_d = (_c = i.likes) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) * 2 +
                    ((_f = (_e = i.shares) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) * 3 +
                    ((_h = (_g = i.downloads) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0) * 1.5,
            });
        })
            .sort((a, b) => b.trendingScore - a.trendingScore);
        const trendingIndex = scored.findIndex((s) => String(s._id) === id);
        const trendingPosition = trendingIndex >= 0 ? trendingIndex + 1 : null;
        const trendingScore = trendingIndex >= 0 ? scored[trendingIndex].trendingScore : null;
        const currentWeek = `${(0, dayjs_1.default)().year()}-W${String((0, dayjs_1.default)().isoWeek()).padStart(2, "0")}`;
        const chartSnapshot = await chartHistory_1.ChartHistory.findOne({
            category: model.toLowerCase() + "s",
            week: currentWeek,
        })
            .select("items week category")
            .lean();
        const chartPosition = (_c = (_b = (_a = chartSnapshot === null || chartSnapshot === void 0 ? void 0 : chartSnapshot.items) === null || _a === void 0 ? void 0 : _a.find((i) => String(i.itemId) === id)) === null || _b === void 0 ? void 0 : _b.rank) !== null && _c !== void 0 ? _c : null;
        const chartHistoryDocs = await chartHistory_1.ChartHistory.find({
            "items.itemId": new mongoose_1.Types.ObjectId(id),
        })
            .sort({ week: -1 })
            .limit(12)
            .lean();
        const chartHistory = chartHistoryDocs
            .map((snap) => {
            var _a, _b;
            const item = snap.items.find((it) => String(it.itemId) === id);
            if (!item)
                return undefined;
            return {
                week: snap.week,
                position: item.rank,
                peak: (_a = item.peak) !== null && _a !== void 0 ? _a : item.rank,
                weeksOn: (_b = item.weeksOn) !== null && _b !== void 0 ? _b : 1,
            };
        })
            .filter((entry) => Boolean(entry));
        const thisWeek = `${(0, dayjs_1.default)().year()}-W${String((0, dayjs_1.default)().isoWeek()).padStart(2, "0")}`;
        const prevWeek = `${(0, dayjs_1.default)().subtract(1, "week").year()}-W${String((0, dayjs_1.default)().subtract(1, "week").isoWeek()).padStart(2, "0")}`;
        const { totalViews } = await (0, get_views_analytics_1.getViewCounts)(id, model);
        const [currentWeekData, prevWeekData] = await Promise.all([
            viewsAnalytics_1.ViewAnalytics.findOne({
                itemId: id,
                contentModel: model,
                week: thisWeek,
            }).lean(),
            viewsAnalytics_1.ViewAnalytics.findOne({
                itemId: id,
                contentModel: model,
                week: prevWeek,
            }).lean(),
        ]);
        const currentViewCount = (_d = currentWeekData === null || currentWeekData === void 0 ? void 0 : currentWeekData.views) !== null && _d !== void 0 ? _d : 0;
        const previousViewCount = (_e = prevWeekData === null || prevWeekData === void 0 ? void 0 : prevWeekData.views) !== null && _e !== void 0 ? _e : 0;
        // ✅ Compute artist's total stans (followers)
        let stanCount = 0;
        if ((_f = doc.author) === null || _f === void 0 ? void 0 : _f._id) {
            stanCount = await user_1.default.countDocuments({ stan: doc.author._id });
        }
        const serialized = (await serializeItem(Object.assign(Object.assign({}, doc), { commentCount, latestComments, author: Object.assign(Object.assign({}, doc.author), { stanCount }) }), model));
        return Object.assign(Object.assign({}, serialized), { trendingPosition,
            chartPosition,
            chartHistory,
            trendingScore,
            totalViews, viewCount: currentViewCount, previousViewCount });
    }
    catch (error) {
        console.error("GET_ITEMS_ERROR", error);
        return null;
    }
}
/* ------------------------------------------------------------------ */
/* SHORTCUTS */
/* ------------------------------------------------------------------ */
const getSongWithStats = (id) => getItemWithStats("Song", id);
exports.getSongWithStats = getSongWithStats;
const getAlbumWithStats = (id) => getItemWithStats("Album", id);
exports.getAlbumWithStats = getAlbumWithStats;
const getVideoWithStats = (id) => getItemWithStats("Video", id);
exports.getVideoWithStats = getVideoWithStats;
