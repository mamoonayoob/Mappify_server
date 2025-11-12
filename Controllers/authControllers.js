const users = require("../Models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ Register (Signup)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, cnic, password, role } = req?.body;
    console.log("Registration Request Data:", req.body);

    // Required fields validation
    if (!email) {
      return res.status(400).json({ message: "Email is required for registration" });
    }
    if (!cnic) {
      return res.status(400).json({ message: "CNIC is required for registration" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required for registration" });
    }

    // Check if user already exists by email or CNIC
    const exists = await users.findOne({ $or: [{ email }, { cnic }] });
    if (exists) {
      return res.status(409).json({ message: "Email or CNIC is already registered" });
    }

    // Hash password before saving
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    console.log("Encrypted password:", hashedPassword);

    // Create user
    const data = await users.create({
      name,
      email,
      cnic,
      password: hashedPassword,
      role,
    });

    // Emit dashboard update for admin
    const io = req.app?.get("io");
    if (io) {
      const { emitDashboardUpdate } = require("./adminController");
      await emitDashboardUpdate(io);
    }

    // Return success response
    res.status(201).json({
      message: "Successfully Registered",
      data: {
        id: data._id,
        name: data.name,
        email: data.email,
        cnic: data.cnic,
        role: data.role,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Error in user registration",
      error: error.message,
    });
  }
};

// ✅ Login
exports.LogInUser = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    console.log("object,",req.body)
    console.log("Login Request Data:", req.body);

    // Required fields validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required to login" });
    }

    // Check if user exists
    const data = await users.findOne({email});
    console.log("User Found:", data);
    if (!data) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare password
    const comparedPassword = await bcrypt.compare(password, data.password);
    if (!comparedPassword) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // JWT Payload
    const payload = {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    };

    // Generate JWT token
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30min",
    });

    // Successful response
    res.status(200).json({
      message: "Login Successful",
      user: {
        id: data._id,
        name: data.name,
        email: data.email,
        cnic: data.cnic,
        role: data.role,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login Error", error: error.message });
  }
};
