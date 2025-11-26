import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { createNoCacheHeaders } from "../utils/noCacheResponse.js";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/auth.js";
import LoginRecord from "../models/LoginRecords.js";
dotenv.config(); // loads .env

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, login, password } = req.body;

    const identifier = (email || login)?.toLowerCase();

    // const user = await User.findOne({ email });
    const user = await User.findOne({
      $or: [{ email: identifier }, 
            // { login: identifier }
      ],
    });
    if (!user) {
      res
      .set(createNoCacheHeaders())
      .status(401).json({ message: "Invalid email or password" });
      return;
    }

    // 🔹 Block archived users
    if (user.isArchived) {
      res
        .status(403)
        .json({ message: "This account has been archived and cannot log in." });
        return;
    }

    // 2. Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res
      .set(createNoCacheHeaders())
      .status(401).json({ message: "Invalid email or password" });
      return;
    }

    // 3. Create JWT
    const token = jwt.sign(
        { id: user._id, permissionRole: user.permissionRole, signatureRole: user.signatureRole },
        process.env.JWT_SECRET!, // ✅ non-null assertion - ! gonna happen
        { expiresIn: "1h" }
    );

    const loginRecord = new LoginRecord({
        user: user._id,
        loggedDate: new Date(),
    });
    await loginRecord.save();

    // 4. Set HTTP-only cookie //
    res
    .set(createNoCacheHeaders())
    .cookie('token', token, {
        httpOnly: true,
        maxAge: 3600 * 1000, // 1 hour
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
        path: '/',
    })
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   maxAge: 3600 * 1000,
    //   path: "/",
    //   // ❌ NO domain
    // });

    // 5. Return user (password is already stripped by your toJSON transform)
    res
    .set(createNoCacheHeaders())
    .json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // login: user.login,
        permissionRole: user.permissionRole,
        signatureRole: user.signatureRole,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",    // ← match your login route
        path: "/",
      })
      .set(createNoCacheHeaders())
      .json({ message: "Logged out" });
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // At this point, protect middleware has already set req.user
        res
        .set(createNoCacheHeaders())
        .status(200).json({ user: req.user });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, permissionRole, signatureRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
      .set(createNoCacheHeaders())
      .status(409).json({ message: "User with this email already exists." });
      return;
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      permissionRole,
      signatureRole,
    });

    await user.save();
    res
    .set(createNoCacheHeaders())
    .status(201).json({ message: "User created", user });
  } catch (err) {
    console.error(err);
    res.status(500)
    .set(createNoCacheHeaders())
    .json({ message: "Server error" });
  }
};

// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const updates = { ...req.body };
//     const { id } = req.params;

//     // const allowedFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'role', 'password'];
//     // const updates = Object.fromEntries(
//     // Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
//     // );

//     // If password is being updated, hash it manually
//     if (updates.password) {
//       const salt = await bcrypt.genSalt(10);
//       updates.password = await bcrypt.hash(updates.password, salt);
//     }

//     const user = await User.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true, // optional: ensure validations apply
//     }).select("-password");

//     if (!user) {
//       res
//       .set(createNoCacheHeaders())
//       .status(404).json({ message: "User not found." });
//       return;
//     }

//     res
//     .set(createNoCacheHeaders())
//     .status(200).json({ message: "User updated", user });
//   } catch (err) {
//     console.error(err);
//     res
//     .set(createNoCacheHeaders())
//     .status(500).json({ message: "Server error" });
//   }
// };

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // or use req.user.id from auth middleware
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "User not found" });
      return;
    }

    // 1) Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "Current password is incorrect" });
      return;
    }

    // 2) Set new password (pre-save hook will hash it)
    user.password = newPassword;
    const updatedUser = await user.save();

    res
      .set(createNoCacheHeaders())
      .json({ updatedUser });
  } catch (err) {
    console.error(err);
    res
      .set(createNoCacheHeaders())
      .status(500)
      .json({ message: "Failed to change password" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "User not found." });
      return;
    }

    res
    .set(createNoCacheHeaders())
    .status(200).json({ message: "User deleted." });
  } catch (err) {
    console.error(err);
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Server error" });
  }
};
