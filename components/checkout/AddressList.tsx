// components/checkout/AddressList.tsx (UPDATED)
"use client";

import React from "react";
import { CustomerAddress } from "@/app/Redux/Slices/addressSlice"; // Correct path to CustomerAddress type
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import { deleteCustomerAddress } from "@/app/API_Calls/customerAddress";
import {
  deleteAddress as deleteAddressAction, // Action to delete from Redux store
  setAddressError,
} from "@/app/Redux/Slices/addressSlice";
import toast from "react-hot-toast";

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
      dispatch(deleteAddressAction(id)); // Optimistic update
      await deleteCustomerAddress(id, customerId, token);
      toast.success("Address deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address.");
      dispatch(setAddressError(error.message || "Failed to delete address."));
      console.error("Error deleting address:", error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`border p-4 rounded-lg flex flex-col justify-between
                ${
                  selectedBillingAddress?.id === address.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                }
                ${
                  selectedShippingAddress?.id === address.id &&
                  selectedBillingAddress?.id !== address.id
                    ? "border-green-500 ring-2 ring-green-200"
                    : ""
                }
              bg-white shadow-sm`}
            >
              <div>
                <p className="font-semibold text-lg">{address.full_name}</p>
                <p className="text-gray-700">{address.address}</p>{" "}
                {/* Changed from address_line1 */}
                {address.locality && ( // Changed from address_line2
                  <p className="text-gray-700">{address.locality}</p> // Changed from address_line2
                )}
                <p className="text-gray-700">
                  {address.city}, {address.state} {address.zipcode}
                </p>
                <p className="text-gray-700">{address.country}</p>
                <p className="text-gray-700">Phone: {address.phone_number}</p>
                {/* Display if address is selected/default */}
                {address.is_selected && ( // Changed from is_default
                  <span className="mt-2 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    Default Address
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => onSelectBilling(address)}
                  className={`px-3 py-1 rounded-md text-sm font-medium
                    ${
                      selectedBillingAddress?.id === address.id
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                >
                  {selectedBillingAddress?.id === address.id
                    ? "Billing Selected"
                    : "Use as Billing"}
                </button>
                <button
                  onClick={() => onSelectShipping(address)}
                  className={`px-3 py-1 rounded-md text-sm font-medium
                    ${
                      selectedShippingAddress?.id === address.id
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                >
                  {selectedShippingAddress?.id === address.id
                    ? "Shipping Selected"
                    : "Use as Shipping"}
                </button>
                <button
                  onClick={() => onEditAddress(address)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Delete
                </button>
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
