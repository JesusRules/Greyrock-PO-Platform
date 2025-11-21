import express from "express"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserSignature,
} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post('/users/:id/signature', updateUserSignature);
userRouter.put("/:id", updateUser)
userRouter.delete("/:id", deleteUser)
userRouter.get("/", getUsers)

export default userRouter
