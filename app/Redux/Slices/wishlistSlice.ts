// app/Redux/Slices/wishlistSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Ensure this matches what you store and what ProductCard sends
export interface WishlistItem {
  product_id: string; // The ID of the product
  customer_id: string; // The ID of the user (if applicable)
  quantity: number; // Typically 1 for wishlist
  product_name: string; // Name for display
  product_image: string; // Image URL for display
  product_price: number; // Price for display
}

interface WishlistState {
  wishlistItems: WishlistItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const loadWishlistFromLocalStorage = (): WishlistItem[] => {
  if (typeof window !== "undefined") {
    try {
      const serializedState = localStorage.getItem("wishlistItems");
      if (serializedState === null) {
        return [];
      }
      // Ensure parsing correctly handles the types
      return JSON.parse(serializedState) as WishlistItem[];
    } catch (e) {
      console.error("Failed to load wishlist from localStorage", e);
      return [];
    }
  }
  return [];
};

const saveWishlistToLocalStorage = (wishlistItems: WishlistItem[]) => {
  if (typeof window !== "undefined") {
    try {
      const serializedState = JSON.stringify(wishlistItems);
      localStorage.setItem("wishlistItems", serializedState);
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }
};

const initialState: WishlistState = {
  wishlistItems: loadWishlistFromLocalStorage(),
  status: "idle",
  error: null,
};

export const addOrUpdateWishlistItem = createAsyncThunk(
  "wishlist/addOrUpdateItem",
  async (itemData: Omit<WishlistItem, 'customer_id'> & { customer_id: string }, { rejectWithValue }) => {
    try {
      // Simulate API call - REPLACE WITH YOUR ACTUAL API CALL
      // Make sure the backend endpoint expects and returns the WishlistItem structure
      console.log("Simulating API call for addOrUpdateWishlistItem with:", itemData);
      return itemData;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add/update wishlist item");
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeItem",
  async (itemData: { customer_id: string; product_id: string }, { rejectWithValue }) => {
    try {
      // Simulate API call - REPLACE WITH YOUR ACTUAL API CALL
      // Ensure backend endpoint handles removal based on customer_id and product_id
      console.log("Simulating API call for removeWishlistItem with product_id:", itemData.product_id);
      return itemData.product_id; // Return the product_id to remove from state
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove wishlist item");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlistItems = [];
      saveWishlistToLocalStorage(state.wishlistItems);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOrUpdateWishlistItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addOrUpdateWishlistItem.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        state.status = "succeeded";
        const newItem = action.payload;
        const existingItemIndex = state.wishlistItems.findIndex(
          (item) => item.product_id === newItem.product_id
        );

        if (existingItemIndex !== -1) {
          state.wishlistItems[existingItemIndex] = newItem; // Update if exists
        } else {
          state.wishlistItems.push(newItem); // Add if new
        }
        saveWishlistToLocalStorage(state.wishlistItems);
        toast.success("Product added to wishlist!"); // Toast on success
      })
      .addCase(addOrUpdateWishlistItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to add to wishlist";
        toast.error(`Failed to add to wishlist: ${state.error}`); // Toast on failure
      })
      .addCase(removeWishlistItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeWishlistItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item.product_id !== action.payload
        );
        saveWishlistToLocalStorage(state.wishlistItems);
        toast.success("Product removed from wishlist!"); // Toast on success
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to remove from wishlist";
        toast.error(`Failed to remove from wishlist: ${state.error}`); // Toast on failure
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;