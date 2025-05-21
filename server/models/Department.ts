import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Prevents duplicates
      trim: true,
    },
    departmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    poCounter: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Department = mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default Department;
