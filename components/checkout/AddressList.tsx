// components/checkout/AddressList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { CustomerAddress } from "@/app/Redux/Slices/addressSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import { deleteCustomerAddress } from "@/app/API_Calls/customerAddress";
import {
  removeAddress as deleteAddressAction,
  setAddressError,
  setSelectedBillingAddress,
  setSelectedShippingAddress, // Ensure this is imported for direct dispatch
} from "@/app/Redux/Slices/addressSlice";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import { FaEdit } from "react-icons/fa"; // Import the edit icon

// Define the props interface for AddressList component
interface AddressListProps {
  addresses: CustomerAddress[];
  selectedBillingAddress: CustomerAddress | null;
  selectedShippingAddress: CustomerAddress | null;
  onSelectBilling: (address: CustomerAddress) => void; // Still needed for separate billing selection
  onSelectShipping: (address: CustomerAddress) => void; // Will be used by the new checkbox logic
  onEditAddress: (address: CustomerAddress) => void;
  onAddNewAddress: () => void;
}

// Define the AddressList functional component with React.FC<AddressListProps>
const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedBillingAddress,
  selectedShippingAddress,
  onSelectBilling, // This prop is no longer directly used in JSX for a button, but kept in props
  onSelectShipping, // This prop will now be used by the new checkbox logic
  onEditAddress,
  onAddNewAddress,
}) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const customerId = useSelector((state: RootState) => state.auth.user?.id);

  // This state now primarily reflects if the currently selected shipping and billing are the same address.
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(false);

  useEffect(() => {
    // Update local state based on Redux selected addresses
    if (
      selectedBillingAddress &&
      selectedShippingAddress &&
      selectedBillingAddress.id === selectedShippingAddress.id
    ) {
      setIsBillingSameAsShipping(true);
    } else {
      setIsBillingSameAsShipping(false);
    }
  }, [selectedBillingAddress, selectedShippingAddress]);

  const handleDelete = async (id: number) => {
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }
    if (typeof customerId !== "number") {
      toast.error("Customer ID is missing. Cannot delete address.");
      return;
    }

    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }
    try {
      // Optimistically remove from Redux store first for faster UI feedback
      dispatch(deleteAddressAction(id));
      // Then call the API to delete from the backend
      await deleteCustomerAddress(id, customerId, token);
      toast.success("Address deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address.");
      dispatch(setAddressError(error.message || "Failed to delete address."));
      console.error("Error deleting address:", error);
      // In a real app, you might want to revert the optimistic update here if the API call fails
    }
  };

  // Handler for the new "Use this address for Delivery & Billing" checkbox
  const handleDeliveryAndBillingChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    address: CustomerAddress
  ) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      // When checked, this address becomes both shipping and billing
      dispatch(setSelectedShippingAddress(address));
      dispatch(setSelectedBillingAddress(address));
      // No need to set isBillingSameAsShipping here, useEffect will handle it
    } else {
      // When unchecked, clear both shipping and billing if this was the selected one.
      // This allows the user to then pick a separate billing address.
      if (selectedShippingAddress?.id === address.id) {
        dispatch(setSelectedShippingAddress(null));
      }
      if (selectedBillingAddress?.id === address.id) {
        dispatch(setSelectedBillingAddress(null));
      }
      // No need to set isBillingSameAsShipping here, useEffect will handle it
    }
  };

  const currentAddresses = Array.isArray(addresses) ? addresses : [];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentAddresses.length > 0 ? (
          currentAddresses.map((address) => (
            <div
              key={address.id}
              className={`border p-4 rounded-lg relative flex flex-col justify-between
                ${
                  selectedShippingAddress?.id === address.id
                    ? "border-green-500 ring-2 ring-green-200" // Highlight if it's the selected shipping
                    : selectedBillingAddress?.id === address.id &&
                      !isBillingSameAsShipping
                    ? "border-blue-500 ring-2 ring-blue-200" // Highlight if it's a separate billing
                    : "border-gray-200"
                }
              bg-white shadow-sm`}
            >
              {/* Trash Icon at top right */}
              <button
                onClick={() => handleDelete(address.id)}
                className="absolute top-2 right-2 p-2 text-red-600 hover:text-red-800 transition-colors duration-200 z-10"
                aria-label="Delete address"
              >
                <FaTrash size={18} />
              </button>

              {/* Edit Icon at bottom right */}
              <button
                onClick={() => onEditAddress(address)}
                className="absolute bottom-2 right-2 p-2 text-yellow-600 hover:text-yellow-800 transition-colors duration-200 z-10"
                aria-label="Edit address"
              >
                <FaEdit size={18} />
              </button>

              <div>
                <p className="font-semibold text-lg">{address.full_name}</p>
                <p className="text-gray-700">{address.address_line1}</p>
                {address.address_line2 && (
                  <p className="text-gray-700">{address.address_line2}</p>
                )}
                <p className="text-gray-700">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-gray-700">{address.country}</p>
                <p className="text-gray-700">Phone: {address.phone_number}</p>
                {(address.is_default_shipping ||
                  address.is_default_billing) && (
                  <span className="mt-2 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    Default Address
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {/* New: Combined "Use this address for Delivery & Billing" checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`delivery-billing-${address.id}`}
                    // This checkbox is checked if this address is currently both selected shipping AND selected billing
                    checked={
                      selectedShippingAddress?.id === address.id &&
                      selectedBillingAddress?.id === address.id
                    }
                    onChange={(e) => handleDeliveryAndBillingChange(e, address)}
                    className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
                  />
                  <label
                    htmlFor={`delivery-billing-${address.id}`}
                    className="ml-2 text-sm text-gray-700 font-medium"
                  >
                    Use this address for Delivery & Billing
                  </label>
                </div>

                {/* The "Set as Billing" button is now completely removed */}

                {/* Removed the edit button from here */}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 col-span-full text-center">
            No addresses found. Add a new one!
          </p>
        )}
      </div>
      <button
        onClick={onAddNewAddress}
        className="mt-6 w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
      >
        + Add New Address
      </button>
    </div>
  );
};

export default AddressList;
