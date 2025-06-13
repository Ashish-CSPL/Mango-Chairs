// types/Auth.ts

export interface LoginApiResponse {
  user: any;
  token: string;
  user_id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile?: string;
}

export interface RegisterApiResponse {
  token: string;
  user: any;
  message: string;
  user_id?: string;
  email?: string;
}

export interface OtpResponse {
  message: string;
}

export interface RegistrationData {
  email: string;
  name: string;
  profile?: File; // 'profile' expects a File object
  password: string;
}

// NEW: Interfaces for Forgot Password API calls
export interface ForgotPasswordSendOtpPayload {
  email: string;
}

export interface ForgotPasswordVerifyOtpPayload {
  email: string;
  otp: string;
}

// Recommended Update
export interface ForgotPasswordResetPayload {
  email: string;
  otp: number; // or string, depending on your backend
  password: string;
  confirm_password: string;
}