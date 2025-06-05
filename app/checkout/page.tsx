// checkout/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/Redux/Store/store";
import { useRouter } from "next/navigation";
import { getCustomerAddresses } from "@/app/API_Calls/customerAddress";
import {
  setAddressLoading,
  setAddresses,
  setAddressError,
  setSelectedBillingAddress,
  setSelectedShippingAddress,
  CustomerAddress,
} from "@/app/Redux/Slices/addressSlice";
import {
  setOrderLoading,
  setOrderSuccess,
  setOrderError,
  clearOrderState,
  OrderDetails, // Ensure OrderDetails is imported from orderSlice
} from "@/app/Redux/Slices/orderSlice";
import {
  placeOrder,
  PlaceOrderPayload,
  PlaceOrderSuccessResponse,
} from "@/app/API_Calls/order";
import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import GuestLoginPrompt from "@/components/checkout/GuestLoginPrompt";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/app/Redux/Store/cartSlice";
import toast, { Toaster } from "react-hot-toast";

const CheckoutPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    addresses,
    loading: addressesLoading,
    error: addressError,
    selectedBillingAddress,
    selectedShippingAddress,
  } = useSelector((state: RootState) => state.address);
  const { loading: orderLoading, error: orderError } = useSelector(
    (state: RootState) => state.order
  );

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  const [couponCode, setCouponCode] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "razorpay" | "cod"
  >("razorpay");

  const totalAmount = cartItems.reduce((total: number, item: any) => {
    const priceValue = typeof item.price === "number" ? item.price : 0;
    return total + priceValue * item.quantity;
  }, 0);

  const handleRemove = (id: string | number, name: string) => {
    dispatch(removeFromCart(id));
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white text-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{name} removed from cart</p>
              </div>
            </div>
          </div>
        </div>
      ),
      { position: "top-center", duration: 3000 }
    );
  };

  const handleUpdateQuantity = (id: string | number, change: number) => {
    dispatch(updateQuantity({ id, change }));
  };

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<CustomerAddress | null>(
    null
  );

  const fetchAddresses = useCallback(async () => {
    const customerId = user?.id;

    if (isAuthenticated && token && typeof customerId === "number") {
      dispatch(setAddressLoading(true));
      try {
        const fetchedAddresses = await getCustomerAddresses(customerId, token);
        console.log("DEBUG: Fetched Addresses API Response:", fetchedAddresses);

        if (Array.isArray(fetchedAddresses)) {
          dispatch(setAddresses(fetchedAddresses));
        } else {
          console.error(
            "fetchAddresses received non-array result from getCustomerAddresses:",
            fetchedAddresses
          );
          dispatch(
            setAddressError("Received unexpected data format for addresses.")
          );
          dispatch(setAddresses([]));
        }
      } catch (err: any) {
        dispatch(setAddressError(err.message || "Failed to fetch addresses."));
        console.error("Error fetching addresses in checkout:", err);
        dispatch(setAddresses([]));
      } finally {
        dispatch(setAddressLoading(false));
      }
    } else if (!isAuthenticated) {
      console.log("User not authenticated, not fetching addresses.");
      dispatch(setAddresses([]));
      dispatch(setAddressLoading(false));
    } else if (user && typeof customerId !== "number") {
      console.warn(
        "Authenticated user found, but customer ID is missing or invalid. Cannot fetch addresses."
      );
      dispatch(
        setAddressError(
          "Authenticated user data incomplete. Cannot fetch addresses."
        )
      );
      dispatch(setAddresses([]));
      dispatch(setAddressLoading(false));
    } else {
      dispatch(setAddressLoading(false));
    }
  }, [isAuthenticated, token, user?.id, dispatch]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSelectBilling = (address: CustomerAddress) => {
    dispatch(setSelectedBillingAddress(address));
  };

  const handleSelectShipping = (address: CustomerAddress) => {
    dispatch(setSelectedShippingAddress(address));
  };

  const handleEditAddress = (address: CustomerAddress) => {
    setAddressToEdit(address);
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setAddressToEdit(null);
    setShowAddressForm(true);
  };

  const handleAddressFormSave = () => {
    setShowAddressForm(false);
    setAddressToEdit(null);
    fetchAddresses(); // Re-fetch all addresses to ensure the list is up-to-date
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
    setAddressToEdit(null);
  };

  const customerId = user?.id;
  const isReadyForForm =
    isAuthenticated && token && typeof customerId === "number";

  // Helper function to format address into a string
  const formatAddressToString = (address: CustomerAddress): string => {
    if (!address) return "";
    // Note: Assuming address.address, address.locality, etc. are available on CustomerAddress
    // Reconstruct the address string as your backend expects
    let addressString = address.full_name;
    addressString += `, ${address.address}`;
    if (address.locality) addressString += `, ${address.locality}`;
    addressString += `, ${address.city}, ${address.state} - ${address.zipcode}, ${address.country}`;
    return addressString;
  };

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !token || typeof user?.id !== "number") {
      toast.error("Please log in to place an order.");
      return;
    }
    if (!selectedShippingAddress) {
      toast.error("Please select a shipping address.");
      return;
    }
    if (!selectedBillingAddress) {
      toast.error("Please select a billing address.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    dispatch(setOrderLoading(true));
    dispatch(clearOrderState()); // Clear previous order state
    try {
      const orderItems = cartItems.map((item) => ({
        product_id: Number(item.id),
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const subTotal = totalAmount;
      const tax = 0;
      const discount = 0;
      const deliveryCharge = 0;
      const finalTotal = subTotal + tax + deliveryCharge - discount;

      const payload: PlaceOrderPayload = {
        sub_total: subTotal,
        tax: tax,
        discount: discount,
        delivery_charge: deliveryCharge,
        final_total: finalTotal,
        is_payment_done: selectedPaymentMethod === "cod",
        payment_transaction_id:
          selectedPaymentMethod === "cod" ? `COD-${Date.now()}` : "",
        payment_type:
          selectedPaymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
        payment_datetime: new Date().toISOString(),
        billing_address: formatAddressToString(selectedBillingAddress),
        delivery_address: formatAddressToString(selectedShippingAddress),
        products: orderItems,
        ...(couponCode && { discount_coupon_id: Number(couponCode) }),
      };

      console.log(
        "DEBUG: Place Order Payload (Final):",
        JSON.stringify(payload, null, 2)
      );

      // Call placeOrder which now returns PlaceOrderSuccessResponse
      const orderResponse: PlaceOrderSuccessResponse = await placeOrder(
        payload,
        token
      );
      console.log(
        "DEBUG: Order Response after successful placeOrder API call:",
        orderResponse
      );

      // Check if order_id is a string and exists
      if (orderResponse && typeof orderResponse.order_id === "string") {
        // Construct the full OrderDetails object for Redux state
        // IMPORTANT: REMOVE 'id: undefined' as it does not exist in your OrderDetails type
        const fullOrderDetails: OrderDetails = {
          order_id: orderResponse.order_id,
          external_order_id: orderResponse.external_order_id || null, // Ensure it's null if not present, matching interface
          message: orderResponse.message || "Order placed successfully", // Default message if not present
          customer: user.id,
          sub_total: subTotal,
          tax: tax,
          discount: discount,
          delivery_charge: deliveryCharge,
          final_total: finalTotal,
          is_payment_done: payload.is_payment_done,
          payment_transaction_id: payload.payment_transaction_id,
          payment_type: payload.payment_type,
          payment_datetime: payload.payment_datetime,
          billing_address: payload.billing_address,
          delivery_address: payload.delivery_address,
          products: payload.products, // Products from the payload
          status: "Pending", // Set initial status or derive from response if available
          discount_coupon_id: payload.discount_coupon_id || null, // Match interface nullable type
          // REMOVED: id: undefined, // THIS LINE IS GONE!
        };

        dispatch(setOrderSuccess(fullOrderDetails)); // Dispatch the constructed full OrderDetails
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        router.push(`/order-confirmation/${orderResponse.order_id}`); // Use order_id for redirection
      } else {
        const errorMessage =
          "Order placed, but no valid order ID (string) received for redirection.";
        console.error("DEBUG: " + errorMessage, orderResponse);
        dispatch(setOrderError(errorMessage));
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("DEBUG: Error placing order (full error object):", err);
      let errorMessage = "Failed to place order.";
      if (
        err.responseBody &&
        err.responseBody.message &&
        err.responseBody.message.error &&
        err.responseBody.message.error.description
      ) {
        errorMessage = err.responseBody.message.error.description;
      } else if (err.message) {
        errorMessage = err.message;
      }
      dispatch(setOrderError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setOrderLoading(false));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          {!isAuthenticated ? (
            <GuestLoginPrompt />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Delivery & Billing Details
              </h2>
              {addressesLoading && (
                <p className="text-center text-gray-600">
                  Loading addresses...
                </p>
              )}
              {addressError && (
                <p className="text-center text-red-500">
                  Error: {addressError}
                </p>
              )}

              {!addressesLoading && !addressError && (
                <AddressList
                  addresses={Array.isArray(addresses) ? addresses : []}
                  selectedBillingAddress={selectedBillingAddress}
                  selectedShippingAddress={selectedShippingAddress}
                  onSelectBilling={handleSelectBilling}
                  onSelectShipping={handleSelectShipping}
                  onEditAddress={handleEditAddress}
                  onAddNewAddress={handleAddNewAddress}
                />
              )}

              {isReadyForForm ? (
                <Modal
                  isOpen={showAddressForm}
                  onClose={handleAddressFormCancel}
                >
                  <AddressForm
                    addressToEdit={addressToEdit}
                    customerId={customerId}
                    token={token}
                    onSave={handleAddressFormSave}
                    onCancel={handleAddressFormCancel}
                  />
                </Modal>
              ) : (
                showAddressForm && (
                  <Modal
                    isOpen={showAddressForm}
                    onClose={handleAddressFormCancel}
                  >
                    <p className="p-4 text-center text-red-600">
                      Error: User authentication or customer ID is not fully
                      loaded/valid for the address form. Please ensure you are
                      logged in correctly.
                    </p>
                  </Modal>
                )
              )}
            </div>
          )}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg font-semibold text-lg">
            Payment Method
          </div>
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={selectedPaymentMethod === "razorpay"}
                  onChange={() => setSelectedPaymentMethod("razorpay")}
                  className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="ml-2 text-gray-800">
                  Razorpay Secure (UPI, Cards, Wallets, NetBanking)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === "cod"}
                  onChange={() => setSelectedPaymentMethod("cod")}
                  className="form-radio text-blue-600 h-4 w-4"
                />
                <span className="ml-2 text-gray-800">
                  Cash on Delivery (COD)
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="md:w-1/3 space-y-6">
          <div className="bg-orange-600 text-white p-4 rounded-t-lg font-semibold text-lg">
            Your Cart
          </div>
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.title && (
                        <p className="text-sm text-gray-600">{item.title}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        ₹
                        {typeof item.price === "number"
                          ? item.price.toFixed(2)
                          : "0.00"}{" "}
                        / Unit
                      </p>
                      <div className="flex items-center mt-2">
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-l hover:bg-gray-100"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-y border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          className="px-2 py-1 border border-gray-300 rounded-r hover:bg-gray-100"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                        <button
                          className="ml-4 text-red-500 hover:text-red-700"
                          onClick={() => handleRemove(item.id, item.name)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800 text-lg">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-gray-800 font-semibold text-lg mt-4">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => router.push("/shop")}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Go Back To Shopping
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Apply Coupon
            </h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200">
                Apply
              </button>
            </div>
            <a href="#" className="text-blue-600 hover:underline text-sm">
              Show available coupons
            </a>
          </div>

          <div className="bg-orange-600 text-white p-4 rounded-t-lg font-semibold text-lg">
            Order Summary
          </div>
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Subtotal:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            {/* Displaying coupon discount if applicable */}
            {/*
            {couponCode && (
              <div className="flex justify-between mb-2 text-green-700">
                <span>Coupon Discount:</span>
                <span>- ₹XX.XX</span> // Replace XX.XX with actual calculated discount
              </div>
            )}
            */}
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4 mt-4">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <button
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={
                orderLoading ||
                !selectedShippingAddress ||
                !selectedBillingAddress ||
                cartItems.length === 0
              }
            >
              {orderLoading ? "Placing Order..." : "Place Order"}
            </button>
            {orderError && (
              <p className="text-red-500 text-center mt-2">{orderError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
