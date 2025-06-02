// auth.ts (Hypothetical example based on your error)
import fetchData from "@/api/fetchdata";

// Example function that might be causing the error
export async function subscribeToNewsletter(email: string) {
  // Before (causing the error):
  // const payload = { email: email };
  // await fetchData("frontend/newsletter/", "POST", payload); // <-- This is where the error occurred

  // FIX: Wrap the payload inside the 'body' property of the options object
  try {
    const response = await fetchData(
      "frontend/newsletter/", // Your actual API endpoint for this action
      "POST",
      {
        body: { // <--- THIS IS THE CRUCIAL CHANGE
          email: email,
        },
        // You can add other options here, like 'headers' if needed for authorization
        // headers: {
        //   'Authorization': `Bearer ${yourAuthToken}`,
        // },
      }
    );
    return response; // Or handle the response as needed
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error; // Re-throw or handle as appropriate for your application
  }
}

// Another example (e.g., for login)
export async function loginUser(credentials: { username: string; password: string }) {
    try {
        const response = await fetchData(
            "user/login/", // Replace with your login endpoint
            "POST",
            {
                body: credentials, // The whole credentials object becomes the body
            }
        );
        // Assuming your login response includes a token and user data
        return response;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}