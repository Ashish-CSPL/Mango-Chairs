// app/Redux/Slices/wishlistSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { RootState } from '../Store/store'; // Import RootState to access the entire store

// Define your API base URL. Ensure this environment variable is set in your .env.local file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// -----------------------------------------------------------
// 1. Define the WishlistItem Interface
export interface WishlistItem {
  id: string; // Unique ID of the wishlist entry (e.g., from backend after adding)
  customer_id: string;
  product_id: string; // ID of the product
  product_name: string;
  product_image: string; // URL or path to the product image
  product_price: number; // The current selling price of the product
  slug: string; // Product slug
  stock: number; // Product stock
  base_price: number; // Base price of the product
  selling_price: number; // Selling price of the product
  quantity: number; // For wishlist, usually 1, but if backend uses same for cart, it might vary
}

// State interface for the wishlist slice
interface WishlistState {
  wishlistItems: WishlistItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  wishlistItems: [],
  status: 'idle',
  error: null,
};

// Helper function to handle fetch response and errors
async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: any;
    let rawResponseText: string | null = null; // To capture raw text for debugging

    try {
      rawResponseText = await response.text(); // Get raw text first
      errorData = JSON.parse(rawResponseText); // Then attempt to parse as JSON
    } catch (e: any) {
      // If JSON parsing fails, use the raw text or statusText as the message
      errorData = { message: rawResponseText || response.statusText || `Error ${response.status}` };
      console.error("JSON parsing failed for error response:", e); // Log the parsing error itself
    }

    console.error("Fetch Error Details (refined):", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      rawResponseText: rawResponseText, // Log the raw response text
      parsedResponseBody: errorData,    // Log the parsed (or fallback) body
    });

    // Prioritize specific error fields from the backend, then generic fallbacks
    throw new Error(
      errorData.detail || // Common for Django REST Framework auth errors like this one
      errorData.message || // For generic messages
      (typeof errorData === 'string' ? errorData : Object.values(errorData).flat().join(', ')) || // Handle string errors or object errors
      `HTTP Error: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

// -----------------------------------------------------------
// 2. Async Thunks for API Calls

// Fetch Wishlist Items
// GET: /user/cart-wishlist/get/?customer=158&is_cart=false
export const fetchWishlistItems = createAsyncThunk(
  'wishlist/fetchItems',
  async (customerId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token; // Access the authentication token

      console.log("fetchWishlistItems: Token found in state:", !!token); // Debugging token presence

      if (!token) {
        return rejectWithValue("Authentication token not found. Please log in.");
      }

      const url = new URL(`${API_BASE_URL}/user/cart-wishlist/get/`);
      url.searchParams.append('customer', customerId);
      url.searchParams.append('is_cart', 'false');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ADDED AUTHORIZATION HEADER
        },
      });

      return await handleFetchResponse<WishlistItem[]>(response);
    } catch (error: any) {
      console.error("API Error fetching wishlist:", error.message);
      return rejectWithValue(error.message || "Failed to fetch wishlist items.");
    }
  }
);

// Add or Update Wishlist Item
// POST: /user/cart-wishlist/update/
interface AddUpdateWishlistPayload {
  customer: string;
  product_id: string;
  quantity: number;
  is_cart: boolean;
  product_name: string;
  product_image: string;
  product_price: number;
  base_price: number;
  selling_price: number;
  slug: string;
  stock: number;
}
export const addOrUpdateWishlistItem = createAsyncThunk(
  'wishlist/addOrUpdateItem',
  async (payload: AddUpdateWishlistPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token; // Access the authentication token

      console.log("addOrUpdateWishlistItem: Token found in state:", !!token); // Debugging token presence

      if (!token) {
        return rejectWithValue("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${API_BASE_URL}/user/cart-wishlist/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ADDED AUTHORIZATION HEADER
        },
        body: JSON.stringify(payload),
      });

      return await handleFetchResponse<WishlistItem>(response);
    } catch (error: any) {
      console.error("API Error adding/updating wishlist item:", error.message);
      return rejectWithValue(error.message || "Failed to add/update wishlist item.");
    }
  }
);

// Remove Wishlist Item
// DELETE: /user/cart-wishlist/remove/
interface RemoveWishlistPayload {
  customer_id: string;
  product_id: string;
}

export const removeWishlistItem = createAsyncThunk(
  'wishlist/removeItem',
  async (payload: RemoveWishlistPayload, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token; // Access the authentication token

      console.log("removeWishlistItem: Token found in state:", !!token); // Debugging token presence

      if (!token) {
        return rejectWithValue("Authentication token not found. Please log in.");
      }

      const response = await fetch(`${API_BASE_URL}/user/cart-wishlist/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ADDED AUTHORIZATION HEADER
        },
        body: JSON.stringify(payload),
      });

      // For DELETE, if the backend sends 204 No Content, response.json() would fail.
      // We return the payload directly on success to update the local state.
      if (response.status === 204) {
        return payload; // No content, so just return the input payload
      }

      // If response.ok is false, handleFetchResponse will throw an error with more details.
      // If response.ok is true AND not 204, then it should have a JSON body.
      return await handleFetchResponse(response); // This will handle non-204 successful responses or throw on errors
    } catch (error: any) {
      console.error("API Error removing wishlist item:", error.message);
      return rejectWithValue(error.message || "Failed to remove wishlist item.");
    }
  }
);


// -----------------------------------------------------------
// 3. Wishlist Slice Definition
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist(state) {
      state.wishlistItems = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Wishlist Items ---
      .addCase(fetchWishlistItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.status = 'succeeded';
        state.wishlistItems = action.payload;
        state.error = null;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast.error(action.payload as string || "Failed to load wishlist.");
      })
      // --- Add or Update Wishlist Item ---
      .addCase(addOrUpdateWishlistItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addOrUpdateWishlistItem.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        state.status = 'succeeded';
        state.error = null;
        const addedItem = action.payload;
        const existingItemIndex = state.wishlistItems.findIndex(
          (item) => item.product_id === addedItem.product_id
        );

        if (existingItemIndex !== -1) {
          state.wishlistItems[existingItemIndex] = addedItem;
          toast.success("Wishlist item updated!");
        } else {
          state.wishlistItems.push(addedItem);
          toast.success("Product added to wishlist!");
        }
      })
      .addCase(addOrUpdateWishlistItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast.error(action.payload as string || "Failed to add to wishlist.");
      })
      // --- Remove Wishlist Item ---
      .addCase(removeWishlistItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeWishlistItem.fulfilled, (state, action: PayloadAction<RemoveWishlistPayload>) => {
        state.status = 'succeeded';
        state.error = null;
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item.product_id !== action.payload.product_id
        );
        toast.success("Product removed from wishlist!");
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        toast.error(action.payload as string || "Failed to remove from wishlist.");
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;