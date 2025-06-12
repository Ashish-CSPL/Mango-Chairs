// app/Redux/Slices/wishlistSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import fetchData from "@/api/fetchdata";

// Define the structure of a single wishlist item received from the backend
export interface WishlistItem {
  id: string; // This is the ID of the wishlist entry itself (from backend) - OR product_id if backend doesn't provide unique ID
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
        // --- REMOVAL PATH: Use the unique wishlist entry ID for removal ---
        if (!existingWishlistItem?.id) {
          // This should ideally not happen if fetchWishlistItems populates 'id' correctly
          throw new Error("Cannot remove: Existing wishlist item ID not found in state.");
        }
        
        const removePayload = {
          id: existingWishlistItem.id, // <--- This is the unique ID of the wishlist entry
          customer: customer,          
          product_id: product_id,      
          is_cart: is_cart,
        };

        await fetchData("/user/cart-wishlist/remove/", "DELETE", {
          body: removePayload, 
          token: token,
        });

        toast.success("Product removed from wishlist!");
        // Return product_id for reducer to filter out the item
        return { type: "remove", product_id }; 

      } else {
        // --- ADDITION PATH: Construct full WishlistItem from backend response and original payload ---
        const backendResponse = await fetchData<any>("/user/cart-wishlist/update/", "POST", {
          body: productPayload, // This 'productPayload' has all the details we sent
          token: token,
        });

        if (!backendResponse || !Array.isArray(backendResponse.products) || backendResponse.products.length === 0) {
            throw new Error("Backend response to add product was invalid or empty.");
        }

        const returnedProductInfo = backendResponse.products[0];

        // Construct a full WishlistItem using details from the original payload
        // and the 'id' (which is effectively the product_id from the backend response).
        const constructedWishlistItem: WishlistItem = {
            id: returnedProductInfo.id.toString(), // Use the 'id' (product_id) from backend response
            customer: productPayload.customer,
            product_id: productPayload.product_id,
            quantity: productPayload.quantity,
            is_cart: productPayload.is_cart,
            product_name: productPayload.product_name,
            product_image: productPayload.product_image,
            product_price: productPayload.product_price,
            base_price: productPayload.base_price,
            selling_price: productPayload.selling_price,
            slug: productPayload.slug,
            stock: productPayload.stock,
        };

        toast.success("Product added to wishlist!");
        // Return constructed WishlistItem for reducer to add to state
        return { type: "add", productPayload: constructedWishlistItem }; 
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
          console.log("--- REMOVE ACTION FULFILLED (Reducer) ---");
          console.log("Attempting to remove product_id (from action.payload):", product_id);
          console.log("Current wishlistItems BEFORE filter (product_ids):", state.wishlistItems.map(item => item.product_id));

          state.wishlistItems = state.wishlistItems.filter(
            (item) => {
              const keepItem = item.product_id !== product_id;
              console.log(`  Comparing item.product_id (${item.product_id}) with target product_id (${product_id}). Keep item: ${keepItem}`);
              return keepItem;
            }
          );
          state.productIdsInWishlist = state.productIdsInWishlist.filter(
            (id) => id !== product_id
          );
          console.log("Current wishlistItems AFTER filter (product_ids):", state.wishlistItems.map(item => item.product_id));
          console.log("New productIdsInWishlist (AFTER filter):", state.productIdsInWishlist);
          console.log("--- END REMOVE ACTION FULFILLED (Reducer) ---");

        } else if (type === "add" && productPayload) {
          // Add the new item to the state, ensuring it's not a duplicate.
          // productPayload is now a properly constructed WishlistItem.
          if (!state.productIdsInWishlist.includes(productPayload.product_id)) {
            state.wishlistItems.push(productPayload);
            state.productIdsInWishlist.push(productPayload.product_id);
            console.log("wishlistSlice: ADD fulfilled. New productIdsInWishlist:", state.productIdsInWishlist);
          } else {
            // If it was already in the list (e.g., from an optimistic update or a previous load),
            // update it with the full data from the constructed item.
            const existingIndex = state.wishlistItems.findIndex(item => item.product_id === productPayload.product_id);
            if (existingIndex !== -1) {
              state.wishlistItems[existingIndex] = productPayload; // Update with full data
            }
            console.log("wishlistSlice: ADD fulfilled, item already present (likely from optimistic update or fetch). State updated/confirmed.");
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