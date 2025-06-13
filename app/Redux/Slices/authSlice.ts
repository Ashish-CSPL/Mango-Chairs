// app/Redux/Slices/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  id: number;
  email: string;
  name: string;
  profile_picture?: string; // This MUST be the key in your Redux state
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: UserData | null;
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
    setAuthSuccess: (
      state,
      action: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = {
        id: action.payload.user.id,
        email: action.payload.user.email,
        name: action.payload.user.name,
        // *** CRUCIAL: Map 'profile' from API to 'profile_picture' in Redux state ***
        profile_picture: action.payload.user.profile || null,
        first_name: action.payload.user.first_name || action.payload.user.name,
        last_name: action.payload.user.last_name || "",
      };
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setAuthLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setAuthSuccess, setAuthLoading, setAuthError, logout } =
  authSlice.actions;

export default authSlice.reducer;