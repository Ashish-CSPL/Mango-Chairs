// fetchData.ts
const NEXT_PUBLIC_API_BASE_URL = "https://nxadmin.consociate.co.in";

/**
 * Fetches data from the specified API endpoint.
 *
 * @param endpoint The API endpoint (e.g., "frontend/products/").
 * @param params Optional: An object of query parameters for the URL (e.g., { page: 1, limit: 10 }).
 * @returns A Promise that resolves to the JSON data from the API.
 * @throws An Error if the network request fails or the API returns a non-OK status.
 */
async function fetchData(endpoint: string, params?: Record<string, any>) {
  try {
    const url = new URL(`${NEXT_PUBLIC_API_BASE_URL}/${endpoint}`);
    // Append query parameters if provided
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include" // Uncomment if you need cookies (e.g., authentication)
    });

    if (!response.ok) {
      // Attempt to parse error message from response body if available
      const errorBody = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorJson.detail || JSON.stringify(errorJson);
      } catch {
        // If parsing fails, use the raw text or default error message
        errorMessage = errorBody || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch data from ${endpoint}:`, error.message);
    throw error;
  }
}

export default fetchData;