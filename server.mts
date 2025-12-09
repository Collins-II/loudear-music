// server.mts
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import next from "next";
import { CommentSerialized, ReactionType } from "./actions/getItemsWithStats";

/* --------------------------------------------------
   🧠 Global Socket.IO Instance (prevents duplicates)
---------------------------------------------------*/
declare global {
  var io: Server | undefined;
}

/* --------------------------------------------------
   🛠 Setup Next.js + HTTP Server
---------------------------------------------------*/
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  /* --------------------------------------------------
     ⚡ Create Socket.IO server (Singleton safe)
  ---------------------------------------------------*/
  const io =
    globalThis.io ??
    new Server(httpServer, {
      cors: { origin: "*" },
      pingInterval: 25000, // reduces zombie connections
      pingTimeout: 15000,
      maxHttpBufferSize: 1e6,
      connectionStateRecovery: {}, // allows users to reconnect safely
    });

  globalThis.io = io;

  /* --------------------------------------------------
     📌 Logging helper
  ---------------------------------------------------*/
  const log = (...msg: any[]) =>
    console.log(`[${new Date().toISOString()}]`, ...msg);

  /* --------------------------------------------------
     🛡 Safe Emit Wrapper (prevents crash)
  ---------------------------------------------------*/
  const safeEmit = (room: string, event: string, data: any) => {
    try {
      io.to(room).emit(event, data);
    } catch (err) {
      console.error(`❌ Emit error on ${event} to ${room}:`, err);
    }
  };

  /* --------------------------------------------------
     🔥 Handle Socket Connection
  ---------------------------------------------------*/
  io.on("connection", (socket: Socket) => {
    log(`🔌 ${socket.id} connected`);

    /* --------------------------------------------------
       📍 Join Rooms
    ---------------------------------------------------*/
    socket.on("join", (room: string) => {
      socket.join(room);
      log(`📥 ${socket.id} joined room ${room}`);
    });

    /* --------------------------------------------------
       📍 Leave Rooms
    ---------------------------------------------------*/
    socket.on("leave", (room: string) => {
      socket.leave(room);
      log(`📤 ${socket.id} left room ${room}`);
    });

    /* --------------------------------------------------
       📝 Comments (new, replies)
    ---------------------------------------------------*/
    socket.on(
      "comment:new",
      (payload: { room: string; comment: CommentSerialized; parent?: string }) => {
        safeEmit(payload.room, "comment:new", payload);
      }
    );

    /* --------------------------------------------------
       ❤️ Reactions
    ---------------------------------------------------*/
    socket.on(
      "comment:reaction",
      (payload: {
        room: string;
        commentId: string;
        reactions: Record<ReactionType, number>;
      }) => {
        safeEmit(payload.room, "comment:reaction", payload);
      }
    );

    /* --------------------------------------------------
       🎵 Media Events (Song / Album / Video)
    ---------------------------------------------------*/
    const MEDIA_EVENTS = ["media:create", "media:update", "media:delete"] as const;

    MEDIA_EVENTS.forEach((evt) => {
      socket.on(evt, (payload) => {
        log(`🎶 ${evt} → ${payload.type} (${payload?.data?.title || payload?.id})`);
        io.emit(evt, payload);
      });
    });

    /* --------------------------------------------------
       📊 Charts
    ---------------------------------------------------*/
    socket.on("charts:update:category", (payload) => {
      log(`📊 Category update: ${payload.category}`);
      io.emit("charts:update:category", payload);
    });

    socket.on("charts:update:item", (payload) => {
      log(`📈 Item update [${payload.id}] -> ${payload.newPos}`);
      io.emit("charts:update:item", payload);
    });

    /* --------------------------------------------------
       ✨ Real-time Stan Updates
    ---------------------------------------------------*/
    socket.on(
      "stan:update",
      (payload: {
        artistId: string;
        stanCount: number;
        userHasStanned: boolean;
      }) => {
        safeEmit(`artist:${payload.artistId}`, "stan:update", payload);
      }
    );

    /* --------------------------------------------------
       ❤️ Live Notifications (Global & User-specific)
    ---------------------------------------------------*/
    socket.on(
      "notify:global",
      (message: string) => io.emit("notify:global", { message })
    );

    socket.on(
      "notify:user",
      (payload: { userId: string; message: string }) => {
        safeEmit(`user:${payload.userId}`, "notify:user", payload);
      }
    );

    /* --------------------------------------------------
       🔄 Heartbeat (keeps stale clients alive)
    ---------------------------------------------------*/
    socket.on("ping:client", () => socket.emit("ping:server"));

    /* --------------------------------------------------
       ❌ Disconnect Cleanup
    ---------------------------------------------------*/
    socket.on("disconnect", () => {
      log(`❌ ${socket.id} disconnected`);
    });
  });

  /* --------------------------------------------------
     🚀 Boot the Server
  ---------------------------------------------------*/
  httpServer.listen(3000, () =>
    log("🚀 Server running at http://localhost:3000")
  );
});
