// app/api/fetchdata.ts

// !! IMPORTANT !!
// This is the BASE_URL for your backend API.
// Ensure it's correctly set. It should include the protocol (http/https) and the domain.
// Example: "https://api.yourdomain.com/" or "http://localhost:8000/"
const BASE_URL = "https://nxadmin.consociate.co.in/";

// Type alias for the custom body content your API expects (JSON object or FormData)
type CustomRequestBody = Record<string, any> | FormData;

/**
 * Defines the options for the fetchData utility.
 * It extends RequestInit but omits 'body' to allow for custom body types (Record<string, any> or FormData).
 * It also adds 'token' for authorization and 'queryParams' for URL parameters.
 */
interface RequestOptions extends Omit<RequestInit, "body"> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: CustomRequestBody; // Custom body for JSON objects or FormData
  headers?: Record<string, string>; // Custom headers
  token?: string; // Optional token for authenticated requests (e.g., JWT)
  queryParams?: Record<string, string | number | boolean | undefined>; // For URL query parameters like pagination
}

/**
 * A generic asynchronous utility function for making API calls.
 * @template T - The expected return type of the API response.
 * @param endpoint - The API endpoint relative to the BASE_URL (e.g., "auth/login/").
 * @param method - The HTTP method (e.g., "GET", "POST"). Defaults to "GET".
 * @param options - Additional request options, including body, headers, token, queryParams, and standard RequestInit properties.
 * @returns A Promise that resolves to the API response of type T.
 * @throws An Error if the fetch operation fails (network error, non-2xx status, or parsing issues).
 */
async function fetchData<T>(
  endpoint: string,
  method: RequestOptions["method"] = "GET",
  options?: Omit<RequestOptions, "method"> // Omit 'method' as it's passed as a separate argument
): Promise<T> {
  // --- BASE_URL Validation ---
  if (
    !BASE_URL ||
    typeof BASE_URL !== "string" ||
    !BASE_URL.startsWith("http")
  ) {
    const errorMsg = `Invalid BASE_URL configured in fetchData.ts. Current value: "${BASE_URL}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log("DEBUG: BASE_URL being used:", BASE_URL);
  console.log("DEBUG: Endpoint being requested:", endpoint);

  // --- URL Construction with Query Parameters ---
  let url = `${BASE_URL}${endpoint}`;
  if (options?.queryParams) {
    const searchParams = new URLSearchParams();
    for (const key in options.queryParams) {
      const value = options.queryParams[key];
      // Only append if the value is not undefined (or null, which String() handles)
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    // Append query string if parameters exist
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  console.log("DEBUG: Full URL constructed:", url);

  // --- Headers Construction ---
  const headers: HeadersInit = {
    ...(options?.headers || {}),
  };
  // Add Authorization token if provided
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  // --- Body Construction ---
  let requestBody: BodyInit | undefined; // Must be compatible with standard BodyInit
  if (options?.body instanceof FormData) {
    requestBody = options.body;
    // For FormData, the 'Content-Type' header (e.g., multipart/form-data)
    // is automatically set by the browser with the correct boundary. Do NOT set it manually here.
  } else if (options?.body) {
    // For plain objects, stringify to JSON and set Content-Type header
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(options.body);
  }

  // --- Destructure and Prepare Fetch Init Options ---
  // Extract custom options (body, headers, token, queryParams) which are handled above,
  // and pass the rest (standard RequestInit properties like 'cache', 'credentials', etc.)
  // to the native fetch API.
  const {
    body: _body,
    headers: _headers,
    token: _token,
    queryParams: _queryParams,
    ...fetchInitOptions
  } = options || {};

  // --- Fetch Request ---
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody, // Use the prepared body
      ...fetchInitOptions, // Spread remaining standard fetch options
    });

    // --- Response Handling ---
    if (!response.ok) {
      let errorData: any = {
        message: `Request failed with status ${response.status}`,
      };
      const contentType = response.headers.get("content-type");

      // Try to parse error response as JSON if possible
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
          // If the errorData object has a 'detail' or 'message' field, prioritize that
          errorData.message =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            `Request failed with status ${response.status}`;
        } catch (jsonError) {
          console.error(
            `Fetch operation for ${url}: Failed to parse JSON error response:`,
            jsonError
          );
          errorData.message = `Failed to parse JSON error response. Raw status: ${response.status} ${response.statusText}`;
        }
      } else {
        // If not JSON (e.g., HTML 404 page), read as text to get raw error message
        try {
          const textResponse = await response.text();
          errorData.message =
            textResponse ||
            `Empty error response for status ${response.status} ${response.statusText}`;
          // Truncate long responses (like full HTML pages) for console readability
          if (errorData.message.length > 500) {
            errorData.message =
              errorData.message.substring(0, 500) + "... (truncated)";
          }
        } catch (textError) {
          console.error(
            `Fetch operation for ${url}: Failed to read error response as text:`,
            textError
          );
          errorData.message = `Failed to read error response. Raw status: ${response.status} ${response.statusText}`;
        }
      }

      // Create and throw a custom error with more details
      const errorMessage = `API Error: ${response.status} ${
        response.statusText
      } - ${errorData.message || "No specific message"}`;
      const customError = new Error(errorMessage);
      (customError as any).status = response.status;
      (customError as any).statusText = response.statusText;
      (customError as any).responseBody = errorData; // Attach original error data
      throw customError;
    }

    // --- Successful Response Parsing ---
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      // Handle cases where a successful response might not be JSON (e.g., 204 No Content)
      // or if the backend sends plain text success messages.
      console.warn(
        `Fetch operation for ${url}: Response was not JSON. Content-Type: ${contentType}. Trying to read as text.`
      );
      const textResponse = await response.text();

      // If the API intentionally returns empty success (e.g., 204 No Content),
      // return a default empty object that matches the expected generic type T.
      if (response.status === 204 || !textResponse) {
        return {} as T;
      }

      // If there's text, and it's not JSON, and it's not a 204, it's still a parsing issue for the client.
      throw new Error(
        `Fetch operation for ${url}: Non-JSON response received. Expected JSON. Raw response: "${textResponse.substring(
          0,
          200
        )}..."`
      );
    }
  } catch (error) {
    // This catches network errors (e.g., DNS resolution failure, server unreachable)
    // or errors re-thrown from the !response.ok block.
    console.error(`Fetch operation failed for ${url}:`, error);

    // Re-throw the original error if it's already an Error object with more details,
    // otherwise, create a new generic error.
    if (error instanceof Error) {
      throw error;
    } else {
      // Fallback for non-Error type throws (unlikely but safe)
      throw new Error(
        `Network or unknown error during API call: ${String(error)}`
      );
    }
  }
}

export default fetchData;
