const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

require("dotenv").config();
// require("./config/cronJobs");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// DB connect
const dbConnect = require("./config/dbConnection");
dbConnect();

// Routes
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/user");
const vendorRoute = require("./routes/vendor");
const adminRoute = require("./routes/admin");

app.use("/api/auth", authRoute);
app.use("/api", userRoute);
app.use("/api", vendorRoute);
app.use("/api", adminRoute);

app.get("/", (req, res) => {
  return res.send("E-Commerce Server is Running...");
});

// 🔥 Socket.IO Setup
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users = {}; // Maps userId => socket.id

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // User joins their room
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    socket.join(userId);
    console.log(`🟢 User ${userId} joined with socket ID: ${socket.id}`);
  });

  // Handle sending message
  socket.on("send-message", ({ senderId, receiverId, message }) => {
    console.log("📤 Message emitted:", { senderId, receiverId, message });

    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", {
        senderId,
        message,
        timestamp: new Date().toISOString(),
      });
      console.log(`📩 Message sent to ${receiverId}`);
    } else {
      console.log(`⚠️ Receiver ${receiverId} not connected.`);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
