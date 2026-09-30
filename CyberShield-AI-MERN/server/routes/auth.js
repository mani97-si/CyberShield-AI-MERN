import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Scan from "../models/Scan.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "cybershield_super_secure_jwt_token_secret_2026";

// Get configured admin emails
export const getAdminEmails = () => {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) {
    return envEmails
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return ["admin@cybershield.ai", "security@cybershield.ai"];
};

// Seed default admin accounts if they do not exist yet
export const seedAdminAccounts = async () => {
  const adminEmails = getAdminEmails();
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@12345";
  for (const email of adminEmails) {
    try {
      const existing = await User.findOne({ email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const name = email.split("@")[0].toUpperCase() + " Admin";
        await User.create({
          name,
          email,
          password: hashedPassword,
          role: "admin"
        });
        console.log(`[CyberShield Auth] Seeded Admin Account: ${email} (Password: ${defaultPassword})`);
      } else if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
      }
    } catch (err) {
      console.error(`[CyberShield Auth] Error seeding admin ${email}:`, err.message);
    }
  }
};

// Public endpoint to get designated admin emails
router.get("/admin-emails", (req, res) => {
  const adminEmails = getAdminEmails();
  res.json({ adminEmails });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminEmails = getAdminEmails();
    const isAdminEmail = adminEmails.includes(normalizedEmail);

    // If registering as admin, email MUST be one of the two authorized admin emails
    if (requestedRole === "admin" && !isAdminEmail) {
      return res.status(403).json({
        message: `Admin registration restricted. Only authorized admin emails (${adminEmails.join(" or ")}) can register as Admin.`
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists. Please log in." });
    }

    // Role assignment: if email is in the admin list, grant admin role; otherwise user
    const role = isAdminEmail ? "admin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const adminEmails = getAdminEmails();

    // If logging in through the Admin tab, verify that this is an authorized admin email
    if (loginType === "admin" && !adminEmails.includes(normalizedEmail)) {
      return res.status(403).json({
        message: `Access denied. Only the two authorized admin emails (${adminEmails.join(", ")}) can access Admin login.`
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // If logging in via Admin portal, ensure user is actually an admin
    if (loginType === "admin" && user.role !== "admin") {
      return res.status(403).json({ message: "This account does not have administrator privileges." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Current User Profile
router.get("/me", verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    }
  });
});

// Admin-only: list all registered users with their scan count
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    
    // Attach scan count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const scanCount = await Scan.countDocuments({
          $or: [{ userId: u._id.toString() }, { userEmail: u.email }]
        });
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          scanCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
