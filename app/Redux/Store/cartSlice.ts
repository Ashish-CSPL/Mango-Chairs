import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Removed `ReactNode` import as it's not used in this file for `CartItem`
// import { ReactNode } from "react";

// Ensure this CartItem interface matches what you dispatch from ProductCard.tsx
export interface CartItem {
  title: any;
  isRare: any;
  regularPrice: any;
  isOnSale: boolean;
  id: string | number; // This needs to be string | number to match your product/variant IDs
  name: string;
  image: string;
  price: number; // Keep price as number for calculations
  quantity: number;
  slug?: string; // Optional: for linking back to product page
  selectedVariantId?: string | number; // Optional: to track which variant was added
  color?: string; // Optional: variant specific detail
  size?: string; // Optional: variant specific detail
  stock?: number; // Optional: stock of the item at the time of adding
  // If you need these, ensure they are passed from ProductCard and are part of the API Product/Variant types
  // isRare?: boolean;
  // title?: string; // If 'title' is distinct from 'name'
}

interface CartState {
  cartItems: CartItem[];
}

const initialState: CartState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      // Find an existing item that matches by ID AND (if applicable) selected variant ID
      const existingItem = state.cartItems.find(
        (item) =>
          item.id === newItem.id &&
          item.selectedVariantId === newItem.selectedVariantId
      );

      if (existingItem) {
        // If it exists, increment quantity (default to 1 if newItem.quantity is not provided)
        existingItem.quantity += newItem.quantity || 1;
      } else {
        // If it's a new item, add it with the specified quantity or default to 1
        state.cartItems.push({ ...newItem, quantity: newItem.quantity || 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string | number; change: number }>
    ) => {
      const { id, change } = action.payload;
      const itemToUpdate = state.cartItems.find((item) => item.id === id);

      if (itemToUpdate) {
        itemToUpdate.quantity += change;
        if (itemToUpdate.quantity <= 0) {
          state.cartItems = state.cartItems.filter((item) => item.id !== id);
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;

export default cartSlice.reducer;