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

export const { setUser } = authSlice.actions;
export default authSlice.reducer;

