"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
// lib/database/index.ts
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://actscloud28:556088@cluster0.9nkkkej.mongodb.net/loudear_portal?retryWrites=true&w=majority";
// Use global cache to prevent multiple connections in dev
const cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;
const connectToDatabase = async () => {
    if (!MONGODB_URL)
        throw new Error("MONGODB_URL is missing");
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 20000,
        };
        // ✅ Use mongoose.default if needed in ESM
        cached.promise = mongoose_1.default.connect(MONGODB_URL, opts)
            .then((m) => {
            console.log("[MONGOOSE] Connected successfully");
            return m;
        })
            .catch((err) => {
            console.error("[MONGOOSE] Initial connection failed:", err);
            throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};
exports.connectToDatabase = connectToDatabase;
