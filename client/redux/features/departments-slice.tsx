import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { Department } from "../../../types/Department"
import api from "../../axiosSetup"

interface DepartmentState {
  departments: Department[]
  loading: boolean
  error: string | null
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
}

// ✅ Slice

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.departments = action.payload
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch departments"
      })

      // Create
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload)
      })

      // Update
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.departments.findIndex((d) => d._id === action.payload._id)
        if (index !== -1) {
          state.departments[index] = action.payload
        }
      })

      // Delete
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d._id !== action.payload)
      })
  },
})

// ✅ Async Thunks

export const fetchDepartments = createAsyncThunk("departments/fetchAll", async () => {
  const response = await api.get("/api/departments")
  return response.data as Department[]
})

export const createDepartment = createAsyncThunk(
  "departments/create",
  async (newName: string) => {
    const response = await api.post("/api/departments", { name: newName })
    return response.data as Department
  }
)

export const updateDepartment = createAsyncThunk(
  "departments/update",
  async ({ id, name }: { id: string; name: string }) => {
    const response = await api.patch(`/api/departments/${id}`, { name })
    return response.data as Department
  }
)

export const deleteDepartment = createAsyncThunk(
  "departments/delete",
  async (id: string) => {
    await api.delete(`/api/departments/${id}`)
    return id
  }
)

export default departmentSlice.reducer
