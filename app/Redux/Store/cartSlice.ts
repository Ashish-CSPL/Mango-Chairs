// app/Redux/Store/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for a single cart item
export interface CartItem {
  id: string | number; // Product ID can be string or number
  name: string;
  image: string;
  price: number;
  quantity: number;
  title?: string; // Optional field for product title
  slug: string;
  selectedVariantId?: number; // Added previously
  color?: string; // Added previously
  size?: string | number | (string | number)[]; // Added previously
  stock: number; // Added previously
  isRare?: boolean; // Added previously
  regularPrice?: number; // Added previously
  isOnSale?: boolean; // <--- ADD THIS LINE
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
      // 'isOnSale' is a characteristic of the product/price, not typically used for identifying a unique cart item instance.
      // So, the 'find' logic usually doesn't need to include 'isOnSale'.
      const existingItem = state.cartItems.find(item =>
        item.id === newItem.id &&
        item.selectedVariantId === newItem.selectedVariantId &&
        item.color === newItem.color &&
        item.size === newItem.size
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.cartItems.push(newItem);
      }
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action: PayloadAction<{ id: string | number; selectedVariantId?: number; color?: string; size?: string | number | (string | number)[]; }>) => {
      // 'isOnSale' is generally not used for removal logic.
      const { id, selectedVariantId, color, size } = action.payload;
      state.cartItems = state.cartItems.filter(item =>
        item.id !== id ||
        (item.selectedVariantId !== undefined && item.selectedVariantId !== selectedVariantId) ||
        (item.color !== undefined && item.color !== color) ||
        (item.size !== undefined && item.size !== size)
      );
    },
    // Action to update the quantity of an item
    updateQuantity: (state, action: PayloadAction<{ id: string | number; change: number; selectedVariantId?: number; color?: string; size?: string | number | (string | number)[]; }>) => {
      // 'isOnSale' is generally not used for update logic.
      const { id, change, selectedVariantId, color, size } = action.payload;
      const itemToUpdate = state.cartItems.find(item =>
        item.id === id &&
        item.selectedVariantId === selectedVariantId &&
        item.color === color &&
        item.size === size
      );

      if (itemToUpdate) {
        itemToUpdate.quantity += change;
        if (itemToUpdate.quantity <= 0) {
          state.cartItems = state.cartItems.filter(item =>
            item.id !== id ||
            (item.selectedVariantId !== undefined && item.selectedVariantId !== selectedVariantId) ||
            (item.color !== undefined && item.color !== color) ||
            (item.size !== undefined && item.size !== size)
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