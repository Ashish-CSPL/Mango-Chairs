import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AddressPayload } from "@/app/API_Calls/customerAddress"; // Import for type reference

// Define the CustomerAddress interface based on your API response and required fields
export interface CustomerAddress {
  id: number;
  customer: number; // Assuming customer ID is part of the address object
  full_name: string;
  phone_number: string;
  address: string; // This corresponds to 'street' from your API example
  locality: string; // Added as a common address component
  city: string;
  state: string;
  zipcode: string; // This corresponds to 'postalCode' from your API example
  country: string;
  address_type: "BILLING" | "SHIPPING" | "BOTH"; // The type of address
  is_active: boolean; // Assuming there's an active status
  created_at: string;
  updated_at: string;
}

interface AddressState {
  addresses: CustomerAddress[];
  loading: boolean;
  error: string | null;
  selectedBillingAddress: CustomerAddress | null;
  selectedShippingAddress: CustomerAddress | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  error: null,
  selectedBillingAddress: null,
  selectedShippingAddress: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null; // Clear any previous errors when loading starts
    },
    setAddresses: (state, action: PayloadAction<CustomerAddress[]>) => {
      state.addresses = action.payload;
      state.loading = false;
      state.error = null;

      // Logic to automatically select default billing and shipping addresses
      if (state.addresses.length > 0) {
        // Try to find an address explicitly marked as BILLING or BOTH for billing
        const billingAddress =
          state.addresses.find(
            (addr) =>
              addr.address_type === "BILLING" || addr.address_type === "BOTH"
          ) || null;

        // Try to find an address explicitly marked as SHIPPING or BOTH for shipping
        const shippingAddress =
          state.addresses.find(
            (addr) =>
              addr.address_type === "SHIPPING" || addr.address_type === "BOTH"
          ) || null;

        state.selectedBillingAddress = billingAddress;
        state.selectedShippingAddress = shippingAddress;

        // Fallback: If no specific billing address is found, select the first available address
        if (!state.selectedBillingAddress) {
          state.selectedBillingAddress = state.addresses[0];
        }
        // Fallback: If no specific shipping address is found, select the first available address
        if (!state.selectedShippingAddress) {
          state.selectedShippingAddress = state.addresses[0];
        }
      } else {
        // If no addresses, ensure selections are null
        state.selectedBillingAddress = null;
        state.selectedShippingAddress = null;
      }
    },
    setAddressError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedBillingAddress: (
      state,
      action: PayloadAction<CustomerAddress | null>
    ) => {
      state.selectedBillingAddress = action.payload;
    },
    setSelectedShippingAddress: (
      state,
      action: PayloadAction<CustomerAddress | null>
    ) => {
      state.selectedShippingAddress = action.payload;
    },
    addAddress: (state, action: PayloadAction<CustomerAddress>) => {
      state.addresses.push(action.payload);
      // If no billing or shipping address was selected, set the newly added address as default
      if (!state.selectedBillingAddress) {
        state.selectedBillingAddress = action.payload;
      }
      if (!state.selectedShippingAddress) {
        state.selectedShippingAddress = action.payload;
      }
    },
    updateAddress: (state, action: PayloadAction<CustomerAddress>) => {
      const index = state.addresses.findIndex(
        (addr) => addr.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
      // If the updated address was selected, ensure the selected object is also updated
      if (
        state.selectedBillingAddress &&
        state.selectedBillingAddress.id === action.payload.id
      ) {
        state.selectedBillingAddress = action.payload;
      }
      if (
        state.selectedShippingAddress &&
        state.selectedShippingAddress.id === action.payload.id
      ) {
        state.selectedShippingAddress = action.payload;
      }
    },
    deleteAddress: (state, action: PayloadAction<number>) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );
      // If the deleted address was selected, clear the selection and try to re-select
      if (
        state.selectedBillingAddress &&
        state.selectedBillingAddress.id === action.payload
      ) {
        state.selectedBillingAddress = null;
      }
      if (
        state.selectedShippingAddress &&
        state.selectedShippingAddress.id === action.payload
      ) {
        state.selectedShippingAddress = null;
      }

      // Re-evaluate selections if the deleted address was the current selection
      if (state.addresses.length > 0) {
        if (!state.selectedBillingAddress) {
          state.selectedBillingAddress =
            state.addresses.find(
              (addr) =>
                addr.address_type === "BILLING" || addr.address_type === "BOTH"
            ) || state.addresses[0]; // Fallback to first if no specific billing
        }
        if (!state.selectedShippingAddress) {
          state.selectedShippingAddress =
            state.addresses.find(
              (addr) =>
                addr.address_type === "SHIPPING" || addr.address_type === "BOTH"
            ) || state.addresses[0]; // Fallback to first if no specific shipping
        }
      }
    },
  },
});

export const {
  setAddressLoading,
  setAddresses,
  setAddressError,
  setSelectedBillingAddress,
  setSelectedShippingAddress,
  addAddress,
  updateAddress,
  deleteAddress,
} = addressSlice.actions;

export default addressSlice.reducer;