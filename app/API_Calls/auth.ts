// app/API_Calls/auth.ts

import fetchData from "@/api/fetchdata";
import {
  LoginApiResponse,
  RegisterApiResponse,
  OtpResponse,
  RegistrationData,
} from "@/types/Auth";

// UPDATED: Changed 'email' to 'username' to match backend API structure for login
interface LoginCredentials {
  username: string; // This will now send the email address as 'username'
  password: string;
}

export async function sendOtpForVerification(email: string): Promise<OtpResponse> {
  try {
    // Assuming your OTP API still expects 'email'
    const response = await fetchData<OtpResponse>(
      "user/verify-email/customer/send-otp/",
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

export async function verifyOtp(email: string, otp: string): Promise<OtpResponse> {
  try {
    // Assuming your OTP verification API still expects 'email' and 'otp'
    const response = await fetchData<OtpResponse>(
      "/user/verify-email/verify-otp/",
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

export async function registerCustomer(registrationData: RegistrationData): Promise<RegisterApiResponse> {
  try {
    let bodyToSend: Record<string, any> | FormData;

    // Handle file upload (profile_picture) using FormData
    if (registrationData.profile_picture) {
      const formData = new FormData();
      for (const key in registrationData) {
        if (key !== "profile_picture" && Object.prototype.hasOwnProperty.call(registrationData, key)) {
          const value = (registrationData as any)[key];
          if (value !== undefined) {
              // Note: If your backend register API expects 'username' instead of 'email' for registration,
              // you might need to adjust 'email' to 'username' here too.
              // For now, assuming registrationData.email is correct for registration API.
              formData.append(key, String(value));
          }
        }
      }
      formData.append("profile_picture", registrationData.profile_picture);
      bodyToSend = formData;
    } else {
      // If no profile picture, send as JSON
      const { profile_picture, ...jsonBody } = registrationData; // Destructure to exclude profile_picture
      bodyToSend = jsonBody;
    }

    // fetchData will now correctly handle FormData (no manual Content-Type or JSON.stringify)
    const response = await fetchData<RegisterApiResponse>(
      "user/customer-registration/",
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

export async function loginCustomer(credentials: LoginCredentials): Promise<LoginApiResponse> {
  try {
    // UPDATED: credentials now correctly contains 'username' and 'password'
    const response = await fetchData<LoginApiResponse>(
      "user/customer-login/", // Ensure this endpoint is correct
      "POST",
      {
        body: credentials, // `credentials` is a plain object, so fetchData will JSON.stringify it and set Content-Type correctly
      }
    );
    return response;
  } catch (error) {
    console.error("Error logging in customer:", error);
    throw error;
  }
}