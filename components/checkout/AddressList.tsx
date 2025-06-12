// components/checkout/AddressList.tsx
import React from "react";
import { LocalAddressItem } from "@/app/checkout/page"; // Adjust import path if needed

interface AddressListProps {
  addresses: LocalAddressItem[];
  selectedAddress: LocalAddressItem | null; // Generic selected address
  onSelect: (address: LocalAddressItem) => void; // Generic select handler
  onEditAddress: (address: LocalAddressItem) => void;
  onDeleteAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  forPurpose: "billing" | "shipping"; // To differentiate UI/Add new button text
  isSameAsBilling?: boolean; // Optional prop to pass isSameAsBilling state from parent for billing list
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedAddress,
  onSelect,
  onEditAddress,
  onDeleteAddress,
  onAddNewAddress,
  forPurpose,
  isSameAsBilling,
}) => {
  // Helper function to render the address type tag
  const renderAddressTypeTag = (
    address: LocalAddressItem, // Pass the full address object
    isBillingSection: boolean,
    isCurrentlySelected: boolean,
    isSameAsBillingChecked: boolean | undefined
  ) => {
    let text = "";
    let colorClass = "";

    // Logic for the BILLING section
    if (isBillingSection) {
      if (isCurrentlySelected) {
        // Only show tag on selected billing address
        if (isSameAsBillingChecked) {
          text = "Both Billing & Delivery"; // When "same as billing" is checked
          colorClass = "bg-green-100 text-green-800";
        } else {
          text = "Billing Only"; // When "same as billing" is unchecked
          colorClass = "bg-blue-100 text-blue-800";
        }
      }
      // If billing section and NOT selected, 'text' remains empty, so no tag is rendered (as per previous request).
    }
    // Logic for the SHIPPING section
    else {
      // This means forPurpose === 'shipping'
      if (isCurrentlySelected) {
        // Only show tag on selected shipping address
        switch (address.address_type) {
          case "SHIPPING":
            text = "Delivery Only";
            colorClass = "bg-purple-100 text-purple-800";
            break;
          case "BOTH":
            text = "Both";
            colorClass = "bg-gray-100 text-gray-800";
            break;
          // No tag for 'BILLING' type addresses if they somehow appear in the shipping list and are selected.
        }
      }
      // If shipping section and NOT selected, 'text' remains empty, so no tag is rendered.
    }

    if (!text) return null; // Don't render tag if no text

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  return (
    <div>
      {addresses.length === 0 ? (
        <p className="text-gray-600 italic mb-4">
          No {forPurpose} addresses saved. Please add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 mb-4">
          {addresses.map((address) => {
            const isCurrentlySelected = selectedAddress?.id === address.id;
            const isBillingSection = forPurpose === "billing";

            return (
              <div
                key={address.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 group
                  ${
                    isCurrentlySelected
                      ? "border-blue-600 ring-2 ring-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                onClick={() => onSelect(address)}
              >
                {/* Adjusting to align tag to the end (bottom) within the flex container */}
                <div className="flex justify-between items-end mt-4">
                  <h4 className="font-semibold text-lg text-gray-800">
                    {address.full_name}
                  </h4>
                  {/* Display the address type tag here, now aligned to the bottom of the line */}
                  {renderAddressTypeTag(
                    address,
                    isBillingSection,
                    isCurrentlySelected,
                    isSameAsBilling
                  )}
                </div>
                <p className="text-gray-700">{address.address}</p>
                {address.locality && (
                  <p className="text-gray-700">{address.locality}</p>
                )}
                <p className="text-gray-700">
                  {address.city}, {address.state} - {address.zipcode}
                </p>
                <p className="text-gray-700">{address.country}</p>
                <p className="text-gray-700">Phone: {address.phone_number}</p>

                {/* Delete Icon (Top Right) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAddress(address.id);
                  }}
                  className="absolute top-2 right-2 p-1 mr-2 text-red-500 hover:text-red-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100
                           md:opacity-100"
                  aria-label="Delete address"
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

                {/* Edit Icon (Bottom Right, shifted further down) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(address);
                  }}
                  className="absolute bottom-10 right-2 p-1 mr-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 opacity-0 group-hover:opacity-100
                             md:opacity-100"
                  aria-label="Edit address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={onAddNewAddress}
        className="w-full py-3 px-4 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-500 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Add New {forPurpose === "billing" ? "Billing" : "Delivery"} Address
      </button>
    </div>
  );
};

export default AddressList;
