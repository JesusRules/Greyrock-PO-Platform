import express from "express"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserSignature,
  deleteUserSignature,
} from "../controllers/userController.js"
import { protect, requireAdmin } from "../middleware/auth.js";

const userRouter = express.Router()

userRouter.post("/", requireAdmin, createUser)

userRouter.post('/:id/signature', requireAdmin, updateUserSignature); // Used in auth route
userRouter.delete("/:id/signature", requireAdmin, deleteUserSignature); // Used in auth route
userRouter.put("/:id", requireAdmin, updateUser) // Used in auth route

userRouter.delete("/:id", requireAdmin, deleteUser)
userRouter.get("/", getUsers)

export default userRouter
