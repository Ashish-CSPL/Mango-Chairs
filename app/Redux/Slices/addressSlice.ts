// app/Redux/Slices/addressSlice.ts (UPDATED)

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of a Customer Address as received from the backend
// Ensure these types match your backend's API response structure exactly.
// UPDATED FIELD NAMES: address, locality, is_selected, and added type, created_by, updated_by
export interface CustomerAddress {
  id: number;
  customer: number; // Foreign key to customer/user
  type: string; // Added from your JSON
  full_name?: string; // Made optional if not always present in GET response, but it is in POST
  phone_number?: string; // Made optional if not always present in GET response
  address: string; // Changed from address_line1
  locality?: string; // Changed from address_line2, made optional as it can be null
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_selected: boolean; // Changed from is_default
  created_by?: string; // Added from your JSON, made optional
  created_at: string; // ISO 8601 string date
  updated_by?: string; // Added from your JSON, made optional
  updated_at: string; // ISO 8601 string date
}

// Define the shape of the address-related state
interface AddressState {
  addresses: CustomerAddress[];
  selectedBillingAddress: CustomerAddress | null;
  selectedShippingAddress: CustomerAddress | null;
  loading: boolean;
  error: string | null;
}

// Initial state for the address slice
const initialState: AddressState = {
  addresses: [],
  selectedBillingAddress: null,
  selectedShippingAddress: null,
  loading: false,
  error: null,
};

// Create the address slice
const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddressLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setAddresses: (state, action: PayloadAction<CustomerAddress[]>) => {
      state.addresses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setAddressError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedBillingAddress: (state, action: PayloadAction<CustomerAddress | null>) => {
      state.selectedBillingAddress = action.payload;
    },
    setSelectedShippingAddress: (state, action: PayloadAction<CustomerAddress | null>) => {
      state.selectedShippingAddress = action.payload;
    },
    addAddress: (state, action: PayloadAction<CustomerAddress>) => {
      // If the new address is marked as selected, ensure previous selected are unset
      if (action.payload.is_selected) { // Changed from is_default
        state.addresses = state.addresses.map(addr =>
          addr.is_selected ? { ...addr, is_selected: false } : addr // Changed from is_default
        );
      }
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<CustomerAddress>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index !== -1) {
        // If the updated address is set as selected, unset previous selected
        if (action.payload.is_selected) { // Changed from is_default
          state.addresses = state.addresses.map(addr =>
            addr.is_selected ? { ...addr, is_selected: false } : addr // Changed from is_default
          );
        }
        state.addresses[index] = action.payload;
      }
      if (state.selectedBillingAddress?.id === action.payload.id) {
        state.selectedBillingAddress = action.payload;
      }
      if (state.selectedShippingAddress?.id === action.payload.id) {
        state.selectedShippingAddress = action.payload;
      }
    },
    deleteAddress: (state, action: PayloadAction<number>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
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
  deleteAddress,
} = addressSlice.actions;

export default addressSlice.reducer;