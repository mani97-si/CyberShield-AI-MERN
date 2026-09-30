import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import scanRoutes from "./routes/scans.js";
import authRoutes, { seedAdminAccounts } from "./routes/auth.js";
import collectionRoutes from "./routes/collections.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CyberShield AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/collections", collectionRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cybershield";
    try {
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
      console.log("MongoDB connected successfully");
    } catch (primaryErr) {
      if (primaryUri !== "mongodb://127.0.0.1:27017/cybershield") {
        console.warn("Atlas connection timed out or IP not whitelisted. Connecting to local MongoDB at mongodb://127.0.0.1:27017/cybershield...");
        await mongoose.connect("mongodb://127.0.0.1:27017/cybershield", { serverSelectionTimeoutMS: 5000 });
        console.log("Local MongoDB connected successfully");
      } else {
        throw primaryErr;
      }
    }

    await seedAdminAccounts();
    app.listen(PORT, () => console.log(`CyberShield API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

start();
