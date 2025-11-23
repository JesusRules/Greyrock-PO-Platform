import { createSlice, PayloadAction, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import api from "../../axiosSetup";


interface NotificationsState {
    notifications: any[];
    // notifications: FileOrFolder[];
    loading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    notifications: [],
    loading: false,
    error: null,
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});


export const fetchNotifications = createAsyncThunk(
    "notifications/fetch",
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.get("/api/notifications");
        return response.data.notifications;
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
      }
    }
);

export const { 
    // Reducers here
    } = notificationsSlice.actions;
export default notificationsSlice.reducer;
