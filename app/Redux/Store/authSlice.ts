// app/Redux/Store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of your user data after successful registration or login
export interface User {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: number;
  country_code_for_phone_number?: string;
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  profile_picture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  registrationSuccess: boolean;
  otpSent: boolean;
  isEmailVerified: boolean;
  resetPasswordOTPSent: boolean;
  resetPasswordOTPVerified: boolean;
  passwordResetSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: "idle",
  error: null,
  registrationSuccess: false,
  otpSent: false,
  isEmailVerified: false,
  resetPasswordOTPSent: false,
  resetPasswordOTPVerified: false,
  passwordResetSuccess: false,
};

// Define interfaces for thunk payloads (unchanged)
interface SendOtpPayload { email: string; }
interface VerifyOtpPayload { email: string; otp: string; }
interface RegisterUserPayload {
  firstName: string; lastName: string; phoneNumber: string; countryCode: string;
  profilePicture: File | null; address: string; city: string; state: string;
  country: string; pincode: string; email: string; password: string; otp: string;
}
interface LoginPayload { email: string; password: string; }
interface ForgotPasswordPayload { email: string; }
interface VerifyResetPasswordOtpPayload { email: string; otp: string; }
interface ResetPasswordPayload {
  email: string; otp: string; newPassword: string; confirmNewPassword: string;
}

// UPDATED: Define a general interface for API responses to match your actual API response
// This interface now reflects the top-level properties returned by your login response
interface ApiResponse {
  status: boolean; // Assuming status is always boolean
  message?: string;
  errors?: any;
  // Directly include fields that are present at the top level of the login response
  token?: string;
  id?: number;
  first_name?: string;
  last_name?: string;
  phone_number?: number;
  email?: string;
  profile_picture?: string;
}

// --- Async Thunks ---
export const sendOtp = createAsyncThunk<ApiResponse, string, { rejectValue: string }>(
  'auth/sendOtp', async (email, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/verify-email/customer/send-otp/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ email }), redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for sendOtp.");
      }
      if (!response.ok || result.status === false) { return rejectWithValue(result.message || rawResultText || "Failed to send OTP. Server error."); }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error occurred while sending OTP.'); }
  }
);

export const verifyOtp = createAsyncThunk<ApiResponse, VerifyOtpPayload, { rejectValue: string }>(
  'auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/verify-email/verify-otp/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ email, otp }), redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for verifyOtp.");
      }
      if (!response.ok || result.status === false) { return rejectWithValue(result.message || rawResultText || "Failed to verify OTP. Server error."); }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error or unexpected error'); }
  }
);

export const registerUser = createAsyncThunk<ApiResponse, RegisterUserPayload, { rejectValue: string }>(
  'auth/registerUser', async (userData, { rejectWithValue }) => {
    try {
      const formdata = new FormData();
      formdata.append("email", userData.email); formdata.append("first_name", userData.firstName);
      formdata.append("last_name", userData.lastName); formdata.append("phone_number", userData.phoneNumber.toString());
      formdata.append("country_code_for_phone_number", userData.countryCode);
      if (userData.profilePicture) { formdata.append("profile_picture", userData.profilePicture, userData.profilePicture.name); }
      formdata.append("address", userData.address); formdata.append("locality", userData.city);
      formdata.append("city", userData.city); formdata.append("state", userData.state);
      formdata.append("country", userData.country); formdata.append("zipcode", userData.pincode);
      formdata.append("password", userData.password); formdata.append("confirm_password", userData.password);
      formdata.append("otp", userData.otp);
      const response = await fetch("https://nxadmin.consociate.co.in/user/customer-registration/", {
        method: 'POST', body: formdata, redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for registration.");
      }
      if (!response.ok || result.status === false) {
        const errorMessage = result.message || (result.errors ? JSON.stringify(result.errors) : null) || rawResultText || "Registration failed due to server error.";
        return rejectWithValue(errorMessage);
      }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error occurred during registration.'); }
  }
);

export const loginUser = createAsyncThunk<ApiResponse, LoginPayload, { rejectValue: string }>(
  'auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/customer-login/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ username: email, password }), redirect: "follow",
      });
      const rawResultText = await response.text();

      let result: ApiResponse;
      try {
        result = rawResultText ? JSON.parse(rawResultText) : {};
      } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for login.");
      }

      if (!response.ok || result.status === false) {
        const errorMessage = result.message || (result.errors ? JSON.stringify(result.errors) : null) || rawResultText || "Login failed. Please check your credentials.";
        return rejectWithValue(errorMessage);
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred during login.');
    }
  }
);

export const forgotPassword = createAsyncThunk<ApiResponse, ForgotPasswordPayload, { rejectValue: string }>(
  'auth/forgotPassword', async ({ email }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/reset-password/customer/send-otp/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ email }), redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for forgot password OTP.");
      }
      if (!response.ok || result.status === false) { return rejectWithValue(result.message || rawResultText || "Failed to send OTP. Server error."); }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error occurred while sending password reset OTP.'); }
  }
);

export const verifyResetPasswordOtp = createAsyncThunk<ApiResponse, VerifyResetPasswordOtpPayload, { rejectValue: string }>(
  'auth/verifyResetPasswordOtp', async ({ email, otp }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/reset-password/verify-otp/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ email, otp }), redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for verifying reset password OTP.");
      }
      if (!response.ok || result.status === false) { return rejectWithValue(result.message || rawResultText || "Failed to verify password reset OTP. Server error."); }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error or unexpected error during password reset OTP verification'); }
  }
);

export const resetPassword = createAsyncThunk<ApiResponse, ResetPasswordPayload, { rejectValue: string }>(
  'auth/resetPassword', async ({ email, otp, newPassword, confirmNewPassword }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers(); myHeaders.append("Content-Type", "application/json");
      const response = await fetch("https://nxadmin.consociate.co.in/user/reset-password/", {
        method: "POST", headers: myHeaders, body: JSON.stringify({ email, otp, new_password: newPassword, confirm_password: confirmNewPassword }), redirect: "follow",
      });
      const rawResultText = await response.text();
      let result: ApiResponse;
      try { result = rawResultText ? JSON.parse(rawResultText) : {}; } catch (parseError) {
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for password reset.");
      }
      if (!response.ok || result.status === false) {
        const errorMessage = result.message || (result.errors ? JSON.stringify(result.errors) : null) || rawResultText || "Password reset failed. Server error.";
        return rejectWithValue(errorMessage);
      }
      return result;
    } catch (error: any) { return rejectWithValue(error.message || 'Network error occurred during password reset.'); }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state: AuthState) => {
      state.loading = 'idle'; state.error = null; state.registrationSuccess = false;
      state.otpSent = false; state.isEmailVerified = false; state.user = null; state.token = null;
      state.resetPasswordOTPSent = false; state.resetPasswordOTPVerified = false; state.passwordResetSuccess = false;
    },
    resetEmailVerification: (state: AuthState) => {
      state.otpSent = false; state.isEmailVerified = false; state.error = null;
    },
    resetPasswordResetStatus: (state: AuthState) => {
      state.loading = 'idle'; state.error = null;
      state.resetPasswordOTPSent = false; state.resetPasswordOTPVerified = false; state.passwordResetSuccess = false;
    },
    logout: (state: AuthState) => { // This action will be intercepted by the rootReducer in store.ts
      state.user = null; state.token = null; state.loading = 'idle'; state.error = null;
      state.registrationSuccess = false; state.otpSent = false; state.isEmailVerified = false;
      state.resetPasswordOTPSent = false; state.resetPasswordOTPVerified = false; state.passwordResetSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => { state.loading = 'pending'; state.error = null; state.otpSent = false; state.isEmailVerified = false; })
      .addCase(sendOtp.fulfilled, (state) => { state.loading = 'succeeded'; state.otpSent = true; state.error = null; })
      .addCase(sendOtp.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.otpSent = false; })
      .addCase(verifyOtp.pending, (state) => { state.loading = 'pending'; state.error = null; })
      .addCase(verifyOtp.fulfilled, (state) => { state.loading = 'succeeded'; state.isEmailVerified = true; state.error = null; state.otpSent = false; })
      .addCase(verifyOtp.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.isEmailVerified = false; })
      .addCase(registerUser.pending, (state) => { state.loading = 'pending'; state.error = null; state.registrationSuccess = false; })
      .addCase(registerUser.fulfilled, (state) => { state.loading = 'succeeded'; state.registrationSuccess = true; state.otpSent = false; state.isEmailVerified = false; state.error = null; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.registrationSuccess = false; })
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending'; state.error = null; state.user = null; state.token = null;
      })
      // CRITICAL FIX: Access properties directly from action.payload
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
        state.loading = 'succeeded';
        state.user = { // Manually construct the user object from the top-level properties
            id: action.payload.id,
            email: action.payload.email || '', // Email is mandatory in User interface
            first_name: action.payload.first_name,
            last_name: action.payload.last_name,
            phone_number: action.payload.phone_number,
            profile_picture: action.payload.profile_picture,
            // Add other user fields if they are consistently returned by your API
            // For example: country_code_for_phone_number: action.payload.country_code_for_phone_number,
            // address: action.payload.address, etc.
        };
        state.token = action.payload.token || null;
        state.error = null; state.registrationSuccess = false; state.otpSent = false;
        state.isEmailVerified = false; state.resetPasswordOTPSent = false;
        state.resetPasswordOTPVerified = false; state.passwordResetSuccess = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed'; state.error = action.payload as string; state.user = null; state.token = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = 'pending'; state.error = null; state.resetPasswordOTPSent = false; state.resetPasswordOTPVerified = false; state.passwordResetSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = 'succeeded'; state.resetPasswordOTPSent = true; state.error = null; })
      .addCase(forgotPassword.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.resetPasswordOTPSent = false; })
      .addCase(verifyResetPasswordOtp.pending, (state) => { state.loading = 'pending'; state.error = null; state.resetPasswordOTPVerified = false; })
      .addCase(verifyResetPasswordOtp.fulfilled, (state) => { state.loading = 'succeeded'; state.resetPasswordOTPVerified = true; state.error = null; state.resetPasswordOTPSent = false; })
      .addCase(verifyResetPasswordOtp.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.resetPasswordOTPVerified = false; })
      .addCase(resetPassword.pending, (state) => { state.loading = 'pending'; state.error = null; state.passwordResetSuccess = false; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = 'succeeded'; state.passwordResetSuccess = true; state.error = null; state.resetPasswordOTPSent = false; state.resetPasswordOTPVerified = false; })
      .addCase(resetPassword.rejected, (state, action) => { state.loading = 'failed'; state.error = action.payload as string; state.passwordResetSuccess = false; });
  },
});

export const { resetAuthStatus, resetEmailVerification, resetPasswordResetStatus, logout } = authSlice.actions;
export default authSlice.reducer;