const connectDb = require('./db');
const http = require("http");
const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoute");
const incidentRoutes = require("./routes/incidentRoute");
const volunteerRoutes = require("./routes/volunteerRoute");
const adminRoutes = require("./routes/adminRoute")


dotenv.config();
connectDb();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});


app.set("io", io);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CrisisConnect API is running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes)


// Socket handlers
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Victim/admin/volunteer joins specific incident tracking room
  socket.on("incident:join-room", ({ incidentId }) => {
    if (!incidentId) return;

    socket.join(`incident_${incidentId}`);

    console.log(`Socket ${socket.id} joined incident_${incidentId}`);
  });

  // User leaves incident room
  socket.on("incident:leave-room", ({ incidentId }) => {
    if (!incidentId) return;

    socket.leave(`incident_${incidentId}`);

    console.log(`Socket ${socket.id} left incident_${incidentId}`);
  });

  // Volunteer live location update
  socket.on("volunteer:location-update", ({ incidentId, volunteerId, coordinates }) => {
    if (!incidentId || !coordinates || coordinates.length !== 2) return;

    io.to(`incident_${incidentId}`).emit("volunteer:location-update", {
      incidentId,
      volunteerId,
      coordinates,
      updatedAt: new Date(),
    });
  });

  // Volunteer status update through socket, optional
  socket.on("volunteer:status-update", ({ incidentId, volunteerId, status }) => {
    if (!incidentId || !status) return;

    io.to(`incident_${incidentId}`).emit("volunteer:status-update", {
      incidentId,
      volunteerId,
      status,
      updatedAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║  🚀 CrisisConnect Server Running          ║
  ║  Port: ${PORT}                              ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}     ║
  ║  MongoDB: ${process.env.MONGO_URI ? '✅ Connected' : '❌ Not Connected'} ║
  ╚═══════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', error.message);
  process.exit(1);
});