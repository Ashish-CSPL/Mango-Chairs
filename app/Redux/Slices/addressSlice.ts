// app/Redux/Slices/addressSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the CustomerAddress interface with all required fields as strict strings
export interface CustomerAddress {
  id: number; // Assuming an ID for existing addresses
  customer: number; // Customer ID associated with this address
  full_name: string; // Changed to strict string
  phone_number: string; // Changed to strict string
  address_line1: string; // Changed to strict string
  address_line2: string; // Changed to strict string
  city: string; // Changed to strict string
  state: string; // Changed to strict string
  postal_code: string; // Changed to strict string
  country: string; // Changed to strict string
  is_default_shipping: boolean; // Assuming these flags exist
  is_default_billing: boolean; // Assuming these flags exist
}

// Define the state structure for the address slice
interface AddressState {
  addresses: CustomerAddress[];
  loading: boolean;
  error: string | null;
  selectedBillingAddress: CustomerAddress | null;
  selectedShippingAddress: CustomerAddress | null;
}

// Initial state for the address slice
const initialState: AddressState = {
  addresses: [], // Ensure this is initialized as an empty array
  loading: false,
  error: null,
  selectedBillingAddress: null,
  selectedShippingAddress: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // Action to set loading state
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Action to set fetched addresses
    setAddresses: (state, action: PayloadAction<CustomerAddress[]>) => {
      state.addresses = action.payload;
      state.error = null; // Clear any previous errors on successful fetch
    },
    // Action to set an error message
    setAddressError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false; // Stop loading on error
    },
    // Action to set the selected billing address
    setSelectedBillingAddress: (state, action: PayloadAction<CustomerAddress | null>) => {
      state.selectedBillingAddress = action.payload;
    },
    // Action to set the selected shipping address
    setSelectedShippingAddress: (state, action: PayloadAction<CustomerAddress | null>) => {
      state.selectedShippingAddress = action.payload;
    },
    // Action to add a new address (optimistic update or after successful API call)
    addAddress: (state, action: PayloadAction<CustomerAddress>) => {
      state.addresses.push(action.payload);
    },
    // Action to update an existing address
    updateAddress: (state, action: PayloadAction<CustomerAddress>) => {
      const index = state.addresses.findIndex(
        (address) => address.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    // Action to remove an address
    removeAddress: (state, action: PayloadAction<number>) => {
      state.addresses = state.addresses.filter(
        (address) => address.id !== action.payload
      );
      // If the removed address was selected, clear the selection
      if (state.selectedBillingAddress?.id === action.payload) {
        state.selectedBillingAddress = null;
      }
      if (state.selectedShippingAddress?.id === action.payload) {
        state.selectedShippingAddress = null;
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
  removeAddress,
} = addressSlice.actions;

export default addressSlice.reducer;
