// app/Redux/Slices/wishlistSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import fetchData from "@/api/fetchdata";

// Define the structure of a single wishlist item received from the backend
export interface WishlistItem {
  id: string; // This is the ID of the wishlist entry itself (from backend)
  customer: string;
  product_id: string; // The ID of the product (important for matching)
  quantity: number;
  is_cart: boolean;
  product_name: string;
  product_image: string;
  product_price: number;
  base_price: number;
  selling_price: number;
  slug: string;
  stock: number;
  // Add any other properties your API returns for a wishlist item
}

// Define the shape of the data needed to add/update a wishlist item (payload for API)
export interface AddWishlistPayload {
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

// Define the expected structure of the GET /get/ wishlist response
interface GetWishlistResponse {
  customer: number; // or string, depending on your backend
  products: WishlistItem[]; // This is the array we need!
}

// Define the state for the wishlist slice
export interface WishlistState {
  wishlistItems: WishlistItem[];
  productIdsInWishlist: string[]; // For quick lookup of product IDs in the wishlist
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: WishlistState = {
  wishlistItems: [],
  productIdsInWishlist: [],
  status: "idle",
  error: null,
};

// --- Async Thunk for Fetching Wishlist Items ---
export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (customerId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue("Authentication token not found.");
      }

      const response = await fetchData<GetWishlistResponse>(
        "user/cart-wishlist/get/",
        "GET",
        {
          queryParams: { customer: customerId, is_cart: false },
          token: token,
        }
      );
      return response;
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch wishlist.");
      return rejectWithValue(error.message || "Failed to fetch wishlist.");
    }
  }
);

// --- Async Thunk for Toggling (Add/Remove) Wishlist Item ---
// This thunk will now take the full productPayload as before,
// but internally, it will find the existing wishlist item's unique ID for removal.
export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async (productPayload: AddWishlistPayload, { getState, rejectWithValue }) => {
    const state = getState() as {
      wishlist: WishlistState;
      auth: { token: string | null };
    };
    const token = state.auth.token;
    const { product_id, customer, is_cart } = productPayload; // Destructure necessary info

    if (!token) {
      return rejectWithValue("Authentication token not found.");
    }

    // Determine if the product is currently in the wishlist based on its product_id
    const existingWishlistItem = state.wishlist.wishlistItems.find(
      (item) => item.product_id === product_id
    );
    const isCurrentlyInWishlist = !!existingWishlistItem;

    try {
      if (isCurrentlyInWishlist) {
        // --- CRITICAL FIX FOR 500 ERROR: Pass the unique wishlist entry ID for removal ---
        if (!existingWishlistItem?.id) {
          // This ensures we have the actual ID of the wishlist entry to delete
          // This case should ideally not be hit if fetchWishlistItems is populating 'id' correctly
          throw new Error("Cannot remove: Existing wishlist item ID not found in state.");
        }
        
        // This is the payload sent to your backend for deletion
        const removePayload = {
          id: existingWishlistItem.id, // <--- This is the unique ID of the wishlist entry itself
          customer: customer,          // Still useful for backend verification
          product_id: product_id,      // Still useful for backend verification
          is_cart: is_cart,
        };

        // Make the DELETE request.
        // Assuming your backend's /remove/ endpoint expects the ID in the request body.
        await fetchData("/user/cart-wishlist/remove/", "DELETE", {
          body: removePayload, // Send the unique ID of the wishlist entry
          token: token,
        });

        toast.success("Product removed from wishlist!");
        return { type: "remove", product_id };

      } else {
        // --- Logic for Adding a Product ---
        // The backend should return the full WishlistItem object upon successful add,
        // including its newly generated unique 'id'.
        const addedItem = await fetchData<WishlistItem>("/user/cart-wishlist/update/", "POST", {
          body: productPayload,
          token: token,
        });
        toast.success("Product added to wishlist!");
        return { type: "add", productPayload: addedItem }; // Backend should return the full WishlistItem with its ID
      }
    } catch (error: any) {
      console.error("API error during wishlist toggle:", error);
      const errorMessage = error.message || "Failed to update wishlist.";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Wishlist Items ---
      .addCase(fetchWishlistItems.pending, (state) => {
        state.status = "loading";
        console.log("wishlistSlice: fetchWishlistItems.pending");
      })
      .addCase(
        fetchWishlistItems.fulfilled,
        (state, action: PayloadAction<GetWishlistResponse>) => {
          state.status = "succeeded";
          const fetchedProducts = action.payload.products;

          if (Array.isArray(fetchedProducts)) {
            state.wishlistItems = fetchedProducts;
            state.productIdsInWishlist = fetchedProducts.map(
              (item) => item.product_id
            );
            console.log("wishlistSlice: fetchWishlistItems.fulfilled. Fetched productIdsInWishlist:", state.productIdsInWishlist);
          } else {
            console.warn("wishlistSlice: fetchWishlistItems.fulfilled: 'products' was not an array in the payload:", action.payload);
            state.wishlistItems = [];
            state.productIdsInWishlist = [];
            console.log("wishlistSlice: fetchWishlistItems.fulfilled. Set empty productIdsInWishlist due to unexpected 'products' format.");
          }
        }
      )
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        console.error("wishlistSlice: fetchWishlistItems.rejected:", action.payload);
      })
      // --- Toggle Wishlist Item (Add/Remove) ---
      .addCase(toggleWishlistItem.pending, (state) => {
        state.status = "loading";
        console.log("wishlistSlice: toggleWishlistItem.pending");
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { type, product_id, productPayload } = action.payload;

        if (type === "remove") {
          // Filter out the item that was removed
          state.wishlistItems = state.wishlistItems.filter(
            (item) => item.product_id !== product_id
          );
          state.productIdsInWishlist = state.productIdsInWishlist.filter(
            (id) => id !== product_id
          );
          console.log("wishlistSlice: REMOVE fulfilled. New productIdsInWishlist:", state.productIdsInWishlist);
        } else if (type === "add" && productPayload) {
          // Add the new item returned by the backend.
          // This uses the actual WishlistItem object returned by the backend POST request,
          // which includes its unique 'id'.
          // Ensure no duplicates if it was already optimistically added
          if (!state.productIdsInWishlist.includes(productPayload.product_id)) {
            state.wishlistItems.push(productPayload);
            state.productIdsInWishlist.push(productPayload.product_id);
            console.log("wishlistSlice: ADD fulfilled. New productIdsInWishlist:", state.productIdsInWishlist);
          } else {
            // If it was already in the list (e.g., from initial optimistic update),
            // update it with the full data from the backend response.
            const existingIndex = state.wishlistItems.findIndex(item => item.product_id === productPayload.product_id);
            if (existingIndex !== -1) {
              state.wishlistItems[existingIndex] = productPayload; // Update with full backend data (including 'id')
            }
            console.log("wishlistSlice: ADD fulfilled, item already present (likely from optimistic update or backend POST response). State updated/confirmed.");
          }
        }
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        console.error("wishlistSlice: toggleWishlistItem.rejected:", action.payload);
        // Optional: If optimistic update happened before rejection, revert it here.
        // This is complex and often handled by re-fetching on page load or by manual re-addition in UI.
      });
  },
});

export default wishlistSlice.reducer;