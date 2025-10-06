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
const dayjs_1 = __importDefault(require("dayjs"));
const isoWeek_1 = __importDefault(require("dayjs/plugin/isoWeek"));
dayjs_1.default.extend(isoWeek_1.default);
function serializeComments(comments = []) {
    return comments.map((c) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
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
            likeCount: (_o = (_m = c.likes) === null || _m === void 0 ? void 0 : _m.length) !== null && _o !== void 0 ? _o : 0,
            replyCount: (_q = (_p = c.replies) === null || _p === void 0 ? void 0 : _p.length) !== null && _q !== void 0 ? _q : 0,
            reactions: (_r = c.reactions) !== null && _r !== void 0 ? _r : {
                heart: 0,
                fire: 0,
                laugh: 0,
                up: 0,
                down: 0,
            },
            replies: c.replies ? serializeComments(c.replies) : [],
            createdAt: (_u = (_t = (_s = c.createdAt) === null || _s === void 0 ? void 0 : _s.toISOString) === null || _t === void 0 ? void 0 : _t.call(_s)) !== null && _u !== void 0 ? _u : new Date().toISOString(),
            updatedAt: (_x = (_w = (_v = c.updatedAt) === null || _v === void 0 ? void 0 : _v.toISOString) === null || _w === void 0 ? void 0 : _w.call(_v)) !== null && _x !== void 0 ? _x : new Date().toISOString(),
        });
    });
}
function serializeItem(doc, type) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    if (!doc)
        return null;
    const base = {
        _id: String(doc._id),
        artist: (_a = doc.artist) !== null && _a !== void 0 ? _a : "Unknown Artist",
        title: (_b = doc.title) !== null && _b !== void 0 ? _b : "Untitled",
        genre: (_c = doc.genre) !== null && _c !== void 0 ? _c : "Unknown",
        description: (_d = doc.description) !== null && _d !== void 0 ? _d : "",
        tags: Array.isArray(doc.tags) ? doc.tags : [],
        coverUrl: (_f = (_e = doc.coverUrl) !== null && _e !== void 0 ? _e : doc.thumbnailUrl) !== null && _f !== void 0 ? _f : "",
        createdAt: (_j = (_h = (_g = doc.createdAt) === null || _g === void 0 ? void 0 : _g.toISOString) === null || _h === void 0 ? void 0 : _h.call(_g)) !== null && _j !== void 0 ? _j : new Date().toISOString(),
        updatedAt: (_m = (_l = (_k = doc.updatedAt) === null || _k === void 0 ? void 0 : _k.toISOString) === null || _l === void 0 ? void 0 : _l.call(_k)) !== null && _m !== void 0 ? _m : new Date().toISOString(),
        viewCount: (_q = (_p = (_o = doc.views) === null || _o === void 0 ? void 0 : _o.length) !== null && _p !== void 0 ? _p : doc.viewCount) !== null && _q !== void 0 ? _q : 0,
        likeCount: (_t = (_s = (_r = doc.likes) === null || _r === void 0 ? void 0 : _r.length) !== null && _s !== void 0 ? _s : doc.likeCount) !== null && _t !== void 0 ? _t : 0,
        downloadCount: (_w = (_v = (_u = doc.downloads) === null || _u === void 0 ? void 0 : _u.length) !== null && _v !== void 0 ? _v : doc.downloadCount) !== null && _w !== void 0 ? _w : 0,
        shareCount: (_z = (_y = (_x = doc.shares) === null || _x === void 0 ? void 0 : _x.length) !== null && _y !== void 0 ? _y : doc.shareCount) !== null && _z !== void 0 ? _z : 0,
        commentCount: (_0 = doc.commentCount) !== null && _0 !== void 0 ? _0 : 0,
        latestComments: serializeComments((_1 = doc.latestComments) !== null && _1 !== void 0 ? _1 : []),
    };
    if (type === "Song")
        return Object.assign(Object.assign({}, base), { album: (_2 = doc.album) !== null && _2 !== void 0 ? _2 : null, language: (_3 = doc.language) !== null && _3 !== void 0 ? _3 : null, releaseDate: (_4 = doc.releaseDate) !== null && _4 !== void 0 ? _4 : null, fileUrl: (_5 = doc.fileUrl) !== null && _5 !== void 0 ? _5 : "" });
    if (type === "Album")
        return Object.assign(Object.assign({}, base), { curator: (_6 = doc.curator) !== null && _6 !== void 0 ? _6 : "Unknown", songs: ((_7 = doc.songs) !== null && _7 !== void 0 ? _7 : []).map((s) => serializeItem(s, "Song")) });
    return Object.assign(Object.assign({}, base), { fileUrl: (_9 = (_8 = doc.videoUrl) !== null && _8 !== void 0 ? _8 : doc.fileUrl) !== null && _9 !== void 0 ? _9 : "", videographer: (_10 = doc.videographer) !== null && _10 !== void 0 ? _10 : "Unknown", releaseDate: (_11 = doc.releaseDate) !== null && _11 !== void 0 ? _11 : null });
}
const serializeSong = (doc) => serializeItem(doc, "Song");
exports.serializeSong = serializeSong;
const serializeAlbum = (doc) => serializeItem(doc, "Album");
exports.serializeAlbum = serializeAlbum;
const serializeVideo = (doc) => serializeItem(doc, "Video");
exports.serializeVideo = serializeVideo;
/* ------------------------------------------------------------------ */
/* INCREMENT INTERACTION */
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
    const field = fieldMap[type];
    if (!field)
        throw new Error(`Unsupported interaction type: ${type}`);
    await Model.updateOne({ _id: id }, { $addToSet: { [field]: new mongoose_1.Types.ObjectId(userId) } });
    return { success: true, action: type };
}
/* ------------------------------------------------------------------ */
/* DYNAMIC STATS FETCHER */
/* ------------------------------------------------------------------ */
async function getItemWithStats(model, id) {
    var _a, _b, _c, _d;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new Error("Invalid ObjectId");
    await (0, database_1.connectToDatabase)();
    const Model = model === "Song" ? song_1.Song : model === "Album" ? album_1.Album : video_1.Video;
    // For albums, populate songs for deeper analytics
    let query = Model.findById(id);
    if (model === "Album") {
        query = query.populate({
            path: "songs",
            select: "_id title artist coverUrl fileUrl views likes downloads shares genre releaseDate",
        });
    }
    const doc = await query.lean();
    if (!doc)
        return null;
    // Comments
    const [commentCount, latestComments] = await Promise.all([
        comment_1.Comment.countDocuments({ targetId: id, targetModel: model }),
        comment_1.Comment.find({ targetId: id, targetModel: model, parent: null })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("user", "_id name image")
            .lean()
            .then((res) => serializeComments(res)),
    ]);
    // Trending score within recent period
    const sinceDate = (0, dayjs_1.default)().subtract(14, "day").toDate();
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
    // Chart data
    const currentWeek = `${(0, dayjs_1.default)().year()}-W${String((0, dayjs_1.default)().isoWeek()).padStart(2, "0")}`;
    const chartSnapshot = (await chartHistory_1.ChartHistory.findOne({
        category: model.toLowerCase() + "s",
        week: currentWeek,
    })
        .select("items week category")
        .lean());
    const chartPosition = (_c = (_b = (_a = chartSnapshot === null || chartSnapshot === void 0 ? void 0 : chartSnapshot.items) === null || _a === void 0 ? void 0 : _a.find((i) => String(i.itemId) === id)) === null || _b === void 0 ? void 0 : _b.position) !== null && _c !== void 0 ? _c : null;
    const chartHistoryDocs = (await chartHistory_1.ChartHistory.find({
        "items.itemId": new mongoose_1.Types.ObjectId(id),
    })
        .sort({ week: -1 })
        .limit(12)
        .lean());
    const chartHistory = (_d = chartHistoryDocs
        .map((snap) => {
        var _a, _b;
        const item = snap.items.find((it) => String(it.itemId) === id);
        return item
            ? {
                week: snap.week,
                position: item.position,
                peak: (_a = item.peak) !== null && _a !== void 0 ? _a : item.position,
                weeksOn: (_b = item.weeksOn) !== null && _b !== void 0 ? _b : 1,
            }
            : null;
    })
        .filter(Boolean)) !== null && _d !== void 0 ? _d : [];
    // Serialize
    const serialized = serializeItem(Object.assign(Object.assign({}, doc), { commentCount, latestComments }), model);
    return Object.assign(Object.assign({}, serialized), { trendingPosition,
        chartPosition,
        chartHistory, trendingScore: trendingIndex >= 0 ? scored[trendingIndex].trendingScore : null });
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
