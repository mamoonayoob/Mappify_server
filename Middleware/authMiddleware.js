const jwt = require("jsonwebtoken");
const users = require("../Models/Users");
// Middleware to verify from JWT
const authToken = (req, res, next) => {
  // Check both Authorization header (standard) and access-token header (legacy)
  const authHeader = req.headers["authorization"] || req.headers["Authorization"] || req.headers["access-token"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token not provided" });
  }
  
  // Extract token from "Bearer <token>" format or use the header value directly
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : authHeader.split(" ")[1] || authHeader;
  
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: "Invalid Token" });
    }
    req.user = decoded;
    next();
  });
};
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role.toLowerCase())) {
      console.log(roles);
      console.log(req.user);
      return res
        .status(403)
        .json({ message: "Access Denied: Role not allowed" });
    }
    next();
  };
};
module.exports = { authToken, authorizeRoles };