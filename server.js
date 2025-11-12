// const express = require("express");
// const dotenv=require("dotenv");
// const cors =require("cors");
// const connectDB =require("./Config/DBConnection/dbConnection");
// const authRoutes=require("./Routes/authRoutes");
// const propertyRoutes = require("./Routes/ropertyRoutes");
// const buildingRoutes = require("./Routes/buildingRoutes");
// const unitRoutes = require("./Routes/unitRoutes");
// const bookingRoutes=  require("./Routes/bookingRoutes");


// dotenv.config();
// const app = express();
// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// // DB Connect
// connectDB();

// // Simple route test
// app.get("/", (req, res) => {
//   res.send("Smart Property Management API Running...");
// });
// //auth Routes
// app.use("/api", authRoutes);
// //Property Routes
// app.use("/api/properties", propertyRoutes);
// //building Routes
// app.use("/api/buildings", (req, res, next) => {
//   console.log("✅ Reached /api/buildings route");
//   next();
// }, buildingRoutes);

// //units Routes
// app.use("/api/units", unitRoutes);
// //Booking routes
// app.use("/api/bookings", bookingRoutes);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>   console.log(
//     `My Project Task List Management System is Runing at Port ${PORT}`
//   ));


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./Config/DBConnection/dbConnection");
const authRoutes = require("./Routes/authRoutes");
const propertyRoutes = require("./Routes/ropertyRoutes"); 
const buildingRoutes = require("./Routes/buildingRoutes");
const unitRoutes = require("./Routes/unitRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const searchRoutes = require("./Routes/searchRoutes.js");
const notificationRoutes =require("./Routes/notificationRoutes.js");
const adminRoutes = require("./Routes/adminRoutes");
const managerRoutes = require("./Routes/ManagerRoutes.js");




dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
  origin: "http://localhost:3000", // frontend origin
  credentials: true, // allow cookies/headers
  methods: ["GET", "POST", "PUT", "DELETE"],
}
)
);

// DB Connect
connectDB();

// Simple test route
app.get("/", (req, res) => {
  res.send("Smart Property Management API Running...");
});

// Routes
//auth Routes
app.use("/api", authRoutes);
//property Routes
app.use("/api/properties", propertyRoutes);
//building Routes
app.use("/api/buildings", (req, res, next) => {
  console.log("✅ Reached /api/buildings route");
  next();
}, buildingRoutes);
//unit Routes
app.use("/api/units", unitRoutes);
//booking Routes
app.use("/api/bookings", bookingRoutes);
//search Routes
app.use("/api/search", searchRoutes);
//notification Routes
app.use("/api/notifications", notificationRoutes);
//admim Routes
app.use("/api/admin", adminRoutes);
//manager Routes
app.use("/api/manager", managerRoutes);


// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Make Socket.IO instance accessible in controllers
app.set("io", io);

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("✅ User connected:abc", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Smart Property Management API running on port ${PORT}`)
);