const BASE_API = process.env.NEXT_PUBLIC_SECONDARY_API;

type CustomRequestBody = Record<string, any> | FormData;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
  body?: CustomRequestBody;
  headers?: Record<string, string>;
  token?: string;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

async function fetchSecondary<T>(
  endpoint: string,
  method: RequestOptions["method"] = "GET",
  options?: Omit<RequestOptions, "method">
): Promise<T> {
  if (!BASE_API || typeof BASE_API !== 'string' || !BASE_API.startsWith('http')) {
    const errorMsg = `Invalid NEXT_PUBLIC_SECONDARY_API configured in fetchSecondary.ts. Current value: "${BASE_API}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let url = `${BASE_API}${endpoint}`;
  if (options?.queryParams) {
    const searchParams = new URLSearchParams();
    for (const key in options.queryParams) {
      const value = options.queryParams[key];
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }

  const headers: HeadersInit = {
    ...(options?.headers || {}),
  };

  if (options?.token) {
    headers["Authorization"] = `Token ${options.token}`;
  }

  let requestBody: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    if (options?.body instanceof FormData) {
      // If FormData is passed, Content-Type header should not be explicitly set.
      // Fetch will automatically set it to 'multipart/form-data' with the correct boundary.
      requestBody = options.body;
    } else if (options?.body) {
      // For JSON bodies, ensure Content-Type is application/json
      if (!(headers as Record<string, string>)["Content-Type"]) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(options.body);
    }
  }

  // Destructure out the custom options before passing to fetch
  const {
    body: _body,
    headers: _headers,
    token: _token,
    queryParams: _queryParams,
    ...fetchInitOptions
  } = options || {};

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      ...fetchInitOptions,
    });

    if (!response.ok) {
      let errorData: any = { message: `Request failed with status ${response.status}` };
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
          // Prioritize specific error messages from backend, then generic ones
          errorData.message =
            errorData.detail || errorData.message || errorData.error || `Request failed with status ${response.status}`;
        } catch (jsonError) {
          errorData.message = `Failed to parse JSON error response (${response.status}): ${response.statusText}`;
        }
      } else {
        try {
          const textResponse = await response.text();
          errorData.message = textResponse || `Empty error response (${response.status}): ${response.statusText}`;
        } catch {
          errorData.message = `Failed to read error response (${response.status}): ${response.statusText}`;
        }
      }

      const error = new Error(`API Error: ${response.statusText || 'Unknown Error'} - ${errorData.message}`);
      (error as any).status = response.status;
      (error as any).responseBody = errorData; // Attach full error response for debugging
      throw error;
    }

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      if (response.status === 204) return {} as T; // No Content response
      return await response.json();
    } else {
      const textResponse = await response.text();
      if (response.status === 204 || !textResponse) return {} as T; // No Content or empty text response

      // If expecting JSON but received non-JSON, throw an error
      throw new Error(`Non-JSON response received from ${url}: "${textResponse.slice(0, 200)}..."`);
    }
  } catch (error) {
    console.error(`Secondary API fetch failed for endpoint: ${endpoint}`, error);
    // Re-throw the original error if it's an instance of Error, otherwise wrap it
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export default fetchSecondary;