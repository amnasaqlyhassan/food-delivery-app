require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Import HTTP module to create a server
const socketIo = require("socket.io"); // Import socket.io for real-time communication

const app = express();
const server = http.createServer(app); // Create an HTTP server instance
const PORT = process.env.PORT || 5000;

// Initialize WebSocket Server (Socket.io)
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow frontend to connect
    methods: ["GET", "POST", "PUT"],
  },
});

// Listen for WebSocket connections
// print statements for debugging
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
  
    // Log when order status updates are sent
    socket.on("orderStatusUpdated", (data) => {
      console.log("Order Update Sent:", data);
    });
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  

// Middleware
app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

// Attach `io` instance to app so it can be used in routes
app.set("io", io);

// Import Routes
const userRoutes = require("./routes/userRoutes");
const eateryRoutes = require("./routes/eateryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const authRoutes = require("./routes/auth");

// Use Routes
app.use("/api/users", userRoutes);
app.use("/api/eateries", eateryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/auth", authRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Food Ordering App is Running!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
