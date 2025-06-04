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
} from "@/app/Redux/Slices/addressSlice";
import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import GuestLoginPrompt from "@/components/checkout/GuestLoginPrompt";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import { removeFromCart, updateQuantity } from "@/app/Redux/Store/cartSlice"; // Import cart actions
import toast, { Toaster } from "react-hot-toast"; // Import toast for notifications

const CheckoutPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  // Destructure authentication and user data from Redux state
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );
  // Destructure address-related state from Redux
  const {
    addresses,
    loading: addressesLoading,
    error: addressError,
    selectedBillingAddress,
    selectedShippingAddress,
  } = useSelector((state: RootState) => state.address);

  // Get cart items from Redux state
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  // State for coupon code input
  const [couponCode, setCouponCode] = useState("");

  // Calculate total amount from cart items
  const totalAmount = cartItems.reduce((total: number, item: any) => {
    const priceValue = typeof item.price === "number" ? item.price : 0;
    return total + priceValue * item.quantity;
  }, 0);

  // Handlers for cart item quantity and removal (similar to CartClientPage)
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

  // State for controlling address form visibility and data for editing
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any | null>(null); // Use 'any' or your CustomerAddress type

  // Centralized function to fetch addresses, memoized with useCallback for stability
  const fetchAddresses = useCallback(async () => {
    const customerId = user?.id; // Get customerId from the user object

    // Proceed with fetching only if authenticated, token is present, and customerId is a valid number
    if (isAuthenticated && token && typeof customerId === "number") {
      dispatch(setAddressLoading(true)); // Set loading state to true
      try {
        // Call the API to get customer addresses
        const fetchedAddresses = await getCustomerAddresses(customerId, token);
        console.log("DEBUG: Fetched Addresses API Response:", fetchedAddresses);

        // Dispatch the fetched addresses to the Redux store
        // The getCustomerAddresses function is designed to always return an array.
        if (Array.isArray(fetchedAddresses)) {
          dispatch(setAddresses(fetchedAddresses));
        } else {
          // This block should ideally not be reached if getCustomerAddresses is robust
          console.error(
            "fetchAddresses received non-array result from getCustomerAddresses:",
            fetchedAddresses
          );
          dispatch(
            setAddressError("Received unexpected data format for addresses.")
          );
          dispatch(setAddresses([])); // Ensure state is an empty array even on error
        }
      } catch (err: any) {
        // Handle API errors during address fetching
        dispatch(setAddressError(err.message || "Failed to fetch addresses."));
        console.error("Error fetching addresses in checkout:", err);
        dispatch(setAddresses([])); // Clear addresses on error
      } finally {
        dispatch(setAddressLoading(false)); // Always set loading to false after fetch attempt
      }
    } else if (!isAuthenticated) {
      // If not authenticated, clear addresses and set loading to false
      console.log("User not authenticated, not fetching addresses.");
      dispatch(setAddresses([]));
      dispatch(setAddressLoading(false));
    } else if (user && typeof customerId !== "number") {
      // If authenticated but customerId is missing or invalid, handle gracefully
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
      // Fallback for cases where authentication state is still resolving or not yet present
      dispatch(setAddressLoading(false));
    }
  }, [isAuthenticated, token, user?.id, dispatch]); // Dependencies for useCallback: re-create if these change

  // Effect hook to trigger fetchAddresses when dependencies change (initial load, login/logout)
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]); // Dependency on the memoized fetchAddresses function

  // Handlers for selecting billing and shipping addresses
  const handleSelectBilling = (address: any) => {
    dispatch(setSelectedBillingAddress(address));
  };

  const handleSelectShipping = (address: any) => {
    dispatch(setSelectedShippingAddress(address));
  };

  // Handler for editing an existing address
  const handleEditAddress = (address: any) => {
    setAddressToEdit(address); // Set the address to pre-fill the form
    setShowAddressForm(true); // Show the address form modal
  };

  // Handler for adding a new address
  const handleAddNewAddress = () => {
    setAddressToEdit(null); // Clear addressToEdit to ensure a new address form
    setShowAddressForm(true); // Show the address form modal
  };

  // Callback from AddressForm when an address is saved/updated
  const handleAddressFormSave = () => {
    setShowAddressForm(false); // Close the address form modal
    setAddressToEdit(null); // Clear the address being edited
    // Re-fetch all addresses to ensure the list is up-to-date with backend changes
    fetchAddresses();
  };

  // Callback from AddressForm when the form is cancelled
  const handleAddressFormCancel = () => {
    setShowAddressForm(false); // Close the address form modal
    setAddressToEdit(null); // Clear the address being edited
  };

  // Determine if the component has the necessary data to render the AddressForm
  const customerId = user?.id;
  const isReadyForForm =
    isAuthenticated && token && typeof customerId === "number";

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" /> {/* Add Toaster here */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          {!isAuthenticated ? (
            // Display guest login prompt if not authenticated
            <GuestLoginPrompt />
          ) : (
            // Main checkout content for authenticated users
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
                // Render AddressList if not loading and no error
                <AddressList
                  addresses={Array.isArray(addresses) ? addresses : []} // Ensure addresses is an array
                  selectedBillingAddress={selectedBillingAddress}
                  selectedShippingAddress={selectedShippingAddress}
                  onSelectBilling={handleSelectBilling}
                  onSelectShipping={handleSelectShipping}
                  onEditAddress={handleEditAddress}
                  onAddNewAddress={handleAddNewAddress}
                />
              )}

              {/* Render Modal and AddressForm only if authentication and customer ID are ready */}
              {isReadyForForm ? (
                <Modal
                  isOpen={showAddressForm}
                  onClose={handleAddressFormCancel}
                >
                  {/* This is the AddressForm component */}
                  <AddressForm
                    addressToEdit={addressToEdit}
                    customerId={customerId} // Correctly passing customerId
                    token={token} // Correctly passing token
                    onSave={handleAddressFormSave}
                    onCancel={handleAddressFormCancel}
                  />
                </Modal>
              ) : (
                // Display an error or loading message if form opens but data is not ready
                showAddressForm && ( // Only show this modal if the form was attempted to be opened
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
          {/* Payment Method Section (Hardcoded as per image) */}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg font-semibold text-lg">
            Payment Method
          </div>
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                defaultChecked
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="ml-2 text-gray-800">
                Razorpay Secure (UPI, Cards, Wallets, NetBanking)
              </span>
            </label>
          </div>
        </div>

        {/* Right Section: Your Cart, Apply Coupon, Order Summary */}
        <div className="md:w-1/3 space-y-6">
          {/* Your Cart Section */}
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
              onClick={() => router.push("/shop")} // Example: Go back to shopping
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Go Back To Shopping
            </button>
          </div>

          {/* Apply Coupon Section */}
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

          {/* Order Summary Section */}
          <div className="bg-orange-600 text-white p-4 rounded-t-lg font-semibold text-lg">
            Order Summary
          </div>
          <div className="bg-white p-6 rounded-b-lg shadow-md">
            <div className="flex justify-between mb-2 text-gray-700">
              <span>Subtotal:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4 mt-4">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <button
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-3 rounded-lg transition duration-200"
              onClick={() => console.log("Place Order clicked")} // Placeholder for actual order placement logic
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
