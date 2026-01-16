const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Contains id, role, etc.
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id.toString();
    console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

    // Join a room specific to this user
    socket.join(userId);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    const targetRoom = userId.toString();
    console.log(`Emitting event "${event}" to user ${targetRoom}`);
    io.to(targetRoom).emit(event, data);
  } else {
    console.warn("Socket.io not initialized, cannot emit event");
  }
};

module.exports = { initSocket, getIO, emitToUser };
