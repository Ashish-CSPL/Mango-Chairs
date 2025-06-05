// app/Redux/Slices/addressSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the CustomerAddress interface based on your usage in checkout/page.tsx
// It uses 'address', 'locality', 'zipcode' which are slightly different from a generic 'Address'
// Adjust these if your backend returns 'address_line1', 'address_line2', 'zip_code' instead.
export interface CustomerAddress {
  is_default_billing: boolean;
  id: string | number; // Assuming ID can be string or number from backend
  customer_id?: string | number; // Optional, if linked to user
  full_name: string;
  phone_number: string;
  address: string; // Used for the primary address line (e.g., house number, street)
  locality?: string; // Optional: Used for area, landmark etc.
  city: string;
  state: string;
  zipcode: string; // Note: 'zipcode' is used in your page.tsx, not 'zip_code'
  country: string;
  is_default?: boolean;
  address_type?: 'Home' | 'Work' | 'Other'; // Example: if you categorize addresses
  // Add other fields from your backend address model if any
}

interface AddressState {
  addresses: CustomerAddress[];
  selectedShippingAddress: CustomerAddress | null;
  selectedBillingAddress: CustomerAddress | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedShippingAddress: null,
  selectedBillingAddress: null,
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null; // Clear error on loading
    },
    setAddresses: (state, action: PayloadAction<CustomerAddress[]>) => {
      state.addresses = action.payload;
      state.loading = false;
    },
    setAddressError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedShippingAddress: (
      state,
      action: PayloadAction<CustomerAddress | null>
    ) => {
      state.selectedShippingAddress = action.payload;
    },
    setSelectedBillingAddress: (
      state,
      action: PayloadAction<CustomerAddress | null>
    ) => {
      state.selectedBillingAddress = action.payload;
    },
    addCustomerAddress: (state, action: PayloadAction<CustomerAddress>) => {
      state.addresses.push(action.payload);
    },
    updateCustomerAddress: (state, action: PayloadAction<CustomerAddress>) => {
      const index = state.addresses.findIndex(
        (addr) => addr.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    removeCustomerAddress: (state, action: PayloadAction<string | number>) => {
      state.addresses = state.addresses.filter(
        (addr) => addr.id !== action.payload
      );
    },
    clearAddressState: (state) => {
      // Useful for logout or when addresses are no longer needed
      state.addresses = [];
      state.selectedShippingAddress = null;
      state.selectedBillingAddress = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setAddressLoading,
  setAddresses,
  setAddressError,
  setSelectedShippingAddress,
  setSelectedBillingAddress,
  addCustomerAddress,
  updateCustomerAddress,
  removeCustomerAddress,
  clearAddressState,
} = addressSlice.actions;

export default addressSlice.reducer;