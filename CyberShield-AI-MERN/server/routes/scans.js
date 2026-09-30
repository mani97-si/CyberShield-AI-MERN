import express from "express";
import Scan from "../models/Scan.js";
import analyze from "../services/analyzer.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Require authentication for all scan operations to ensure strict separation
router.use(verifyToken);

// Create a scan - strictly tied to logged-in user
router.post("/", async (req, res) => {
  try {
    const { type = "url", input = "" } = req.body;
    const result = analyze(input, type);

    const scan = await Scan.create({
      type,
      input,
      ...result,
      userId: req.user._id.toString(),
      userEmail: req.user.email
    });

    res.status(201).json(scan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get scans - strictly separated per user
// Only admins can pass ?scope=all to audit all system scans
router.get("/", async (req, res) => {
  try {
    let filter = {
      $or: [
        { userId: req.user._id.toString() },
        { userEmail: req.user.email }
      ]
    };

    // If admin requests all system scans
    if (req.user.role === "admin" && req.query.scope === "all") {
      filter = {};
    }

    const scans = await Scan.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get scan stats - strictly separated per user
router.get("/stats", async (req, res) => {
  try {
    let filter = {
      $or: [
        { userId: req.user._id.toString() },
        { userEmail: req.user.email }
      ]
    };

    if (req.user.role === "admin" && req.query.scope === "all") {
      filter = {};
    }

    const scans = await Scan.find(filter);
    const total = scans.length;
    const phishing = scans.filter((s) => s.classification === "Phishing").length;
    const suspicious = scans.filter((s) => s.classification === "Suspicious").length;
    const safe = scans.filter((s) => s.classification === "Safe").length;
    const avg = total ? Math.round(scans.reduce((a, s) => a + s.score, 0) / total) : 0;

    res.json({ total, phishing, suspicious, safe, averageRisk: avg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a scan
router.delete("/:id", async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      return res.status(404).json({ message: "Scan record not found." });
    }

    // Only owner of scan or admin can delete
    if (
      req.user.role !== "admin" &&
      scan.userId !== req.user._id.toString() &&
      scan.userEmail !== req.user.email
    ) {
      return res.status(403).json({ message: "Not authorized to delete this scan record." });
    }

    await Scan.findByIdAndDelete(req.params.id);
    res.json({ message: "Scan record deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
