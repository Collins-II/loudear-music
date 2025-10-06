// server.mts
import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import { CommentSerialized, ReactionType } from "./actions/getItemsWithStats";

declare global {
  var io: Server | undefined;
}

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

    socket.on("join", (room: string) => {
      socket.join(room);
      console.log(`📥 User ${socket.id} joined room ${room}`);
    });

    // 🔹 Broadcast new comments
    socket.on(
      "comment:new",
      (payload: { room: string; comment: CommentSerialized; parent?: string }) => {
        io.to(payload.room).emit("comment:new", payload);
      }
    );

    // 🔹 Broadcast reactions
    socket.on(
      "comment:reaction",
      (payload: { room: string; commentId: string; reactions: Record<ReactionType, number> }) => {
        io.to(payload.room).emit("comment:reaction", payload);
      }
    );


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

    socket.on("leave", (room: string) => {
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
