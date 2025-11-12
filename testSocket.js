const { io } = require("socket.io-client");

// Connect to your backend server
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected to backend with Socket ID:", socket.id);
});

// Listen for booking events
socket.on("unitBooked", (data) => {
  console.log("🔴 Unit Booked:", data.unitId);
});

socket.on("unitReleased", (data) => {
  console.log("🟢 Unit Released:", data.unitId);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from backend");
});
