import express from "express";
import Collection from "../models/Collection.js";
import Scan from "../models/Scan.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// All collection routes require authentication
router.use(verifyToken);

// Get all collections for the logged-in user
router.get("/", async (req, res) => {
  try {
    let collections = await Collection.find({ userId: req.user._id })
      .populate("scans")
      .sort({ createdAt: -1 });

    // If user has no collections yet, create default starter collections for them
    if (collections.length === 0) {
      const defaults = [
        {
          name: "Flagged Phishing",
          description: "Malicious links, scam emails, and dangerous domains",
          color: "#ff6b7b",
          userId: req.user._id,
          userEmail: req.user.email,
          scans: []
        },
        {
          name: "Suspicious & Review Later",
          description: "Items needing secondary verification or further analysis",
          color: "#ffd166",
          userId: req.user._id,
          userEmail: req.user.email,
          scans: []
        },
        {
          name: "Verified Safe Items",
          description: "Scanned domains and communications confirmed safe",
          color: "#28c7a4",
          userId: req.user._id,
          userEmail: req.user.email,
          scans: []
        }
      ];
      collections = await Collection.insertMany(defaults);
    }

    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new collection for the logged-in user
router.post("/", async (req, res) => {
  try {
    const { name, description = "", color = "#28c7a4" } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Collection name is required." });
    }

    const collection = await Collection.create({
      name: name.trim(),
      description: description.trim(),
      color,
      userId: req.user._id,
      userEmail: req.user.email,
      scans: []
    });

    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single collection with populated scans
router.get("/:id", async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("scans");

    if (!collection) {
      return res.status(404).json({ message: "Collection not found." });
    }

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a scan to a collection
router.post("/:id/scans", async (req, res) => {
  try {
    const { scanId } = req.body;
    if (!scanId) {
      return res.status(400).json({ message: "scanId is required." });
    }

    // Verify user owns the collection
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found." });
    }

    // Verify scan exists
    const scan = await Scan.findById(scanId);
    if (!scan) {
      return res.status(404).json({ message: "Scan record not found." });
    }

    // Avoid duplicate scans in the collection
    const alreadyExists = collection.scans.some((s) => s.toString() === scanId);
    if (alreadyExists) {
      return res.status(400).json({ message: "Scan is already in this collection." });
    }

    collection.scans.push(scanId);
    await collection.save();

    const populated = await Collection.findById(collection._id).populate("scans");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a scan from a collection
router.delete("/:id/scans/:scanId", async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found." });
    }

    collection.scans = collection.scans.filter(
      (s) => s.toString() !== req.params.scanId
    );
    await collection.save();

    const populated = await Collection.findById(collection._id).populate("scans");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a collection
router.delete("/:id", async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!collection) {
      return res.status(404).json({ message: "Collection not found." });
    }

    res.json({ message: "Collection deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
