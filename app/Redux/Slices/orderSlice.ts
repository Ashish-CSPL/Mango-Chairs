// app/Redux/Slices/orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the precise interface for the order response based on your backend structure
export interface OrderDetails {
  order_id: string; // This is the unique string ID like "COM-239-..."
  external_order_id: string | null; // From place-order response
  message: string; // From place-order response (e.g., "Order placed successfully")

  // The 'id: number' property has been REMOVED here.
  // We rely on 'order_id: string' as the primary unique identifier for the order.
  // If your `getCustomerOrders` API *also* returns a *different* numeric ID
  // for the order object itself (e.g., a database primary key), it should be
  // named distinctly (e.g., `db_id?: number;`) if you need it.
  // For now, we assume `order_id` is the main identifier.

  customer: number; // Assuming customer ID is returned in OrderDetails

  // Fields for order totals and payment details (expected in the full OrderDetails response from getCustomerOrders)
  sub_total: number;
  tax: number;
  discount: number;
  delivery_charge: number;
  final_total: number;

  is_payment_done: boolean;
  payment_transaction_id: string | null; // Can be null or empty string
  payment_type: string; // e.g., "Cash on Delivery", "Razorpay"
  payment_datetime: string; // ISO format string

  status: string; // Assuming order status is part of OrderDetails response

  // Formatted string addresses as expected in the order details response from get-customer-orders
  billing_address: string;
  delivery_address: string;

  products: Array<{
    // Array of products in the order
    product_id: number;
    unit_price: number;
    quantity: number;
    // Add any other product details your backend might return in the order details, e.g., 'name', 'image_url'
    name?: string; // Optional: if product name is returned in getCustomerOrders response
    image?: string; // Optional: if product image URL is returned in getCustomerOrders response
  }>;
  discount_coupon_id?: number | null; // Optional, can be null
  // Add other fields your backend might return for a full order details response
}

interface OrderState {
  order: OrderDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    setOrderSuccess: (state, action: PayloadAction<OrderDetails>) => {
      state.order = action.payload;
      state.loading = false;
      state.error = null;
    },
    setOrderError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.order = null;
    },
    clearOrderState: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setOrderLoading,
  setOrderSuccess,
  setOrderError,
  clearOrderState,
} = orderSlice.actions;

export default orderSlice.reducer;