
import fetchSecondary from "@/api/fetchSecondary"; // Assuming this is for public calls

import {
  LoginApiResponse,
  RegisterApiResponse,
  OtpResponse,
  RegistrationData,
  ForgotPasswordSendOtpPayload,
  ForgotPasswordVerifyOtpPayload,
  ForgotPasswordResetPayload,
} from "@/types/Auth";

// UPDATED: 'email' field in LoginCredentials will be used as 'username' for the backend login API
interface LoginCredentials {
  email: string; // This will now send the email address as 'username'
  password: string;
}

export async function sendOtpForVerification(
  email: string
): Promise<OtpResponse> {
  try {
    // Assuming your OTP API still expects 'email'
    const response = await fetchSecondary<OtpResponse>(
      "/api/auth/sendotp",
      "POST",
      {
        body: { email: email },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending OTP for verification:", error);
    throw error;
  }
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<OtpResponse> {
  try {
    // Assuming your OTP verification API still expects 'email' and 'otp'
    const response = await fetchSecondary<OtpResponse>(
      "/api/auth/verifyotp",
      "POST",
      {
        body: { email: email, otp: otp },
      }
    );
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

export async function registerCustomer(
  registrationData: RegistrationData
): Promise<RegisterApiResponse> {
  try {
    let bodyToSend: Record<string, any> | FormData;

    // Handle file upload (profile) using FormData
    if (registrationData.profile) {
      const formData = new FormData();
      // Append all other non-file properties to FormData
      for (const key in registrationData) {
        if (
          key !== "profile" && // Exclude 'profile' itself, it's handled separately
          Object.prototype.hasOwnProperty.call(registrationData, key)
        ) {
          const value = (registrationData as any)[key];
          if (value !== undefined) {
            formData.append(key, String(value));
          }
        }
      }
      // Append the actual file with the key 'profile_picture' as expected by backend
      formData.append("profile", registrationData.profile);
      bodyToSend = formData;
    } else {
      // If no profile picture, send as JSON
      const { profile, ...jsonBody } = registrationData; // Destructure to exclude profile
      bodyToSend = jsonBody;
    }

    // fetchSecondary will now correctly handle FormData (no manual Content-Type or JSON.stringify)
    const response = await fetchSecondary<RegisterApiResponse>(
      "/api/auth/register",
      "POST",
      {
        body: bodyToSend,
      }
    );
    return response;
  } catch (error) {
    console.error("Error registering customer:", error);
    throw error;
  }
}

export async function loginCustomer(
  credentials: LoginCredentials
): Promise<LoginApiResponse> {
  try {
    // credentials now contains 'email' (for username) and 'password'
    const response = await fetchSecondary<LoginApiResponse>(
      "/api/auth/login", // Ensure this endpoint is correct
      "POST",
      {
        body: credentials, // credentials is a plain object, so fetchSecondary will JSON.stringify it and set Content-Type correctly
      }
    );
    return response;
  } catch (error) {
    console.error("Error logging in customer:", error);
    throw error;
  }
}

// NEW: Forgot Password API Calls
export async function sendOtpForResetPassword(
  email: string
): Promise<OtpResponse> {
  try {
    const response = await fetchSecondary<OtpResponse>(
      "/api/auth/sendotp",
      "POST",
      {
        body: { email: email },
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending OTP for password reset:", error);
    throw error;
  }
}

export async function verifyOtpForResetPassword(
  email: string,
  otp: string
): Promise<OtpResponse> {
  try {
    const response = await fetchSecondary<OtpResponse>(
      "/api/auth/verifyotp",
      "POST",
      {
        body: { email: email, otp: otp },
      }
    );
    return response;
  } catch (error) {
    console.error("Error verifying OTP for password reset:", error);
    throw error;
  }
}

export async function resetCustomerPassword(
  resetData: ForgotPasswordResetPayload
): Promise<RegisterApiResponse> {
  // Using RegisterApiResponse as a placeholder for a generic success response,
  // you might want to create a specific type for reset password success if the API returns different data.
  try {
    const response = await fetchSecondary<RegisterApiResponse>(
      "/api/auth/resetpassword",
      "POST",
      {
        body: resetData,
      }
    );
    return response;
  } catch (error) {
    console.error("Error resetting customer password:", error);
    throw error;
  }
}