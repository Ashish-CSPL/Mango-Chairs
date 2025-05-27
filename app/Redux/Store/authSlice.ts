// app/Redux/Store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of your user data after successful registration or login
interface User {
  id?: string; // Assuming 'id' might be part of user data
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country_code_for_phone_number?: string;
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  // Add other user fields returned by your API if necessary
}

interface AuthState {
  user: User | null;
  token: string | null; // Added for storing auth token
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  registrationSuccess: boolean;
  otpSent: boolean; // Indicates if OTP has been sent for email verification
  isEmailVerified: boolean; // Indicates if the email has been successfully verified by OTP
}

const initialState: AuthState = {
  user: null,
  token: null, // Initialize token as null
  loading: "idle",
  error: null,
  registrationSuccess: false,
  otpSent: false,
  isEmailVerified: false,
};

// Define interfaces for thunk payloads
interface SendOtpPayload {
  email: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// UPDATED: RegisterUserPayload with 'otp' field
interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  profilePicture: File | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  email: string;
  password: string;
  otp: string; // Add OTP here, as the registration endpoint likely expects it
}

// Login Payload Interface remains the same
interface LoginPayload {
  email: string; // The email provided by the user in the form
  password: string;
}

// Define a general interface for API responses
interface ApiResponse {
  status: boolean;
  message?: string;
  data?: any; // For success responses
  errors?: any; // For error responses
  token?: string; // Assuming token might be returned on login
}

// --- Async Thunks for API Interaction ---

// Async Thunk for sending OTP
export const sendOtp = createAsyncThunk<ApiResponse, SendOtpPayload['email'], { rejectValue: string }>(
  'auth/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch("https://nxadmin.consociate.co.in/user/verify-email/customer/send-otp/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ email }),
        redirect: "follow",
      });

      const rawResultText = await response.text();
      console.log("sendOtp - Raw Server Response Status:", response.status);
      console.log("sendOtp - Raw Server Response Text:", rawResultText);

      let result: ApiResponse;
      try {
        result = rawResultText ? JSON.parse(rawResultText) : {};
      } catch (parseError) {
        console.error("sendOtp - JSON parsing error:", parseError);
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for sendOtp.");
      }

      if (!response.ok || result.status === false) {
        return rejectWithValue(result.message || rawResultText || "Failed to send OTP. Server error.");
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred while sending OTP.');
    }
  }
);

// Async Thunk for verifying OTP
export const verifyOtp = createAsyncThunk<ApiResponse, VerifyOtpPayload, { rejectValue: string }>(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch("https://nxadmin.consociate.co.in/user/verify-email/verify-otp/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ email, otp }),
        redirect: "follow",
      });

      const rawResultText = await response.text();
      console.log("verifyOtp - Raw Server Response Status:", response.status);
      console.log("verifyOtp - Raw Server Response Text:", rawResultText);

      let result: ApiResponse;
      try {
        result = rawResultText ? JSON.parse(rawResultText) : {};
      } catch (parseError) {
        console.error("verifyOtp - JSON parsing error:", parseError);
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for verifyOtp.");
      }

      if (!response.ok || result.status === false) {
        return rejectWithValue(result.message || rawResultText || "Failed to verify OTP. Server error.");
      }
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error or unexpected error');
    }
  }
);

// UPDATED: Async Thunk for user registration to include OTP
export const registerUser = createAsyncThunk<ApiResponse, RegisterUserPayload, { rejectValue: string }>(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const formdata = new FormData();
      formdata.append("email", userData.email);
      formdata.append("first_name", userData.firstName);
      formdata.append("last_name", userData.lastName);
      formdata.append("phone_number", userData.phoneNumber);
      formdata.append("country_code_for_phone_number", userData.countryCode);
      if (userData.profilePicture) {
        formdata.append("profile_picture", userData.profilePicture, userData.profilePicture.name);
      }
      formdata.append("address", userData.address);
      formdata.append("locality", userData.city); // Assuming locality is city for simplicity, adjust if needed
      formdata.append("city", userData.city);
      formdata.append("state", userData.state);
      formdata.append("country", userData.country);
      formdata.append("zipcode", userData.pincode);
      formdata.append("password", userData.password);
      formdata.append("confirm_password", userData.password); // Assuming confirm_password is same as password
      formdata.append("otp", userData.otp); // NEW: Append the OTP

      const response = await fetch("https://nxadmin.consociate.co.in/user/customer-registration/", {
        method: 'POST',
        body: formdata,
        redirect: "follow",
      });

      const rawResultText = await response.text();
      console.log("registerUser - Raw Server Response Status:", response.status);
      console.log("registerUser - Raw Server Response Text:", rawResultText);

      let result: ApiResponse;
      try {
        result = rawResultText ? JSON.parse(rawResultText) : {};
      } catch (parseError) {
        console.error("registerUser - JSON parsing error:", parseError);
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for registration.");
      }

      if (!response.ok || result.status === false) {
        const errorMessage = result.message || (result.errors ? JSON.stringify(result.errors) : null) || rawResultText || "Registration failed due to server error.";
        return rejectWithValue(errorMessage);
      }
      return result; // Return the full result object for success
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred during registration.');
    }
  }
);

// Async Thunk for user login (remains unchanged)
export const loginUser = createAsyncThunk<ApiResponse, LoginPayload, { rejectValue: string }>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch("https://nxadmin.consociate.co.in/user/customer-login/", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ username: email, password }),
        redirect: "follow",
      });

      const rawResultText = await response.text();
      console.log("loginUser - Raw Server Response Status:", response.status);
      console.log("loginUser - Raw Server Response Text:", rawResultText);

      let result: ApiResponse;
      try {
        result = rawResultText ? JSON.parse(rawResultText) : {};
      } catch (parseError) {
        console.error("loginUser - JSON parsing error:", parseError);
        return rejectWithValue(rawResultText || "Server returned non-JSON or empty response for login.");
      }

      if (!response.ok || result.status === false) {
        const errorMessage = result.message || (result.errors ? JSON.stringify(result.errors) : null) || rawResultText || "Login failed. Please check your credentials.";
        return rejectWithValue(errorMessage);
      }
      return result; // Return the full result object on success
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error occurred during login.');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthStatus: (state) => {
      state.loading = 'idle';
      state.error = null;
      state.registrationSuccess = false;
      state.otpSent = false;
      state.isEmailVerified = false;
      state.user = null;
      state.token = null;
    },
    resetEmailVerification: (state) => {
      state.otpSent = false;
      state.isEmailVerified = false;
      state.error = null;
      // Keep loading state as it is to not interrupt ongoing processes
    },
    logout: (state) => { // Added for logout functionality
      state.user = null;
      state.token = null;
      state.loading = 'idle';
      state.error = null;
      state.registrationSuccess = false;
      state.otpSent = false;
      state.isEmailVerified = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // sendOtp
      .addCase(sendOtp.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.otpSent = false;
        state.isEmailVerified = false;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.otpSent = true;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.otpSent = false;
      })
      // verifyOtp
      .addCase(verifyOtp.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = 'succeeded';
        state.isEmailVerified = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.isEmailVerified = false;
      })
      // registerUser (UPDATED)
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
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.registrationSuccess = false;
      })
      // loginUser (remains unchanged)
      .addCase(loginUser.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.user = null;
        state.token = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
        state.loading = 'succeeded';
        state.user = action.payload.data || null;
        state.token = action.payload.token || null;
        state.error = null;
        state.registrationSuccess = false;
        state.otpSent = false;
        state.isEmailVerified = false;
        alert("Login successful!");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      });
  },
});

export const { resetAuthStatus, resetEmailVerification, logout } = authSlice.actions;
export default authSlice.reducer;