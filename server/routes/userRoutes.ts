import express from "express"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.put("/:id", updateUser)
userRouter.delete("/:id", deleteUser)
userRouter.get("/", getUsers)

export default userRouter
