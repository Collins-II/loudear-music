"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    image: { type: String },
    role: {
        type: String,
        enum: ["fan", "artist"],
        default: "fan",
        index: true,
    },
    isNewUser: { type: Boolean },
    bio: { type: String, maxlength: 2000 },
    location: { type: String, maxlength: 200 },
    phone: { type: String, trim: true },
    genres: [{ type: String, trim: true }],
    // Fan side
    stan: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    // Artist-specific
    stageName: { type: String, trim: true, maxlength: 100 },
    socialLinks: {
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        facebook: { type: String, trim: true },
        tiktok: { type: String, trim: true },
        youtube: { type: String, trim: true },
        website: { type: String, trim: true },
    },
    isVerified: { type: Boolean, default: false },
    followers: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tracks: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Track" }],
    albums: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Album" }],
    streamsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    // 💳 Monetization
    payment: {
        stripeAccountId: { type: String, trim: true },
        paypalEmail: { type: String, trim: true, lowercase: true },
        payoutEnabled: { type: Boolean, default: false },
        mobileMoney: {
            provider: {
                type: String,
                enum: ["MTN", "Airtel", "Zamtel", "Other"],
                trim: true,
            },
            phoneNumber: { type: String, trim: true },
            verified: { type: Boolean, default: false },
            country: { type: String, trim: true, default: "ZM" }, // ISO country code
        },
    },
    // 🎯 Profile completion gamification
    profileCompletion: {
        percentage: { type: Number, default: 0 },
        completedSteps: [{ type: String }],
        lastUpdated: { type: Date, default: Date.now },
    },
}, { timestamps: true });
/** 🔍 Index for faster queries */
UserSchema.index({ name: "text", stageName: "text", genres: 1 });
/** 🧠 Static helper methods */
UserSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};
/** ✨ Instance method to sanitize output (remove private fields) */
UserSchema.methods.toSafeJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    delete obj.phone;
    delete obj.email;
    delete obj.payment; // Hide all payment info (including mobile money)
    return obj;
};
/** ⚙ Prevent recompilation on hot reload */
exports.User = ((_a = mongoose_1.default.models) === null || _a === void 0 ? void 0 : _a.User) || mongoose_1.default.model("User", UserSchema);
exports.default = exports.User;
