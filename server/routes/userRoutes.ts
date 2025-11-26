import express from "express"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserSignature,
  deleteUserSignature,
  toggleArchiveUser,
} from "../controllers/userController.js"
import { protect, requireAdmin } from "../middleware/auth.js";

const userRouter = express.Router()

userRouter.post("/", protect, requireAdmin, createUser)
//Archive user
userRouter.patch("/:id/archive", toggleArchiveUser);

userRouter.post('/:id/signature', protect, requireAdmin, updateUserSignature); // Used in auth route
userRouter.delete("/:id/signature", protect, requireAdmin, deleteUserSignature); // Used in auth route
userRouter.put("/:id", protect, requireAdmin, updateUser) // Used in auth route

userRouter.delete("/:id", protect, requireAdmin, deleteUser)
userRouter.get("/", getUsers)

export default userRouter
