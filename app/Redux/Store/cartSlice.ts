"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  name: string;
  title?: string;
  image: string;
  price: number; // Sale price
  quantity: number;
  isRare?: boolean;
  regularPrice?: number; // Original price
  isOnSale?: boolean;
}

interface CartState {
  items: any;
  cartItems: CartItem[];
  cartCount: number;
}

const initialState: CartState = {
  cartItems: [],
  cartCount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<any>) {
      const item = action.payload;

      // Safe parsing of prices
      const rawSellingPrice = item.selling_price || item.parentProduct?.selling_price;
      const parsedSellingPrice = typeof rawSellingPrice === "string" ? parseFloat(rawSellingPrice) : rawSellingPrice;
      const finalSellingPrice = !isNaN(parsedSellingPrice) ? parsedSellingPrice : 0;

      const rawOriginalPrice = item.original_price || item.parentProduct?.original_price;
      const parsedOriginalPrice = typeof rawOriginalPrice === "string" ? parseFloat(rawOriginalPrice) : rawOriginalPrice;
      const finalOriginalPrice = !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : finalSellingPrice;

      const isOnSale = finalSellingPrice < finalOriginalPrice;

      // Build full image URL
      const rawImage = item.images?.[0] || item.parentProduct?.images?.[0] || "/default-image.jpg";
      const fullImage = rawImage.startsWith("http")
        ? rawImage
        : `https://nxadmin.consociate.co.in${rawImage}`;

      const cartItem: CartItem = {
        id: item.id,
        name: String(item.name || item.parentProduct?.name || "Unnamed Product"),
        title: String(item.title || item.parentProduct?.title || ""),
        image: fullImage,
        price: finalSellingPrice,
        quantity: 1,
        isRare: item.isRare || false,
        regularPrice: finalOriginalPrice,
        isOnSale,
      };

      const existingItem = state.cartItems.find(
        (cartItemInState) => cartItemInState.id === cartItem.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cartItems.push(cartItem);
      }

      // Update cart count
      state.cartCount = state.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },

    removeFromCart(state, action: PayloadAction<number>) {
      const idToRemove = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== idToRemove);
      state.cartCount = state.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },

    updateQuantity(state, action: PayloadAction<{ id: number; change: number }>) {
      const { id, change } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += change;
        if (existingItem.quantity <= 0) {
          state.cartItems = state.cartItems.filter((item) => item.id !== id);
        }
      }

      state.cartCount = state.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;

export const selectCartCount = (state: { cart: CartState }) => state.cart.cartCount;

export default cartSlice.reducer;
