import fetchData from "@/api/fetchdata";
import fetchSecondary from "@/api/fetchSecondary";
import {
  LoginApiResponse,
  RegisterApiResponse,
  OtpResponse,
  RegistrationData,
  ForgotPasswordSendOtpPayload,
  ForgotPasswordVerifyOtpPayload,
  ForgotPasswordResetPayload, // Ensure this type is correctly defined below
} from "@/types/Auth";

// UPDATED: Changed 'email' to 'username' to match backend API structure for login
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

// export const sendOtp = async (email: string) => {
//   try {
//   const response = await fetch("https://536d-2401-4900-1c17-494a-48de-d34b-96f0-fe55.ngrok-free.app/api/auth/sendotp", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email }),
//   });

//   if (!response.ok) {
//     throw new Error(`Server responded with status ${response.status}`);
//   }

//   const res = await response.json();
//   console.log(res, "API Call");
//   return res;
// } catch (error) {
//   console.error("Error sending OTP:", error);
//   return { status: false, message: "Something went wrong" };
// }

// };


export async function verifyOtp(email: string, otp: string): Promise<OtpResponse> {
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

    // Handle file upload (profile_picture) using FormData
    if (registrationData.profile_picture) {
      const formData = new FormData();
      for (const key in registrationData) {
        if (
          key !== "profile_picture" &&
          Object.prototype.hasOwnProperty.call(registrationData, key)
        ) {
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
    // UPDATED: credentials now correctly contains 'username' and 'password'
    const response = await fetchSecondary<LoginApiResponse>(
      "/api/auth/login", // Ensure this endpoint is correct
      "POST",
      {
        body: credentials, // credentials is a plain object, so fetchData will JSON.stringify it and set Content-Type correctly
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