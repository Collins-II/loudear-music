"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoWithStats = exports.getAlbumWithStats = exports.getSongWithStats = void 0;
exports.serializeItem = serializeItem;
exports.serializeSong = serializeSong;
exports.getTrending = getTrending;
exports.incrementInteraction = incrementInteraction;
exports.getItemWithStats = getItemWithStats;
const mongoose_1 = require("mongoose");
const database_1 = require("@/lib/database");
const comment_1 = require("@/lib/database/models/comment"); // 👈 ensures Comment is registered
const song_1 = require("@/lib/database/models/song");
const album_1 = require("@/lib/database/models/album");
const video_1 = require("@/lib/database/models/video");
/**
 * Comment serializer (recursive for replies)
 */
function serializeComments(comments = []) {
    return comments.map((c) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        return ({
            _id: c._id.toString(),
            user: {
                _id: (_d = (_c = (_b = (_a = c.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString) === null || _c === void 0 ? void 0 : _c.call(_b)) !== null && _d !== void 0 ? _d : "",
                name: (_f = (_e = c.user) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : "Unknown",
                image: (_h = (_g = c.user) === null || _g === void 0 ? void 0 : _g.image) !== null && _h !== void 0 ? _h : undefined,
            },
            content: c.content,
            targetModel: c.targetModel,
            targetId: (_l = (_k = (_j = c.targetId) === null || _j === void 0 ? void 0 : _j.toString) === null || _k === void 0 ? void 0 : _k.call(_j)) !== null && _l !== void 0 ? _l : "",
            parent: c.parent ? c.parent.toString() : null,
            likes: (_o = (_m = c.likes) === null || _m === void 0 ? void 0 : _m.map((id) => id.toString())) !== null && _o !== void 0 ? _o : [],
            likeCount: (_q = (_p = c.likes) === null || _p === void 0 ? void 0 : _p.length) !== null && _q !== void 0 ? _q : 0,
            replyCount: (_s = (_r = c.replies) === null || _r === void 0 ? void 0 : _r.length) !== null && _s !== void 0 ? _s : 0,
            reactions: (_t = c.reactions) !== null && _t !== void 0 ? _t : {
                heart: 0,
                fire: 0,
                laugh: 0,
                up: 0,
                down: 0,
            },
            replies: c.replies ? serializeComments(c.replies) : [],
            createdAt: (_u = c.createdAt) !== null && _u !== void 0 ? _u : new Date(),
            updatedAt: (_v = c.updatedAt) !== null && _v !== void 0 ? _v : new Date(),
        });
    });
}
/**
 * Serialize Song/Album/Video into a plain object
 */
function serializeItem(doc, type) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!doc)
        return null;
    const base = {
        _id: doc._id.toString(),
        artist: doc.artist || "Unknown Artist",
        title: doc.title || "Untitled",
        genre: doc.genre || "Unknown",
        description: doc.description || "",
        tags: doc.tags || [],
        coverUrl: doc.coverUrl || "",
        createdAt: (_a = doc.createdAt) !== null && _a !== void 0 ? _a : new Date(),
        updatedAt: (_b = doc.updatedAt) !== null && _b !== void 0 ? _b : new Date(),
        viewCount: (_c = doc.views) === null || _c === void 0 ? void 0 : _c.length,
        likeCount: (_d = doc.likes) === null || _d === void 0 ? void 0 : _d.length,
        downloadCount: (_e = doc.downloads) === null || _e === void 0 ? void 0 : _e.length,
        shareCount: (_f = doc.shares) === null || _f === void 0 ? void 0 : _f.length,
        commentCount: doc.commentCount,
        latestComments: serializeComments(doc.latestComments || []),
    };
    switch (type) {
        case "Song":
            return Object.assign(Object.assign({}, base), { album: doc.album || null, language: doc.language || null, releaseDate: doc.releaseDate
                    ? doc.releaseDate
                    : null, fileUrl: doc.fileUrl || "", genre: doc.genre });
        case "Album":
            return Object.assign(Object.assign({}, base), { curator: doc.curator || "Unknown", songs: (_g = doc.songs) === null || _g === void 0 ? void 0 : _g.map((s) => serializeItem(s, "Song")) });
        case "Video":
            return Object.assign(Object.assign({}, base), { fileUrl: doc.videoUrl || "", coverUrl: doc.thumbnailUrl || "", videographer: doc.videographer || "Unknown", genre: doc.genre || "Unknown", releaseDate: doc.releaseDate
                    ? doc.releaseDate
                    : null });
    }
}
function serializeSong(doc) {
    return serializeItem(doc, "Song");
}
async function getTrending({ model, limit, sinceDays = 7 }) {
    await (0, database_1.connectToDatabase)();
    let Model;
    switch (model) {
        case "Song":
            Model = song_1.Song;
            break;
        case "Album":
            Model = album_1.Album;
            break;
        case "Video":
            Model = video_1.Video;
            break;
        default:
            throw new Error("Invalid model type");
    }
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);
    // Fetch items created recently with basic stats
    const items = await Model.find({
        createdAt: { $gte: sinceDate },
    })
        .lean()
        .exec();
    // Compute trending score
    const scoredItems = items.map((item) => {
        var _a, _b, _c, _d;
        const views = ((_a = item.views) === null || _a === void 0 ? void 0 : _a.length) || 0;
        const likes = ((_b = item.likes) === null || _b === void 0 ? void 0 : _b.length) || 0;
        const shares = ((_c = item.shares) === null || _c === void 0 ? void 0 : _c.length) || 0;
        const downloads = ((_d = item.downloads) === null || _d === void 0 ? void 0 : _d.length) || 0;
        const trendingScore = views + likes * 2 + shares * 3 + downloads * 1.5;
        return Object.assign(Object.assign({}, item), { trendingScore });
    });
    // Sort all items
    const sorted = scoredItems.sort((a, b) => b.trendingScore - a.trendingScore);
    // Add chartRank + isTrending (top 100 considered for chartRank)
    const withRank = sorted.slice(0, 100).map((item, index) => (Object.assign(Object.assign({}, item), { chartRank: index + 1, isTrending: index < 10 })));
    // Apply limit for what we actually return
    const top = withRank.slice(0, limit);
    // Serialize for frontend
    return top.map((item) => (Object.assign(Object.assign({}, serializeItem(item, model)), { chartRank: item.chartRank, isTrending: item.isTrending })));
}
/**
 * Increment or toggle a user interaction
 */
async function incrementInteraction(id, model, type, userId) {
    var _a, _b, _c, _d;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        return null;
    try {
        await (0, database_1.connectToDatabase)();
        // Select model
        let Model;
        switch (model) {
            case "Song":
                Model = song_1.Song;
                break;
            case "Album":
                Model = album_1.Album;
                break;
            case "Video":
                Model = video_1.Video;
                break;
            default:
                throw new Error("Invalid model type");
        }
        const field = `${type}s`;
        const userObjectId = userId ? new mongoose_1.Types.ObjectId(userId) : new mongoose_1.Types.ObjectId();
        // Like toggle
        if (type === "like" && userId) {
            const alreadyLiked = await Model.exists({ _id: id, [field]: userObjectId });
            if (alreadyLiked) {
                await Model.updateOne({ _id: id }, { $pull: { [field]: userObjectId } });
            }
            else {
                await Model.updateOne({ _id: id }, { $addToSet: { [field]: userObjectId } });
            }
        }
        else {
            await Model.updateOne({ _id: id }, { $push: { [field]: userObjectId } });
        }
        // ✅ Cast result properly
        const updated = (await Model.findById(id).lean());
        if (globalThis.io && updated) {
            globalThis.io.to(`${model}:${id}`).emit("interaction:update", {
                itemId: id,
                model,
                type,
                counts: {
                    likes: ((_a = updated.likes) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    views: ((_b = updated.views) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    downloads: ((_c = updated.downloads) === null || _c === void 0 ? void 0 : _c.length) || 0,
                    shares: ((_d = updated.shares) === null || _d === void 0 ? void 0 : _d.length) || 0,
                },
            });
        }
        // Trending refresh
        if (globalThis.io) {
            const [songs, albums, videos] = await Promise.all([
                getTrending({ model: "Song", limit: 10 }),
                getTrending({ model: "Album", limit: 10 }),
                getTrending({ model: "Video", limit: 10 }),
            ]);
            globalThis.io.emit("trending:update", { songs, albums, videos });
        }
        return updated;
    }
    catch (error) {
        console.error("INTERACTION_ERROR", error);
        throw error;
    }
}
/**
 * Helper: fetch nested comments with recursive population
 */
async function fetchNestedComments(targetId, model, limit = 3) {
    const comments = await comment_1.Comment.find({
        targetId,
        targetModel: model,
        parent: null,
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user", "_id name image")
        .populate({
        path: "replies",
        populate: [
            { path: "user", select: "_id name image" },
            {
                path: "replies",
                populate: [
                    { path: "user", select: "_id name image" },
                    { path: "replies", populate: { path: "user", select: "_id name image" } },
                ],
            },
        ],
    })
        .lean();
    return serializeComments(comments);
}
/**
 * Generic fetcher with stats + comments
 */
async function getItemWithStats(model, id) {
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw new Error("Invalid MongoDB ObjectId");
    await (0, database_1.connectToDatabase)();
    let Model;
    switch (model) {
        case "Song":
            Model = song_1.Song;
            break;
        case "Album":
            Model = album_1.Album;
            break;
        case "Video":
            Model = video_1.Video;
            break;
        default:
            throw new Error("Invalid model type");
    }
    // fetch doc
    let query = Model.findById(new mongoose_1.Types.ObjectId(id));
    if (model === "Album") {
        query = query.populate("songs");
    }
    const doc = await query.lean();
    if (!doc)
        return null;
    // compute comments + populate nested replies
    const commentCount = await comment_1.Comment.countDocuments({
        targetId: id,
        targetModel: model,
    });
    const latestComments = await fetchNestedComments(id, model, 3);
    return serializeItem(Object.assign(Object.assign({}, doc), { commentCount,
        latestComments }), model);
}
/**
 * Shortcuts
 */
const getSongWithStats = (id) => getItemWithStats("Song", id);
exports.getSongWithStats = getSongWithStats;
const getAlbumWithStats = (id) => getItemWithStats("Album", id);
exports.getAlbumWithStats = getAlbumWithStats;
const getVideoWithStats = (id) => getItemWithStats("Video", id);
exports.getVideoWithStats = getVideoWithStats;
