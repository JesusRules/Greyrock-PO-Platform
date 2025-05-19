import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Prevents duplicates
      trim: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Department = mongoose.models.Department || mongoose.model("Department", departmentSchema);

export default Department;
