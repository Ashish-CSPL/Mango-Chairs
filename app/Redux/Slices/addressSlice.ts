// app/Redux/Slices/addressSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the CustomerAddress interface, with all fields correctly typed
export interface CustomerAddress {
  id: number;
  customer: number;
  full_name: string;
  phone_number: string;
  address: string; // Changed from address_line1
  locality: string; // Changed from address_line2
  city: string;
  state: string;
  zipcode: string; // Changed from postal_code
  country: string;
  is_default_shipping: boolean; // Keep this in the type, even if not directly set by form
  is_default_billing: boolean; // This is the key field for default billing
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
    },
    setAddresses: (state, action: PayloadAction<CustomerAddress[]>) => {
      state.addresses = action.payload;
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
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action: PayloadAction<CustomerAddress>) => {
      const index = state.addresses.findIndex(
        (address) => address.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },
    removeAddress: (state, action: PayloadAction<number>) => {
      state.addresses = state.addresses.filter(
        (address) => address.id !== action.payload
      );
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
