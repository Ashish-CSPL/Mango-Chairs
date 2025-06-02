// app/api/fetchdata.ts

const BASE_URL = "https://nxadmin.consociate.co.in/"; 

type CustomRequestBody = Record<string, any> | FormData;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"; // <-- Added "HEAD" here
  body?: CustomRequestBody;
  headers?: Record<string, string>;
  token?: string;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

async function fetchData<T>(
  endpoint: string,
  method: RequestOptions["method"] = "GET",
  options?: Omit<RequestOptions, "method">
): Promise<T> {
  console.log("DEBUG: fetchData - received endpoint:", endpoint, "Type:", typeof endpoint);
  console.log("DEBUG: fetchData - received method:", method);

  if (!BASE_URL || typeof BASE_URL !== 'string' || !BASE_URL.startsWith('http')) {
    const errorMsg = `Invalid BASE_URL configured in fetchData.ts. Current value: "${BASE_URL}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log("DEBUG: BASE_URL being used:", BASE_URL);
  console.log("DEBUG: Endpoint being requested:", endpoint);

  let url = `${BASE_URL}${endpoint}`;
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
  console.log("DEBUG: fetchData - Full URL constructed and about to be fetched:", url);

  const headers: HeadersInit = {
    ...(options?.headers || {}),
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  let requestBody: BodyInit | undefined;
  // This condition is now valid because 'method' can explicitly be "HEAD"
  if (method !== "GET" && method !== "HEAD") { 
    if (options?.body instanceof FormData) {
      requestBody = options.body;
    } else if (options?.body) {
      if (!(headers as Record<string, string>)["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      requestBody = JSON.stringify(options.body);
    }
  }

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

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
          errorData.message = errorData.detail || errorData.message || errorData.error || `Request failed with status ${response.status}`;
        } catch (jsonError) {
          console.error(`Fetch operation for ${url}: Failed to parse JSON error response:`, jsonError);
          errorData.message = `Failed to parse JSON error response. Raw status: ${response.status} ${response.statusText}`;
        }
      } else {
        try {
          const textResponse = await response.text();
          errorData.message = textResponse || `Empty error response for status ${response.status} ${response.statusText}`;
          if (errorData.message.length > 500) {
            errorData.message = errorData.message.substring(0, 500) + "... (truncated)";
          }
        } catch (textError) {
          console.error(`Fetch operation for ${url}: Failed to read error response as text:`, textError);
          errorData.message = `Failed to read error response. Raw status: ${response.status} ${response.statusText}`;
        }
      }

      const errorMessage = `API Error: ${response.status} ${response.statusText} - ${errorData.message || 'No specific message'}`;
      const customError = new Error(errorMessage);
      (customError as any).status = response.status;
      (customError as any).statusText = response.statusText;
      (customError as any).responseBody = errorData;
      throw customError;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      console.warn(`Fetch operation for ${url}: Response was not JSON. Content-Type: ${contentType}. Trying to read as text.`);
      const textResponse = await response.text();

      if (response.status === 204 || !textResponse) {
        return {} as T; 
      }

      throw new Error(`Fetch operation for ${url}: Non-JSON response received. Expected JSON. Raw response: "${textResponse.substring(0, 200)}..."`);
    }
  } catch (error) {
    console.error(`Fetch operation failed for ${url}:`, error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Network or unknown error during API call: ${String(error)}`);
    }
  }
}

export default fetchData;