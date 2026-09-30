import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    input: { type: String, required: true },
    score: { type: Number, required: true },
    classification: { type: String, required: true },
    confidence: { type: Number, required: true },
    threatCategory: { type: String, required: true },
    indicators: [{ type: String }],
    recommendations: [{ type: String }],
    userId: { type: String, default: null },
    userEmail: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Scan", scanSchema);
