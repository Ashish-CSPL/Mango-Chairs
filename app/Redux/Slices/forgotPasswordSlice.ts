import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ForgotPasswordState {
  email: string;
  otp: string;
  newPasswordStage:
    | "emailInput"
    | "otpVerification"
    | "passwordResetForm"
    | "success";
  loading: boolean;
  error: string | null;
}

const initialState: ForgotPasswordState = {
  email: "",
  otp: "",
  newPasswordStage: "emailInput",
  loading: false,
  error: null,
};

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setOtp: (state, action: PayloadAction<string>) => {
      state.otp = action.payload;
    },
    setNewPasswordStage: (
      state,
      action: PayloadAction<
        "emailInput" | "otpVerification" | "passwordResetForm" | "success"
      >
    ) => {
      state.newPasswordStage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetForgotPasswordState: (state) => {
      // Reset only the states relevant to the forgot password flow
      state.email = "";
      state.otp = "";
      state.newPasswordStage = "emailInput";
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setEmail,
  setOtp,
  setNewPasswordStage,
  setLoading,
  setError,
  resetForgotPasswordState,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;