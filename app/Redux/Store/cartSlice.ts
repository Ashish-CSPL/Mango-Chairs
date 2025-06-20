import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single cart item
export interface CartItem {
  id: string | number; // Product ID can be string or number
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant: string;
  slug?: string;
  selectedVariantId?: string | number;
  color?: string;
  size?: string | number | (string | number)[];
  stock?: number;
  title?: string;
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
    // Add item to cart or update quantity if it exists
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(item => item.id === newItem.id);

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.cartItems.push(newItem);
      }
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
    },

    // Update quantity (+ or -)
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

    // ✅ Clear all cart items
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// Export actions and reducer
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
