const express = require("express");
const {authToken} = require("../Middleware/authMiddleware.js");
const {getUserNotifications} =require("../Controllers/notificationController.js");

const router = express.Router();

router.get("/", authToken, getUserNotifications);

module.exports=router;
