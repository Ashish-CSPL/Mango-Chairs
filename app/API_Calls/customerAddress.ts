import fetchSecondary from "@/api/fetchSecondary";

// Define the structure of data sent to the backend for creating/updating an address
export interface AddressPayload {
  full_name: string;
  phone_number: string;
  address: string; // Corresponds to 'street' in your example response
  locality: string; // Common address field, add if your backend expects it
  city: string;
  state: string;
  zipcode: string; // Corresponds to 'postalCode' in your example response
  country: string;
  address_type: "BILLING" | "SHIPPING" | "BOTH"; // Type of address
}

// Define the structure of an address object received from the backend
export interface CustomerAddress extends AddressPayload {
  id: number; // Unique ID for the address
  customer: number; // The ID of the customer this address belongs to
  is_active: boolean; // Assuming an active status for addresses
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new customer address.
 * @param customerId - The ID of the customer.
 * @param addressData - The data for the new address.
 * @param token - The authentication token.
 * @returns A Promise that resolves to the created CustomerAddress.
 */
export const createCustomerAddress = async (
  customerId: number,
  addressData: AddressPayload,
  token: string
): Promise<CustomerAddress> => {
  try {
    const response = await fetchSecondary<CustomerAddress>(
      `user/address/create`,
      "POST",
      {
        body: {
          ...addressData,
          customer: customerId, // Ensure customer ID is explicitly sent if required by backend
        },
        token: token,
      }
    );
    return response;
  } catch (error) {
    console.error("API Call Error: Failed to create address.", error);
    throw error;
  }
};

/**
 * Fetches all addresses for a given customer.
 * @param customerId - The ID of the customer whose addresses are to be fetched.
 * @param token - The authentication token.
 * @returns A Promise that resolves to an array of CustomerAddress.
 */
export const getCustomerAddresses = async (
  customerId: number,
  token: string
): Promise<CustomerAddress[]> => {
  try {
    // Assuming 'user/address/get' endpoint can return multiple addresses for a customer
    // and expects customer_id as a query parameter. Adjust if your API differs.
    const response = await fetchSecondary<CustomerAddress[]>(
      `user/address/get`,
      "GET",
      {
        token: token,
        queryParams: { customer_id: customerId },
      }
    );
    // Backend response for "get address" is shown as a single object.
    // If 'user/address/get' always returns a single object even when trying to get all,
    // this logic ensures it's always an array for the Redux state.
    if (!Array.isArray(response)) {
      console.warn(
        "getCustomerAddresses received a non-array response. Coercing to array."
      );
      return response ? [response] : [];
    }
    return response;
  } catch (error) {
    console.error("API Call Error: Failed to fetch addresses.", error);
    throw error;
  }
};

/**
 * Updates an existing customer address.
 * @param addressId - The ID of the address to update.
 * @param addressData - The partial data to update the address.
 * @param token - The authentication token.
 * @returns A Promise that resolves to the updated CustomerAddress.
 */
export const updateCustomerAddress = async (
  addressId: number,
  addressData: Partial<AddressPayload>, // Use Partial because not all fields might be updated
  token: string
): Promise<CustomerAddress> => {
  try {
    // IMPORTANT: Confirm this endpoint with your backend. Common patterns include /user/address/{id} or /user/address/update/{id}
    const response = await fetchSecondary<CustomerAddress>(
      `user/address/${addressId}/update`, // Example endpoint
      "PUT", // Use PUT for full replacement or PATCH for partial updates based on API
      {
        body: addressData,
        token: token,
      }
    );
    return response;
  } catch (error) {
    console.error(`API Call Error: Failed to update address with ID ${addressId}.`, error);
    throw error;
  }
};

/**
 * Deletes a customer address.
 * @param addressId - The ID of the address to delete.
 * @param token - The authentication token.
 * @returns A Promise that resolves to a success message.
 */
export const deleteCustomerAddress = async (
  addressId: number,
  token: string
): Promise<{ message: string }> => {
  try {
    // IMPORTANT: Confirm this endpoint with your backend. Common patterns include /user/address/{id} or /user/address/delete/{id}
    const response = await fetchSecondary<{ message: string }>(
      `user/address/${addressId}/delete`, // Example endpoint
      "DELETE",
      {
        token: token,
      }
    );
    return response;
  } catch (error) {
    console.error(`API Call Error: Failed to delete address with ID ${addressId}.`, error);
    throw error;
  }
};