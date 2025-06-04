// app/checkout/page.tsx
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
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

      {!isAuthenticated ? (
        // Display guest login prompt if not authenticated
        <GuestLoginPrompt />
      ) : (
        // Main checkout content for authenticated users
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Your Addresses
          </h2>
          {addressesLoading && (
            <p className="text-center text-gray-600">Loading addresses...</p>
          )}
          {addressError && (
            <p className="text-center text-red-500">Error: {addressError}</p>
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
            <Modal isOpen={showAddressForm} onClose={handleAddressFormCancel}>
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
              <Modal isOpen={showAddressForm} onClose={handleAddressFormCancel}>
                <p className="p-4 text-center text-red-600">
                  Error: User authentication or customer ID is not fully
                  loaded/valid for the address form. Please ensure you are
                  logged in correctly.
                </p>
              </Modal>
            )
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>
            <p>Order details will go here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
