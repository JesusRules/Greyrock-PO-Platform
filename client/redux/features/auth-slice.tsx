import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../axiosSetup';
import { User } from '../../../types/User';

interface AuthState {
    isAuth: boolean;
    // isAdmin: boolean,
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuth: false,
    user: null,
    loading: false,
    error: null
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Set each page
        setUser: (state, action: PayloadAction<User>) => {
            state.isAuth = true;
            state.user = action.payload;
        },
        toggleIsAuth: (state) => { //test
            state.isAuth = !state.isAuth //using Immer (from redux toolkit)
        }
    },
    extraReducers: (builder) => {
        builder
        // Login User
        .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        // Logout User
        .addCase(logoutUser.fulfilled, (state) => {
            state.isAuth = false;
            state.user = null;
        })
        // Update auth user
        // .addCase(updateAuthUser.pending, (state) => {
        //   state.loading = true;
        //   state.error = null;
        // })
        // .addCase(updateAuthUser.fulfilled, (state, action: PayloadAction<User>) => {
        //   state.user = action.payload;
        // })
        // .addCase(updateAuthUser.rejected, (state, action) => {
        //   state.loading = false;
        //   state.error = action.payload || "Failed to update user";
        // })
        // Does updateAuthUser AND updateAuthUserSignature - Shared handlers
        builder
        // Shared handlers:
        .addMatcher(
          (action) =>
            action.type === updateAuthUser.pending.type ||
            action.type === updateAuthUserSignature.pending.type,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )
        .addMatcher(
          (action) =>
            action.type === updateAuthUser.fulfilled.type ||
            action.type === updateAuthUserSignature.fulfilled.type,
          (state, action: PayloadAction<User>) => {
            state.loading = false;
            state.user = action.payload;
          }
        )
        builder.addMatcher(
        (action): action is ReturnType<typeof updateAuthUser.rejected> |
                  ReturnType<typeof updateAuthUserSignature.rejected> =>
          action.type === updateAuthUser.rejected.type ||
          action.type === updateAuthUserSignature.rejected.type,
        (state, action) => {
          state.loading = false
          state.error = (action.payload as string) || "Failed to update user"
        }
      )
    }
})

// Set logging in
export const loginUser = createAsyncThunk<
    { user: User; token: string }, // Return type
    { email: string; password: string }, // Argument type
    { rejectValue: string }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
        const response = await api.post("/api/auth/login", { email, password }, { withCredentials: true });
        const { user, token } = response.data;

         // ✅ Step 2: Store token in cookies (if using cookies for auth)
        //  document.cookie = `token=${token}; path=/; Secure`; // Bad? Let your server's res.cookie() handle everything
         try {
             await api.post("/api/auth/log-record", {}, { withCredentials: true });
             console.log("Login event recorded successfully!");
         } catch (logError) {
             console.error("Failed to log login event:", logError);
         }

        return { user, token };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Login failed");        
    }
  }
)

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
    await api.post("/api/auth/logout");
})


type UpdateUserPayload = {
  _id: string;
  updatedData: Partial<User>;
};

export const updateAuthUser = createAsyncThunk<
  User, // Return type
  UpdateUserPayload, // Argument type
  { rejectValue: string } // Error type
>(
  "auth/updateAuthUser",
  async ({ _id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${_id}`, updatedData);
      return response.data.updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const updateAuthUserSignature = createAsyncThunk<
  User,
  { _id: string; signature: string },
  { rejectValue: string }
>("auth/updateAuthUserSignature", async ({ _id, signature }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/users/${_id}/signature`, { signature });
    return response.data.updatedUser;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update signature"
    );
  }
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;

