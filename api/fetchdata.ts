// app/API_Calls/fetchData.ts

export const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function fetchData(endpoint: string, method: string = 'GET', data?: any) {
  // Construct the full URL for the API call
  const url = `${NEXT_PUBLIC_API_BASE_URL}/${endpoint}`;

  // Initialize headers with common ones like 'Accept'
  const headers: HeadersInit = {
    'Accept': 'application/json', // Indicates client prefers JSON response
  };

  // If there's data and the method is typically sending a body (POST, PUT, PATCH),
  // set the Content-Type to application/json.
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    headers['Content-Type'] = 'application/json';
  }

  // Define the request options
  const options: RequestInit = {
    method: method, // HTTP method (GET, POST, etc.)
    headers: headers, // Request headers
    // For methods that send a body, stringify the data to JSON.
    // Otherwise, 'body' should be undefined.
    body: data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? JSON.stringify(data) : undefined,
  };

  try {
    // Perform the fetch request
    const response = await fetch(url, options);

    // Check if the response was successful (status code 2xx)
    if (!response.ok) {
      const errorText = await response.text(); // Read the response body as text
      let errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;

      try {
        // Attempt to parse the error response as JSON to get detailed messages
        const errorJson = JSON.parse(errorText);
        // Look for common error fields like 'message' or 'detail' from Django REST Framework
        errorMessage = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
      } catch {
        // If the error response is not JSON, use the raw text or a default message
        errorMessage = errorText || errorMessage;
      }
      // Throw an error to be caught by the calling function
      throw new Error(errorMessage);
    }

    // If successful, parse and return the JSON response
    return response.json();
  } catch (error: any) {
    // Log and re-throw the error for centralized error handling in components
    console.error(`Error in fetchData for ${endpoint}:`, error);
    throw error;
  }
}

export default fetchData;