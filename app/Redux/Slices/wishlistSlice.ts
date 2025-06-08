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

// Define the shape of the data needed to remove a wishlist item (payload for API)
interface RemoveWishlistPayload {
  customer: string;
  product_id: string;
  is_cart: boolean;
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

      const response = await fetchData<GetWishlistResponse>( // <--- IMPORTANT: Change expected type here
        "user/cart-wishlist/get/",
        "GET",
        {
          queryParams: { customer: customerId, is_cart: false },
          token: token,
        }
      );
      return response; // This will now be {customer: ..., products: [...]}
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch wishlist.");
      return rejectWithValue(error.message || "Failed to fetch wishlist.");
    }
  }
);

// --- Async Thunk for Toggling (Add/Remove) Wishlist Item ---
export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async (productPayload: AddWishlistPayload, { getState, rejectWithValue }) => {
    const state = getState() as {
      wishlist: WishlistState;
      auth: { token: string | null };
    };
    const token = state.auth.token;
    const { product_id, customer, is_cart } = productPayload;

    if (!token) {
      return rejectWithValue("Authentication token not found.");
    }

    const isCurrentlyInWishlist =
      state.wishlist.productIdsInWishlist.includes(product_id);

    try {
      if (isCurrentlyInWishlist) {
        const removePayload: RemoveWishlistPayload = {
          customer: customer,
          product_id: product_id,
          is_cart: is_cart,
        };
        await fetchData("/user/cart-wishlist/remove/", "DELETE", {
          body: removePayload,
          token: token,
        });
        toast.success("Product removed from wishlist!");
        return { type: "remove", product_id };
      } else {
        await fetchData<WishlistItem>("/user/cart-wishlist/update/", "POST", {
          body: productPayload,
          token: token,
        });
        toast.success("Product added to wishlist!");
        return { type: "add", productPayload };
      }
    } catch (error: any) {
      console.error("API error during wishlist toggle:", error);
      toast.error(error.message || "Failed to update wishlist.");
      return rejectWithValue(error.message || "Failed to update wishlist.");
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
        (state, action: PayloadAction<GetWishlistResponse>) => { // <--- IMPORTANT: Expect GetWishlistResponse payload
          state.status = "succeeded";
          // FIX: Access the 'products' array from the payload object
          const fetchedProducts = action.payload.products;

          if (Array.isArray(fetchedProducts)) { // <--- Check if products is an array
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
          state.wishlistItems = state.wishlistItems.filter(
            (item) => item.product_id !== product_id
          );
          state.productIdsInWishlist = state.productIdsInWishlist.filter(
            (id) => id !== product_id
          );
          console.log("wishlistSlice: REMOVE fulfilled. New productIdsInWishlist:", state.productIdsInWishlist);
        } else if (type === "add" && productPayload) {
          if (!state.productIdsInWishlist.includes(productPayload.product_id)) {
            const newItem: WishlistItem = {
              id: `${productPayload.product_id}-${Date.now()}`,
              ...productPayload,
            };
            state.wishlistItems.push(newItem);
            state.productIdsInWishlist.push(productPayload.product_id);
            console.log("wishlistSlice: ADD fulfilled. New productIdsInWishlist:", state.productIdsInWishlist);
          } else {
            console.log("wishlistSlice: ADD fulfilled, but item already in productIdsInWishlist. No change to state.");
          }
        }
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        console.error("wishlistSlice: toggleWishlistItem.rejected:", action.payload);
      });
  },
});

export default wishlistSlice.reducer;