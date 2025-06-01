// app/Redux/Slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null; // You might want a more specific type for user
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set loading state
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null; // Clear error when loading
    },
    // Action for successful login/registration
    setAuthSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    // Action for authentication failure
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Action for logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    // Action to update user data (e.g., after profile update)
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setAuthLoading, setAuthSuccess, setAuthError, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;