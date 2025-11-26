import { Request, Response } from "express"
import User from "../models/User.js"
import { createNoCacheHeaders } from "../utils/noCacheResponse.js"
import { v2 as cloudinary } from "cloudinary";
import Department from "../models/Department.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// // GET /api/users
// export const getUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find().sort({ createdAt: -1 })
//     res
//     .set(createNoCacheHeaders())
//     .json({users})
//   } catch (err) {
//     res
//     .set(createNoCacheHeaders())
//     .status(500).json({ message: "Failed to fetch users" })
//   }
// }
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .populate({
        path: "departments",
        model: Department,
      })
      .sort({ createdAt: -1 });

    res
      .set(createNoCacheHeaders())
      .json({ users });
  } catch (err) {
    console.error("getUsers error:", err);
    res
      .set(createNoCacheHeaders())
      .status(500)
      .json({ message: "Failed to fetch users" });
  }
};

// POST /api/users
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      permissionRole,
      signatureRole,
      password,
      phoneNumber,
      departments, // 👈 grab from body
    } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .set(createNoCacheHeaders())
        .json({ message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .set(createNoCacheHeaders())
        .status(400)
        .json({ message: "User with this email already exists" });
      return;
    }

    // 🔹 Only allow departments if permissionRole === "user"
    let departmentsToSet: any[] = [];
    if (permissionRole === "user" && Array.isArray(departments)) {
      departmentsToSet = departments; // should be array of Department _id's
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      permissionRole,
      signatureRole,
      password,
      phoneNumber,
      departments: departmentsToSet,
    });

    const savedUser = await newUser.save();
    // 🔹 populate departments before returning
    await savedUser.populate("departments");

    res
      .set(createNoCacheHeaders())
      .status(201)
      .json({ newUser: savedUser });
  } catch (err) {
    console.error(err);
    res
      .set(createNoCacheHeaders())
      .status(500)
      .json({ message: "Failed to create user" });
  }
};

export const toggleArchiveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body as { isArchived: boolean };

    const user = await User.findById(id);
    if (!user) {
      res
        .status(404)
        .set(createNoCacheHeaders())
        .json({ message: "User not found" });
      return;
    }

    user.isArchived = !!isArchived;
    const updated = await user.save();
    await updated.populate("departments");

    res
      .status(200)
      .set(createNoCacheHeaders())
      .json({ updatedUser: updated });
    return;
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .set(createNoCacheHeaders())
      .json({ message: "Failed to archive user" });
  }
};

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

// Used in AUTH and USER routes!!!!!!!!
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: "User not found" });
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

    // Basic fields
    user.firstName = updates.firstName ?? user.firstName;
    user.lastName = updates.lastName ?? user.lastName;
    user.email = updates.email ?? user.email;

    // permissionRole / signatureRole / phone
    user.signatureRole = updates.signatureRole ?? user.signatureRole;
    user.phoneNumber =
      "phoneNumber" in updates ? updates.phoneNumber : user.phoneNumber;

    // permissionRole + departments logic
    if (updates.permissionRole) {
      user.permissionRole = updates.permissionRole;

      // Clear departments if not a normal 'user'
      if (updates.permissionRole !== "user") {
        user.departments = [];
      }
    }

    // If departments is passed as an array, set it
    if (Array.isArray(updates.departments)) {
      // assuming these are ObjectIds (or strings) that match Department _id
      user.departments = updates.departments;
    }

    // Password (will be hashed by pre-save hook)
    if (updates.password) {
      user.password = updates.password;
    }

    // Save first
    const savedUser = await user.save();

    // 🔹 Populate departments before returning
    await savedUser.populate("departments");

    res
      .set(createNoCacheHeaders())
      .json({ updatedUser: savedUser });

  } catch (err) {
    console.error(err);
    res
      .set(createNoCacheHeaders())
      .status(500)
      .json({ message: "Failed to update user" });
  }
};

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
  //  res
  //   .set(createNoCacheHeaders())
  //   .json({ message: "CANNOT DELETE" });
  // return;
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
