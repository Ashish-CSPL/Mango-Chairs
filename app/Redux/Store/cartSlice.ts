// app/Redux/Store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single cart item
export interface CartItem { // <--- Ensure 'export' is here
  id: string | number; // Product ID can be string or number
  name: string;
  image: string;
  price: number;
  quantity: number;
  // Additional optional fields derived from Product/Variant, necessary for rich cart data
  slug?: string;
  selectedVariantId?: number;
  color?: string;
  size?: string; // Ensure this matches Product/Variant types if needed
  stock?: number;
  title?: string; // Optional field for product title, potentially redundant with 'name'
  isRare?: boolean;
  regularPrice?: number;
  isOnSale?: boolean;
}

// Define the shape of the cart state
interface CartState {
  cartItems: CartItem[];
}

// Initial state for the cart
const initialState: CartState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action to add an item to the cart or update its quantity
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      // When adding to cart, often you distinguish by product ID AND variant ID
      // If a selectedVariantId is present, we consider it a distinct item
      const existingItem = state.cartItems.find(
        item => item.id === newItem.id && item.selectedVariantId === newItem.selectedVariantId
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.cartItems.push(newItem);
      }
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action: PayloadAction<{ id: string | number; selectedVariantId?: number }>) => {
        const { id, selectedVariantId } = action.payload;
        state.cartItems = state.cartItems.filter(item =>
            item.id !== id || (selectedVariantId !== undefined && item.selectedVariantId !== selectedVariantId)
        );
    },
    // Action to update the quantity of an item
    updateQuantity: (state, action: PayloadAction<{ id: string | number; selectedVariantId?: number; change: number }>) => {
      const { id, selectedVariantId, change } = action.payload;
      const itemToUpdate = state.cartItems.find(
        item => item.id === id && item.selectedVariantId === selectedVariantId
      );

      if (itemToUpdate) {
        itemToUpdate.quantity += change;
        if (itemToUpdate.quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            item => item.id !== id || (selectedVariantId !== undefined && item.selectedVariantId !== selectedVariantId)
          );
        }
      }
    },
    // Action to clear all items from the cart
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// Export actions and reducer
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;