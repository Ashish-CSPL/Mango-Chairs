// app/API_Calls/customerAddress.ts (UPDATED)

import fetchData from "@/api/fetchdata";
import { CustomerAddress } from "@/app/Redux/Slices/addressSlice"; // This will also be updated below

// Type for creating/updating an address payload sent to the backend
// UPDATED FIELD NAMES: address, locality, is_selected
export interface AddressPayload {
  full_name: string;
  phone_number: string;
  address: string; // Changed from address_line1
  locality?: string; // Changed from address_line2
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_selected?: boolean; // Changed from is_default
}

// Function to get all customer addresses for a specific customer
export async function getCustomerAddresses(customerId: number, token: string): Promise<CustomerAddress[]> {
  try {
    const response = await fetchData<any>( // Use 'any' to start, then cast
      "user/customer-address/",
      "GET",
      {
        token,
        queryParams: { customer: customerId }
      }
    );

    // CRITICAL UPDATE HERE: Handle the "addresses" key
    if (response && typeof response === 'object' && 'addresses' in response && Array.isArray(response.addresses)) {
      console.log("Found 'addresses' key in response. Extracting addresses.");
      return response.addresses; // Extract the array from the "addresses" key
    } else if (Array.isArray(response)) {
      return response; // Direct array response (less likely now, but kept for robustness)
    } else if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.warn("Backend response for getCustomerAddresses contained a 'results' array. Extracting it.");
        return response.results; // Handle pagination "results" key
    } else {
      console.error("API response for getCustomerAddresses was not a recognized array format (direct, 'results', or 'addresses'):", response);
      return []; // Return empty array if unexpected format
    }
  } catch (error) {
    console.error("Error fetching customer addresses:", error);
    throw error;
  }
}

// Function to create a new customer address
export async function createCustomerAddress(addressData: AddressPayload, customerId: number, token: string): Promise<CustomerAddress> {
  try {
    const backendPayload = {
      customer: customerId,
      address: addressData.address, // Changed from address_line1
      locality: addressData.locality || "", // Changed from address_line2
      full_name: addressData.full_name,
      phone_number: addressData.phone_number,
      city: addressData.city,
      state: addressData.state,
      zipcode: addressData.zipcode,
      country: addressData.country,
      is_selected: addressData.is_selected, // Changed from is_default
    };

    const response = await fetchData<CustomerAddress>(
      "user/customer-address/",
      "POST",
      {
        token,
        body: backendPayload,
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating customer address:", error);
    throw error;
  }
}

// Function to update an existing customer address (using PATCH)
export async function updateCustomerAddress(id: number, addressData: AddressPayload, customerId: number, token: string): Promise<CustomerAddress> {
  try {
    const backendPayload = {
      address: addressData.address, // Changed from address_line1
      locality: addressData.locality || "", // Changed from address_line2
      full_name: addressData.full_name,
      phone_number: addressData.phone_number,
      city: addressData.city,
      state: addressData.state,
      zipcode: addressData.zipcode,
      country: addressData.country,
      is_selected: addressData.is_selected, // Changed from is_default
    };

    const response = await fetchData<CustomerAddress>(
      `user/customer-address/${id}/`,
      "PATCH",
      {
        token,
        body: backendPayload,
        queryParams: { customer: customerId }
      }
    );
    return response;
  } catch (error) {
    console.error(`Error updating customer address with ID ${id}:`, error);
    throw error;
  }
}

// Function to delete a customer address
export async function deleteCustomerAddress(id: number, customerId: number, token: string): Promise<{ message: string }> {
  try {
    const response = await fetchData<{ message?: string }>(
      `user/customer-address/${id}/`,
      "DELETE",
      {
        token,
        queryParams: { customer: customerId }
      }
    );
    return { message: response?.message || "Address deleted successfully." };
  } catch (error) {
    console.error(`Error deleting customer address with ID ${id}:`, error);
    throw error;
  }
}