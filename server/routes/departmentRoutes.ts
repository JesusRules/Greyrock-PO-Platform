import express from "express"
import { protect } from "../middleware/auth"
import { adminOnly } from "../middleware/adminOnly"
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "../controllers/departmentController"

const departmentRouter = express.Router()

// GET all departments
departmentRouter.get("/", protect, getDepartments)

// POST new department
departmentRouter.post("/", protect, createDepartment)

// PATCH department by ID
departmentRouter.patch("/:id", protect, updateDepartment)

// DELETE department by ID
departmentRouter.delete("/:id", protect, deleteDepartment)

export default departmentRouter
