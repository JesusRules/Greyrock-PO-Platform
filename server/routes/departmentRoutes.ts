import express from "express"
import { protect } from "../middleware/auth"
import { adminOnly } from "../middleware/adminOnly"
import { createDepartment, deleteDepartment, getDepartments, getPONumber, updateDepartment } from "../controllers/departmentController"

const departmentRouter = express.Router()

// GET all departments
departmentRouter.get("/", protect, getDepartments)

// POST new department
departmentRouter.post("/", protect, createDepartment)

// Get next department number route
departmentRouter.post("/po-number", protect, getPONumber)

// PATCH department by ID
departmentRouter.put("/:id", protect, updateDepartment)

// DELETE department by ID
departmentRouter.delete("/:id", protect, deleteDepartment)

export default departmentRouter
