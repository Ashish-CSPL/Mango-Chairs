interface FetchOptions extends RequestInit {
  params?: Record<string, any>; // Used for GET request query parameters
  body?: any; // Allow any type for body, as it will be JSON.stringified
}

export default async function fetchData<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options?: FetchOptions
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error("fetchData Error: NEXT_PUBLIC_API_BASE_URL is not defined.");
    // Throw an error early if the base URL isn't configured, as this is a critical dependency.
    throw new Error(
      "API base URL is not configured. Please check your .env.local file."
    );
  }

  let url = `${baseUrl}/${endpoint}`;

  if (options?.params && method === "GET") {
    const queryParams = new URLSearchParams(options.params).toString();
    url += `?${queryParams}`;
  }

  // --- Debugging Logs ---
  // These logs are helpful for development but consider removing or
  // making them conditional (e.g., based on NODE_ENV) for production.
  console.log("fetchData: Request URL:", url);
  console.log("fetchData: Request Method:", method);
  console.log("fetchData: Request Options (excluding stringified body):", {
    headers: options?.headers,
    cache: options?.cache,
  });
  if (method !== "GET" && options?.body) {
    console.log("fetchData: Request Body (before stringify):", options.body);
  }
  // --- End Debugging Logs ---

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed here
        ...options?.headers,
      },
      body:
        method !== "GET" && options?.body
          ? JSON.stringify(options.body)
          : undefined,
      cache: options?.cache || "no-store", // Default to no-store if not specified
    });

    console.log("fetchData: Response Status:", response.status);

    if (!response.ok) {
      const errorDetail = await response
        .json()
        .catch(() => ({ detail: "Unknown error or non-JSON response" }));
      console.error("fetchData: API Error Response:", errorDetail);
      throw new Error(
        errorDetail.detail || `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data: T = await response.json();
    console.log("fetchData: API Response Data (Success):", data);
    return data;
  } catch (error: any) {
    // Catch fetch-specific errors (network issues, JSON parsing errors)
    console.error(
      "fetchData: Fetching failed due to network or parsing error:",
      error
    );
    throw new Error(
      `Network or parsing error: ${error.message || "An unknown error occurred."}`
    );
  }
}