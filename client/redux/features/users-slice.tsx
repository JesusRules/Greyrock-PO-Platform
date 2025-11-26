import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { User } from "../../../types/User";
import api from "../../axiosSetup";

// Define the Initial State
type UsersState = {
  users: User[];
  userMutable: User | null,
  initLoad: boolean;
  error: string | null;
};

const initialState: UsersState = {
  users: [],
  userMutable: null,
  initLoad: false,
  error: null,
};

// Create the users slice
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user._id !== action.payload);
    },
    setUserMutable: (state, action: PayloadAction<User>) => {
      state.userMutable = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
        // Getting all Users 
      .addCase(fetchUsers.pending, (state) => {
        state.initLoad = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.initLoad = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.initLoad = false;
        state.error = action.payload as string;
      })
      // Create User
      .addCase(createUser.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        // state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        // state.loading = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload || "Failed to update user";
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        // state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<User>) => {
        // state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload._id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        // state.loading = false;
        state.error = action.payload || "Failed to update user";
      })
      // Update User Signature //////////////////////////////////
      .addCase(updateUserSignature.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(deleteUserSignature.fulfilled, (state, action: PayloadAction<User>) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
      })
      //Archived
      .addCase(archiveUser.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.users.findIndex((u) => u._id === updated._id);
        if (index !== -1) {
          state.users[index] = updated;
        }
      });
  },
});

export const fetchUsers = createAsyncThunk<User[], void>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/users");
      return response.data.users;
    } catch (error) {
      return rejectWithValue("Failed to fetch users");
    }
  }
);

type CreateUserInput = Omit<User, "_id">;

export const createUser = createAsyncThunk<
  User, // ✅ Return type (User)
  CreateUserInput,  // 👈 expects just the input, not full User
  { rejectValue: string } // ✅ Error type
>(
  "users/createUser",
  async (user, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users", user); // ✅ Send user data in body
      return response.data.newUser; // ✅ Return user from API response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  }
);

type UpdateUserPayload = {
  _id: string;
  updatedData: Partial<User>;
};

export const updateUser = createAsyncThunk<
  User, // Return type
  UpdateUserPayload, // Argument type
  { rejectValue: string } // Error type
>(
  "users/updateUser",
  async ({ _id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${_id}`, updatedData);
      return response.data.updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const updateUserSignature = createAsyncThunk<
  User,
  { _id: string; signature: string },
  { rejectValue: string }
>("users/updateUserSignature", async ({ _id, signature }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/users/${_id}/signature`, { signature });
    return response.data.updatedUser;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update signature"
    );
  }
});

export const deleteUserSignature = createAsyncThunk<
  User,
  { _id: string },
  { rejectValue: string }
>("users/deleteUserSignature", async ({ _id }, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/api/auth/${_id}/signature`);
    return response.data.updatedUser;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete signature");
  }
});

export const deleteUser = createAsyncThunk<
  User, // ✅ Return type (Updated User)
  string,
  { rejectValue: string } // ✅ Error type
>(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data.deletedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  }
);

export const archiveUser = createAsyncThunk<
  User,
  { id: string; isArchived: boolean },
  { rejectValue: string }
>("users/archiveUser", async ({ id, isArchived }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/api/users/${id}/archive`, { isArchived });
    return res.data.updatedUser as User;
  } catch (err: any) {
    console.error(err);
    return rejectWithValue("Failed to archive user");
  }
});

export const { setUsers, addUser, removeUser, setUserMutable } = usersSlice.actions;
export default usersSlice.reducer;
