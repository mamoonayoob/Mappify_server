const express = require("express");
const router = express.Router();
const { registerUser, LogInUser } = require("../Controllers/authControllers");

// Routes
router.post("/signup", registerUser);
router.post("/login", LogInUser);

module.exports = router;
