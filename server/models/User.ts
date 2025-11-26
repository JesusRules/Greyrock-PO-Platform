import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcryptjs';

export const userSchema = new mongoose.Schema({ 
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    permissionRole: { type: String, default: 'admin' }, // admin, powerUser, user // Permission roles
    password: { type: String, required: true, default: '000000' },
    // phoneNumber: { type: String, default: '' },
    signedImg: { type: String, default: null, required: false }, // Stores Base64
    departments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    signatureRole: { type: String, default: 'submitter' }, // submitter, manager, generalManager, financeDepartment
    // 🔹 NEW: soft delete / archive flag
    isArchived: { type: Boolean, default: false },
 }, {
    timestamps: true,
    //Hide password
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Remove password when converting to JSON
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password; // Remove password when converting to Object
        return ret;
      },
    },
 })

 // Login
 userSchema.methods.matchPassword = async function (enterPassword: string) {
   return await bcrypt.compare(enterPassword, this.password);
}

// Register
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) { // ✅ Only hash if password exists
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
 export default User;