// src/app/Redux/Store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchData } from '@/api/authapi';

// IMPORTANT: The API_BASE_URL should NOT be defined here anymore.
// It should ONLY be in src/utils/api.ts
// const API_BASE_URL = 'https://your-api-base-url.com'; // REMOVE THIS LINE!

// 1. Define Interfaces for Thunk Payloads (Keep these as they are)
interface SendOtpPayload {
  email: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface RegisterUserPayload {
  fullName: string;
  email: string;
  password: string;
}

// 2. (Optional but recommended) Define a general interface for API responses (Keep this as it is)
interface ApiResponse {
  message?: string;
  error?: string;
  [key: string]: any;
}

// Async Thunk for sending OTP
export const sendOtp = createAsyncThunk<ApiResponse, SendOtpPayload['email'], { rejectValue: string }>(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      // <--- MODIFIED: Use fetchData
      const data = await fetchData<ApiResponse>('user/verify-email/customer/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error or unexpected error');
    }
  }
);

// Async Thunk for verifying OTP
export const verifyOtp = createAsyncThunk<ApiResponse, VerifyOtpPayload, { rejectValue: string }>(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      // <--- MODIFIED: Use fetchData
      const data = await fetchData<ApiResponse>('user/verify-email/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error or unexpected error');
    }
  }
);

// Async Thunk for user registration
export const registerUser = createAsyncThunk<ApiResponse, RegisterUserPayload, { rejectValue: string }>(
  'auth/registerUser',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      // <--- MODIFIED: Use fetchData
      const data = await fetchData<ApiResponse>('user/customer-registration/', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error or unexpected error during registration');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    otpSent: false,
    isEmailVerified: false,
    loading: 'idle',
    error: null as string | null,
    registrationSuccess: false,
  },
  reducers: {
    resetAuthStatus: (state) => {
      state.otpSent = false;
      state.isEmailVerified = false;
      state.loading = 'idle';
      state.error = null;
      state.registrationSuccess = false;
    },
    resetEmailVerification: (state) => {
      state.otpSent = false;
      state.isEmailVerified = false;
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // sendOtp
      .addCase(sendOtp.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // verifyOtp
      .addCase(verifyOtp.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.isEmailVerified = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.registrationSuccess = true;
        state.otpSent = false;
        state.isEmailVerified = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.registrationSuccess = false;
      });
  },
});

export const { resetAuthStatus, resetEmailVerification } = authSlice.actions;
export default authSlice.reducer;