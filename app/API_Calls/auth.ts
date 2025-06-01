// app/API_Calls/auth.ts
import fetchData, { NEXT_PUBLIC_API_BASE_URL } from "@/api/fetchdata";

// --- Auth API Calls ---

// Login Customer
// Expects an object with 'email' and 'password'
// IMPORTANT: If your backend expects 'username' instead of 'email',
// change 'email: credentials.email' to 'username: credentials.email' below.
// app/API_Calls/auth.ts
// ... (other imports and functions)

// Login Customer
export async function loginCustomer(credentials: { email: string; password: string }) {
  // Changed 'email' to 'username' as this is a common requirement for Django backends
  const payload = { username: credentials.email, password: credentials.password };
  return fetchData("user/customer-login/", "POST", payload);
}

// ... (rest of your auth.ts file)

// Send OTP for email verification
export async function sendOtpForVerification(email: string) {
  const payload = { email };
  return fetchData("user/verify-email/customer/send-otp/", "POST", payload);
}

// Verify OTP
export async function verifyOtp(email: string, otp: string) {
  const payload = { email, otp };
  return fetchData("user/verify-email/verify-otp/", "POST", payload);
}

// Interface for the registration payload (matching your API requirements)
// This ensures type safety for the data sent during registration.
interface RegisterCustomerPayload {
  email: string;
  otp: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country_code_for_phone_number: string;
  profile_picture?: File; // File object for upload
  address: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  password: string;
  confirm_password: string;
}

// Register Customer with all details using FormData for file upload
export async function registerCustomer(data: RegisterCustomerPayload) {
  const formdata = new FormData();

  // Append all text fields to FormData
  formdata.append("email", data.email);
  formdata.append("otp", data.otp);
  formdata.append("first_name", data.first_name);
  formdata.append("last_name", data.last_name);
  formdata.append("phone_number", data.phone_number);
  formdata.append("country_code_for_phone_number", data.country_code_for_phone_number);
  formdata.append("address", data.address);
  formdata.append("locality", data.locality);
  formdata.append("city", data.city);
  formdata.append("state", data.state);
  formdata.append("country", data.country);
  formdata.append("zipcode", data.zipcode);
  formdata.append("password", data.password);
  formdata.append("confirm_password", data.confirm_password);

  // Append profile picture if provided
  if (data.profile_picture) {
    formdata.append("profile_picture", data.profile_picture);
  }

  // Headers are generally not set for FormData; fetch will set 'multipart/form-data' automatically
  const myHeaders = new Headers();
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders, // Keep empty for FormData to allow browser to set boundary
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/user/customer-registration/`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error during customer registration:", error);
    throw error;
  }
}