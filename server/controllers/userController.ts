import { Request, Response } from "express"
import User from "../models/User.js"
import { createNoCacheHeaders } from "../utils/noCacheResponse.js"
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res
    .set(createNoCacheHeaders())
    .json({users})
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to fetch users" })
  }
}

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, role, password, phoneNumber } = req.body

    if (!email || !password) {
      res.status(400)
      .set(createNoCacheHeaders())
      .json({ message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res
      .set(createNoCacheHeaders())
      .status(400).json({ message: "User with this email already exists" });
      return;
    }

    const newUser = new User({
      firstName,
      lastName,
      // login,
      email,
      role,
      password,
      phoneNumber,
    })

    const savedUser = await newUser.save()
    res
    .set(createNoCacheHeaders())
    .status(201).json({ newUser: savedUser })
  } catch (err) {
    console.error(err);
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to create user" })
  }
}

export const updateUserSignature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { signature } = req.body; // base64 dataURL from canvas or uploaded image

    const user = await User.findById(id);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "User not found" });
      return;
    }

    // Delete old signature if exists
    if (user.signedImg) {
      const urlParts = user.signedImg.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `po_user_signatures/${fileName.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Deleted previous user signature: ${publicId}`);
      } catch (deleteErr) {
        console.warn("⚠️ Failed to delete old user signature:", deleteErr);
      }
    }

    // Upload new signature
    const cloudinaryRes = await cloudinary.uploader.upload(signature, {
      folder: "po_user_signatures",
    });

    user.signedImg = cloudinaryRes.secure_url;
    const updatedUser = await user.save();

    res
      .status(201)
      .set(createNoCacheHeaders())
      .json({ updatedUser });
  } catch (error) {
    console.error("User signature error:", error);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ error: "Server error" });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404).json({ message: "User not found" });
      return;
    }

    // Optional: validate email format BEFORE saving
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(updates.email)) {
        res
          .set(createNoCacheHeaders())
          .status(400)
          .json({ message: "Invalid email format" });
        return;
      }
    }

    // Update fields safely
    user.firstName = updates.firstName || user.firstName;
    user.lastName = updates.lastName || user.lastName;
    user.email = updates.email || user.email;

    user.role = updates.role || user.role;
    user.phoneNumber =
      "phoneNumber" in updates ? updates.phoneNumber : user.phoneNumber;

    if (updates.password) {
      user.password = updates.password; // hashed by pre-save hook
    }

    const updated = await user.save();

    res
      .set(createNoCacheHeaders())
      .json({ updatedUser: updated });

  } catch (err) {
    console.error(err);
    res
      .set(createNoCacheHeaders())
      .status(500).json({ message: "Failed to update user" });
  }
};

// export const updateUser = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     const updates = req.body

//     const user = await User.findById(id)
//     if (!user) {
//         res
//         .set(createNoCacheHeaders())
//         .status(404).json({ message: "User not found" });
//         return;
//     }

//     // Update fields
//     // user.firstName   = updates.firstName   ?? user.firstName;
//     // user.lastName    = updates.lastName    ?? user.lastName;
//     // user.email       = updates.email       ?? user.email;
//     // user.role        = updates.role        ?? user.role;
//     // user.phoneNumber = updates.phoneNumber ?? user.phoneNumber;
//     user.firstName = updates.firstName || user.firstName
//     user.lastName = updates.lastName || user.lastName
//     user.email = updates.email || user.email
//     user.role = updates.role || user.role
//     user.phoneNumber = updates.phoneNumber || user.phoneNumber
//     if ('phoneNumber' in updates) {
//       user.phoneNumber = updates.phoneNumber; // can be ""
//     }

//     if (updates.password) {
//       user.password = updates.password 
//     }

//     const updated = await user.save()
//     res
//     .set(createNoCacheHeaders())
//     .json({ updatedUser: updated })
//   } catch (err) {
//     res
//     .set(createNoCacheHeaders())
//     .status(500).json({ message: "Failed to update user" })
//   }
// }

export const deleteUserSignature = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "User not found" });
      return;
    }

    // If no signature exists, just return success
    if (!user.signedImg) {
      res
        .status(200)
        .set(createNoCacheHeaders())
        .json({ updatedUser: user });
      return;
    }

    // Extract Cloudinary publicId
    const urlParts = user.signedImg.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `po_user_signatures/${fileName.split(".")[0]}`;

    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ Deleted user signature: ${publicId}`);
    } catch (deleteErr) {
      console.warn("⚠️ Failed to delete old user signature:", deleteErr);
    }

    // Clear signature
    user.signedImg = null;
    const updatedUser = await user.save();

    res
      .status(200)
      .set(createNoCacheHeaders())
      .json({ updatedUser });

  } catch (error) {
    console.error("Signature delete error:", error);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ error: "Server error" });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      res
      .set(createNoCacheHeaders())
      .status(404).json({ message: "User not found" });
      return;
    }

    const userToReturn = user.toObject(); // ✅ Clone user before deletion
    await user.deleteOne()
    res
    .set(createNoCacheHeaders())
    .json({ message: "User deleted successfully", deletedUser: userToReturn })
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to delete user" })
  }
}
