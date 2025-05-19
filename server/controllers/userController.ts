import { Request, Response } from "express"
import User from "../models/User"
import { createNoCacheHeaders } from "../utils/noCacheResponse"

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
    const { firstName, lastName, email, login, role, password, phoneNumber } = req.body

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
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to create user" })
  }
}

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body

    const user = await User.findById(id)
    if (!user) {
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: "User not found" });
        return;
    }

    // Update fields
    user.firstName = updates.firstName || user.firstName
    user.lastName = updates.lastName || user.lastName
    user.email = updates.email || user.email
    user.role = updates.role || user.role
    user.phoneNumber = updates.phoneNumber || user.phoneNumber

    if (updates.password) {
      user.password = updates.password // Will be hashed by pre-save hook
    }

    const updated = await user.save()
    res
    .set(createNoCacheHeaders())
    .json({ updatedUser: updated })
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to update user" })
  }
}

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

    await user.deleteOne()
    res
    .set(createNoCacheHeaders())
    .json({ message: "User deleted successfully" })
  } catch (err) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to delete user" })
  }
}
