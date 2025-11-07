"use strict";
// server.mts
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        handle(req, res);
    });
    const io = new Server(httpServer, {
        cors: { origin: "*" },
    });
    globalThis.io = io;
    io.on("connection", (socket) => {
        console.log("✅ User connected:", socket.id);
        socket.on("join", (room) => {
            socket.join(room);
            console.log(`📥 User ${socket.id} joined room ${room}`);
        });
        // 🔹 Broadcast new comments
        socket.on("comment:new", (payload) => {
            io.to(payload.room).emit("comment:new", payload);
        });
        // 🔹 Broadcast reactions
        socket.on("comment:reaction", (payload) => {
            io.to(payload.room).emit("comment:reaction", payload);
        });
        // 🔹 Broadcast media updates
        socket.on("media:create", (payload) => {
            console.log(`🎵 Media created: ${payload.type} -> ${payload.data.title}`);
            io.emit("media:create", payload);
        });
        socket.on("media:update", (payload) => {
            console.log(`🎵 Media updated: ${payload.type} -> ${payload.data.title}`);
            io.emit("media:update", payload);
        });
        socket.on("media:delete", (payload) => {
            console.log(`🎵 Media deleted: ${payload.type} -> ${payload.id}`);
            io.emit("media:delete", payload);
        });
        // Category update
        socket.on("charts:update:category", (payload) => {
            console.log(`📊 Category update -> ${payload.category}`);
            io.emit("charts:update:category", payload);
        });
        // Item update
        socket.on("charts:update:item", (payload) => {
            console.log(`📊 Item update -> ${payload.id} → pos ${payload.newPos}`);
            io.emit("charts:update:item", payload);
        });
        // 🧡 Handle real-time stan updates
        socket.on("stan:update", (payload) => {
            const { artistId, stanCount, userHasStanned } = payload;
            io.to(`artist:${artistId}`).emit("stan:update", {
                artistId,
                stanCount,
                userHasStanned,
            });
        });
        socket.on("leave", (room) => {
            socket.leave(room);
            console.log(`📤 User ${socket.id} left room ${room}`);
        });
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
    httpServer.listen(3000, () => {
        console.log("🚀 Server running on http://localhost:3000");
    });
});
