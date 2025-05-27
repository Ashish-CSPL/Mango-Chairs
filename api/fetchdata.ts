const NEXT_PUBLIC_API_BASE_URL = "https://nxadmin.consociate.co.in";

async function fetchData(endpoint: string, p0: string) {
  try {
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include" // Uncomment if you need cookies (e.g., authentication)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Failed to fetch data from ${endpoint}:`, error.message);
    throw error;
  }
}

export default fetchData;
