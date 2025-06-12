// types/Auth.ts

export interface LoginApiResponse {
  user: any;
  token: string;
  user_id: string;
  email: string;
  username:string
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
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

// !! IMPORTANT: Ensure 'export' keyword is present here !!
export interface RegistrationData {
  email: string;
  // otp: string;
  name: string;
  // last_name: string;
  // phone_number: string;
  // country_code_for_phone_number: string;
  profile_picture?: File;
  // address: string;
  // locality: string;
  // city: string;
  // state: string;
  // country: string;
  // zipcode: string;
  password: string;
  confirm_password: string;
}

// NEW: Interfaces for Forgot Password API calls
export interface ForgotPasswordSendOtpPayload {
  email: string;
}

export interface ForgotPasswordVerifyOtpPayload {
  email: string;
  otp: string;
}

// types/Auth.ts (Recommended Update)
export interface ForgotPasswordResetPayload {
  email: string;
  otp: number; // or string, depending on your backend
  password: string; // Changed from new_password to password
  confirm_password: string;
}