// app/order-confirmation/[orderId]/page.tsx
"use client"; // This component remains a client component as it uses Redux hooks and useEffect

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/Redux/Store/store";
import { useRouter } from "next/navigation";
import { getCustomerOrders } from "@/app/API_Calls/order";
import {
  OrderDetails, // Make sure OrderDetails is correctly imported
  setOrderLoading,
  setOrderSuccess,
  setOrderError,
} from "@/app/Redux/Slices/orderSlice"; // Ensure path is correct
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface OrderConfirmationPageProps {
  params: {
    orderId: string; // The order ID from the URL (e.g., 'COM-239-...')
  };
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  params,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { order, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  const orderIdFromUrl = params.orderId; // This is the string like "COM-239-..."

  // Immediate check for invalid orderId format in the URL
  if (!orderIdFromUrl || typeof orderIdFromUrl !== "string") {
    // This return prevents further execution of the component's render function
    // if the orderId is invalid.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-xl font-bold text-red-600 mb-4">
          Invalid Order ID in URL.
        </p>
        <p className="text-gray-700 text-center">
          Please ensure the URL contains a valid order ID (e.g.,
          /order-confirmation/COM-XXX-...).
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  useEffect(() => {
    const fetchAndSetOrder = async () => {
      // Check for authentication and user ID before making API call
      if (!isAuthenticated || !token || typeof user?.id !== "number") {
        toast.error("Please log in to view order details.");
        router.push("/login"); // Redirect to login if not authenticated
        return;
      }

      // Only fetch if the order is not already loaded or if a different orderId is requested
      if (!order || order.order_id !== orderIdFromUrl) {
        dispatch(setOrderLoading(true)); // Set loading state
        try {
          // Fetch all orders for the customer.
          // Ideally, for a single order confirmation, you'd have an API
          // like `getSingleOrder(orderId, customerId, token)` for better efficiency.
          const response = await getCustomerOrders(user.id, token, 1, 50); // Fetch a reasonable number of recent orders
          console.log(
            "DEBUG: Full response from getCustomerOrders API (confirmation page):",
            response
          );

          if (response && Array.isArray(response.results)) {
            // Find the specific order by its string `order_id`
            const foundOrder = response.results.find(
              (o: OrderDetails) => o.order_id === orderIdFromUrl // Explicitly type 'o'
            );

            if (foundOrder) {
              console.log(
                "DEBUG: foundOrder from API response (confirmation page):",
                foundOrder
              );
              dispatch(setOrderSuccess(foundOrder)); // Dispatch the found order
              toast.success("Order details loaded successfully!");
            } else {
              const noOrderFoundMessage = `Order with ID ${orderIdFromUrl} not found in your recent orders.`;
              dispatch(setOrderError(noOrderFoundMessage)); // Set error if order not found
              toast.error(noOrderFoundMessage);
            }
          } else {
            const invalidResponse =
              "Invalid response format when fetching customer orders.";
            dispatch(setOrderError(invalidResponse)); // Set error for invalid API response
            toast.error(invalidResponse);
          }
        } catch (err: any) {
          console.error(
            "DEBUG: Error fetching order details (full error object - confirmation page):",
            err
          );
          // Extract a user-friendly error message
          const errorMessage =
            err.responseBody?.detail ||
            err.message ||
            "Failed to load order details. Please try again.";
          dispatch(setOrderError(errorMessage)); // Set error state
          toast.error(errorMessage);
        } finally {
          dispatch(setOrderLoading(false)); // Always turn off loading
        }
      }
    };

    fetchAndSetOrder(); // Call the async function
  }, [
    orderIdFromUrl,
    isAuthenticated,
    token,
    user?.id,
    dispatch,
    router,
    order, // Include 'order' in dependency array to re-run if order state changes (e.g., cleared)
  ]);

  // Debugging log for Redux state
  console.log(
    "DEBUG: Order state in component render (confirmation page):",
    order
  );

  // --- Render based on loading/error/data states ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-lg font-medium text-gray-700">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Toaster position="top-center" /> {/* Toaster for error messages */}
        <p className="text-xl font-bold text-red-600 mb-4">
          Error loading order:
        </p>
        <p className="text-gray-700 text-center">{error}</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  // If not loading and no error, but order is null (e.g., initial state or not found after fetch)
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Toaster position="top-center" /> {/* Toaster here too */}
        <p className="text-xl font-bold text-gray-800 mb-4">Order not found.</p>
        <p className="text-gray-700 text-center">
          The order ID in the URL might be incorrect, or the order may not
          belong to your account.
        </p>
        <Link
          href="/shop"
          className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // If order data is successfully loaded, render the details
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Thank you for your purchase.
          </p>
          <p className="text-lg font-semibold text-orange-600 mt-1">
            Order ID: **#{order.order_id}**
          </p>{" "}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Order Summary
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>**Payment Type:** {order.payment_type}</p>
              <p>
                **Order Date:**{" "}
                {new Date(order.payment_datetime).toLocaleDateString()}
              </p>
              <p>
                **Order Status:**{" "}
                <span className="font-semibold text-blue-600">
                  {order.status}
                </span>
              </p>
              {order.payment_transaction_id && (
                <p>**Transaction ID:** {order.payment_transaction_id}</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Amount Details
            </h2>
            <div className="space-y-2 text-gray-700">
              <p className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.sub_total?.toFixed(2) || "0.00"}</span>
              </p>
              <p className="flex justify-between">
                <span>Tax:</span>
                <span>₹{order.tax?.toFixed(2) || "0.00"}</span>
              </p>
              <p className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>₹{order.delivery_charge?.toFixed(2) || "0.00"}</span>
              </p>
              <p className="flex justify-between font-semibold text-green-600">
                <span>Discount:</span>
                <span>- ₹{order.discount?.toFixed(2) || "0.00"}</span>
              </p>
              <p className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-2">
                <span>Total:</span>
                <span>₹{order.final_total?.toFixed(2) || "0.00"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Shipping Address
            </h2>
            <address className="not-italic text-gray-700">
              {order.delivery_address &&
              typeof order.delivery_address === "string" ? (
                order.delivery_address
                  .split(",")
                  .map((line: string, index: number) => (
                    <React.Fragment key={index}>
                      {line.trim()}
                      <br />
                    </React.Fragment>
                  ))
              ) : (
                <p>N/A</p>
              )}
            </address>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Billing Address
            </h2>
            <address className="not-italic text-gray-700">
              {order.billing_address &&
              typeof order.billing_address === "string" ? (
                order.billing_address
                  .split(",")
                  .map((line: string, index: number) => (
                    <React.Fragment key={index}>
                      {line.trim()}
                      <br />
                    </React.Fragment>
                  ))
              ) : (
                <p>N/A</p>
              )}
            </address>
          </div>
        </div>

        {/* Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            Items in Your Order
          </h2>
          <div className="space-y-4">
            {order.products && order.products.length > 0 ? (
              order.products.map(
                (
                  item // TypeScript will infer type from OrderDetails['products']
                ) => (
                  <div
                    key={item.product_id} // Assuming product_id is unique enough for key
                    className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <Image
                      // Use actual product image if available, fallback to placeholder
                      src={
                        item.image ||
                        `https://placehold.co/80x80/cccccc/000000?text=P${item.product_id}`
                      }
                      alt={item.name || `Product ID: ${item.product_id}`}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">
                        {item.name || `Product ID: ${item.product_id}`}{" "}
                        {/* Display name if available */}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unit Price: ₹{item.unit_price?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">
                      ₹{(item.unit_price * item.quantity)?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-gray-600 text-center">
                No products found for this order.
              </p>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/my-orders"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            View All Your Orders
          </Link>
          <Link
            href="/" // Changed to homepage, typically after confirmation
            className="ml-4 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
