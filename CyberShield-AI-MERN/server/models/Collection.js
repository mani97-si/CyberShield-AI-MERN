import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    color: {
      type: String,
      default: "#28c7a4"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    scans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scan"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Collection", collectionSchema);
