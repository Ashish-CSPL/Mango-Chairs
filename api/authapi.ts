// src/utils/api.ts

// Define your API base URL here. MAKE SURE THIS IS CORRECT.
const API_BASE_URL = 'https://nxadmin.consociate.co.in';

interface RequestOptions extends RequestInit {
  // RequestInit already includes 'method', 'headers', 'body', etc.
  // We can add custom options if needed, but for now RequestInit is sufficient.
}

/**
 * Reusable function for making API requests.
 * @param path The specific API path (e.g., 'user/verify-email/customer/send-otp/').
 * @param options Custom fetch options (method, headers, body, etc.).
 * @returns A Promise that resolves to the parsed JSON data.
 * @throws An Error if the network request fails or the server responds with an error.
 */
export async function fetchData<T = any>(
  path: string,
  options: RequestOptions = {} // Default to an empty object
): Promise<T> {
  const url = `${API_BASE_URL}/${path}`; // Construct the full URL

  // Default headers, can be overridden by options.headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // 'Accept': 'application/json', // Often useful to add
  };

  try {
    const response = await fetch(url, {
      ...options, // Spread all custom options
      headers: {
        ...defaultHeaders, // Apply default headers first
        ...(options.headers || {}), // Then spread any provided headers to override defaults
      },
      // credentials: 'include', // Uncomment if you need to send cookies (e.g., for session auth)
    });

    // Check if the response was successful (HTTP status 200-299)
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        // Use a more specific error message from the backend if available
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use the default message
        console.warn(`Response for ${url} was not JSON or could not be parsed:`, response.statusText);
      }
      throw new Error(errorMessage);
    }

    // Parse the JSON response
    const data: T = await response.json();
    return data;

  } catch (error: any) {
    // This catch block specifically handles network errors (e.g., CORS, no internet, server down)
    console.error(`Failed to fetch from ${url}:`, error.message);
    throw new Error(error.message || 'An unknown network error occurred.');
  }
}