// components/checkout/AddressList.tsx
"use client";

import React, { useState, useEffect } from "react"; // Removed ReactNode as it's not used in this file
import { CustomerAddress } from "@/app/Redux/Slices/addressSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import { deleteCustomerAddress } from "@/app/API_Calls/customerAddress";
import {
  removeAddress as deleteAddressAction,
  setAddressError,
  setSelectedBillingAddress,
  setSelectedShippingAddress,
} from "@/app/Redux/Slices/addressSlice";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

// Define the props interface for AddressList component
interface AddressListProps {
  addresses: CustomerAddress[];
  selectedBillingAddress: CustomerAddress | null;
  selectedShippingAddress: CustomerAddress | null;
  onSelectBilling: (address: CustomerAddress) => void;
  onSelectShipping: (address: CustomerAddress) => void;
  onEditAddress: (address: CustomerAddress) => void;
  onAddNewAddress: () => void;
}

// Define the AddressList functional component with React.FC<AddressListProps>
const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedBillingAddress,
  selectedShippingAddress,
  onSelectBilling,
  onSelectShipping,
  onEditAddress,
  onAddNewAddress,
}) => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const customerId = useSelector((state: RootState) => state.auth.user?.id);

  // This state is for internal logic, not for default status
  const [isBillingSameAsShipping, setIsBillingSameAsShipping] = useState(false);

  useEffect(() => {
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

    toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"}
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                  className="h-6 w-6 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Delete Address
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this address? This action
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                (async () => {
                  try {
                    dispatch(deleteAddressAction(id));
                    await deleteCustomerAddress(id, customerId, token);
                    toast.success("Address deleted successfully!");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to delete address.");
                    dispatch(
                      setAddressError(
                        error.message || "Failed to delete address."
                      )
                    );
                    console.error("Error deleting address:", error);
                  }
                })();
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: "top-center" }
    );
  };

  const handleDeliveryAndBillingChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    address: CustomerAddress
  ) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      dispatch(setSelectedShippingAddress(address));
      dispatch(setSelectedBillingAddress(address));
    } else {
      if (selectedShippingAddress?.id === address.id) {
        dispatch(setSelectedShippingAddress(null));
      }
      if (selectedBillingAddress?.id === address.id) {
        dispatch(setSelectedBillingAddress(null));
      }
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
                    ? "border-green-500 ring-2 ring-green-200"
                    : selectedBillingAddress?.id === address.id
                    ? "border-blue-500 ring-2 ring-blue-200"
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

              {/* "Default" text under trash icon - now only checks is_default_billing */}
              {address.is_default_billing && (
                <span className="absolute top-10 right-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">
                  Default
                </span>
              )}

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
                <p className="text-gray-700">{address.address}</p>
                {address.locality && (
                  <p className="text-gray-700">{address.locality}</p>
                )}
                <p className="text-gray-700">
                  {address.city}, {address.state} {address.zipcode}
                </p>
                <p className="text-gray-700">{address.country}</p>
                <p className="text-gray-700">Phone: {address.phone_number}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {/* New: Combined "Use this address for Delivery & Billing" checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`delivery-billing-${address.id}`}
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
