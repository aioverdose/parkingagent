/**
 * Optional Socket.io server for real-time live tracking.
 * 
 * For self-hosted deployments where polling (every 3s) isn't fast enough.
 * 
 * Usage:
 *   1. npm install socket.io socket.io-client
 *   2. node socket-server.js
 *   3. Set SOCKET_SERVER=http://localhost:3001 in .env
 * 
 * The client-side wrapper in src/lib/socket.ts will connect to this
 * if SOCKET_SERVER is set, otherwise falls back to REST polling.
 */

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.SOCKET_PORT || 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Socket.io server running");
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Track which match rooms each user is in
// matchId -> { arrivingUserId, departingUserId }
const matchRooms = new Map();

io.on("connection", (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  // Join a match room (called by both arriving and departing users)
  socket.on("join:match", ({ matchId, userId, role }) => {
    socket.join(`match:${matchId}`);
    socket.data.matchId = matchId;
    socket.data.userId = userId;
    socket.data.role = role;

    if (!matchRooms.has(matchId)) {
      matchRooms.set(matchId, { arrivingUserId: null, departingUserId: null });
    }
    const room = matchRooms.get(matchId);
    if (role === "arriving") room.arrivingUserId = userId;
    if (role === "departing") room.departingUserId = userId;

    console.log(`[socket] ${role} user ${userId} joined match ${matchId}`);
  });

  // Arriving user pushes live location
  socket.on("location:update", ({ matchId, latitude, longitude, heading, speed }) => {
    // Broadcast to everyone else in the match room
    socket.to(`match:${matchId}`).emit("location:update", {
      latitude,
      longitude,
      heading,
      speed,
      timestamp: new Date().toISOString(),
      userId: socket.data.userId,
    });
  });

  // Match state transition (e.g., arrived, departing, complete)
  socket.on("match:state", ({ matchId, matchState, message }) => {
    socket.to(`match:${matchId}`).emit("match:state", {
      matchState,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  // Arrival confirmation
  socket.on("arrival:confirmed", ({ matchId }) => {
    socket.to(`match:${matchId}`).emit("arrival:confirmed", {
      timestamp: new Date().toISOString(),
    });
  });

  // Departure started
  socket.on("departure:started", ({ matchId }) => {
    socket.to(`match:${matchId}`).emit("departure:started", {
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`[socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[socket] Server listening on port ${PORT}`);
});
