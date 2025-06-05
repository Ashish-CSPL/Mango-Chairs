// app/Redux/Store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single cart item
interface CartItem {
  id: string | number; // Product ID can be string or number
  name: string;
  image: string;
  price: number;
  quantity: number;
  title?: string; // Optional field for product title
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
      const existingItem = state.cartItems.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.cartItems.push(newItem);
      }
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
    },
    // Action to update the quantity of an item
    updateQuantity: (state, action: PayloadAction<{ id: string | number; change: number }>) => {
      const { id, change } = action.payload;
      const itemToUpdate = state.cartItems.find(item => item.id === id);

      if (itemToUpdate) {
        itemToUpdate.quantity += change;
        if (itemToUpdate.quantity <= 0) {
          state.cartItems = state.cartItems.filter(item => item.id !== id);
        }
      }
    },
    // NEW: Action to clear all items from the cart
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// Export actions and reducer
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions; // Export clearCart
export default cartSlice.reducer;
