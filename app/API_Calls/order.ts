// app/API_Calls/order.ts
import fetchData from "@/api/fetchdata";
import fetchSecondary from "@/api/fetchSecondary";
import { OrderDetails } from "@/app/Redux/Slices/orderSlice"; // Import OrderDetails for getCustomerOrders

// Define the payload structure for the place order API (for the request)
export interface PlaceOrderPayload {
  sub_total: number;
  tax: number;
  discount: number;
  delivery_charge: number;
  final_total: number;
  is_payment_done: boolean;
  payment_transaction_id: string;
  payment_type: string;
  payment_datetime: string;
  billing_address: string;
  delivery_address: string;
  products: Array<{
    product_id: number;
    unit_price: number;
    quantity: number;
  }>;
  discount_coupon_id?: number | null;
}

// NEW: Define the precise response type for the /order/place-order/ endpoint
export interface PlaceOrderSuccessResponse {
  message: string;
  order_id: string; // The ID returned from the backend (string)
  external_order_id: string | null;
}

// Define the response structure for get-customer-orders (paginated, uses OrderDetails)
export interface PaginatedOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OrderDetails[]; // Array of full OrderDetails
}

/**
 * Places a new order.
 * @param payload The data required to place an order.
 * @param token The authentication token.
 * @returns A promise resolving to a PlaceOrderSuccessResponse.
 */
export async function placeOrder(payload: PlaceOrderPayload, token: string): Promise<PlaceOrderSuccessResponse> {
  try {
    const response = await fetchSecondary<PlaceOrderSuccessResponse>( // <PlaceOrderSuccessResponse> here!
      "/order/place-order/",
      "POST",
      {
        token,
        body: payload,
      }
    );
    return response;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
}

/**
 * Fetches a list of orders for a specific customer.
 * @param customerId The ID of the customer.
 * @param token The authentication token.
 * @param page The page number to fetch.
 * @param pageSize The number of items per page.
 * @returns A promise resolving to a paginated list of OrderDetails.
 */
export async function getCustomerOrders(
  customerId: number,
  token: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedOrdersResponse> {
  try {
    const response = await fetchData<PaginatedOrdersResponse>(
      "order/get-customer-orders/",
      "GET",
      {
        token,
        queryParams: {
          customer_id: customerId,
          page: page,
          page_size: pageSize,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
}
