import { Request, Response } from "express"
import Department from "server/models/Department"
import { createNoCacheHeaders } from "server/utils/noCacheResponse"

// GET /api/departments
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find().sort({ name: 1 })
    res
    .set(createNoCacheHeaders())
    .json(departments)
  } catch (error) {
    res.status(500)
    .set(createNoCacheHeaders())
    .json({ message: "Failed to fetch departments" })
  }
}

// POST /api/departments
export const createDepartment = async (req: Request, res: Response) => {
  const { name } = req.body

  if (!name) {
    res.status(400)
    .set(createNoCacheHeaders())
    .json({ message: "Department name is required" });
    return;
  }

  const exists = await Department.findOne({ name })
  if (exists) {
    res.status(400)
    .set(createNoCacheHeaders())
    .json({ message: "Department already exists" });
    return;
  }

  const newDepartment = new Department({ name, locked: false })

  try {
    const saved = await newDepartment.save()
    res.status(201)
    .set(createNoCacheHeaders())
    .json(saved)
  } catch (error) {
    res.status(500)
    .set(createNoCacheHeaders())
    .json({ message: "Failed to create department" })
  }
}

// PATCH /api/departments/:id
export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const department = await Department.findById(id)
    if (!department) {
        res.status(404)
        .set(createNoCacheHeaders())
        .json({ message: "Department not found" });
        return;
    }
    if (department.locked) {
        res.status(403)
        .set(createNoCacheHeaders())
        .json({ message: "Department is locked" });
        return;
    }

    department.name = name || department.name
    const updated = await department.save()

    res
    .set(createNoCacheHeaders())
    .json(updated)
  } catch (error) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to update department" })
  }
}

// DELETE /api/departments/:id
export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const department = await Department.findById(id)
    if (!department) {
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: "Department not found" });
        return;
    }
    if (department.locked) {
        res
        .set(createNoCacheHeaders())
        .status(403).json({ message: "Department is locked" });
        return;
    }

    await department.deleteOne()
    res
    .set(createNoCacheHeaders())
    .json({ message: "Department deleted" })
  } catch (error) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: "Failed to delete department" })
  }
}
