// components/checkout/AddressForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { CustomerAddress } from "@/app/Redux/Slices/addressSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import {
  addAddress,
  updateAddress, // Ensure updateAddress action is imported
  setAddressLoading,
  setAddressError,
} from "@/app/Redux/Slices/addressSlice";
import {
  createCustomerAddress,
  updateCustomerAddress,
  AddressPayload, // Import AddressPayload from your API file
} from "@/app/API_Calls/customerAddress";
import toast from "react-hot-toast";

// Define the interface for the form data, aligned with CustomerAddress and AddressPayload
interface FormData {
  id?: number; // Optional for new addresses
  customer: number;
  full_name: string;
  phone_number: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  is_default_billing: boolean; // Only billing default remains
}

// Define the props for the AddressForm component
interface AddressFormProps {
  addressToEdit: CustomerAddress | null;
  customerId: number;
  token: string;
  onSave: () => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addressToEdit,
  customerId,
  token,
  onSave,
  onCancel,
}) => {
  const dispatch = useDispatch();
  const allAddresses = useSelector(
    (state: RootState) => state.address.addresses
  );

  const [formData, setFormData] = useState<FormData>({
    id: addressToEdit?.id || undefined,
    customer: customerId,
    full_name: addressToEdit?.full_name || "",
    phone_number: addressToEdit?.phone_number || "",
    address: addressToEdit?.address || "",
    locality: addressToEdit?.locality || "",
    city: addressToEdit?.city || "",
    state: addressToEdit?.state || "",
    zipcode: addressToEdit?.zipcode || "",
    country: addressToEdit?.country || "",
    is_default_billing: addressToEdit?.is_default_billing || false,
  });

  useEffect(() => {
    setFormData({
      id: addressToEdit?.id || undefined,
      customer: customerId,
      full_name: addressToEdit?.full_name || "",
      phone_number: addressToEdit?.phone_number || "",
      address: addressToEdit?.address || "",
      locality: addressToEdit?.locality || "",
      city: addressToEdit?.city || "",
      state: addressToEdit?.state || "",
      zipcode: addressToEdit?.zipcode || "",
      country: addressToEdit?.country || "",
      is_default_billing: addressToEdit?.is_default_billing || false,
    });
  }, [addressToEdit, customerId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication token is missing. Please log in.");
      return;
    }

    dispatch(setAddressLoading(true));
    try {
      // --- Logic to unset other default billing addresses in Redux before API call ---
      if (formData.is_default_billing) {
        allAddresses.forEach((a: CustomerAddress) => {
          if (a.id !== formData.id && a.is_default_billing) {
            dispatch(updateAddress({ ...a, is_default_billing: false }));
            // IMPORTANT: In a real application, you would also send an API call
            // to update this other address on the backend to unset its default flag.
            // Example: await updateCustomerAddress(a.id, { ...a, is_default_billing: false }, customerId, token);
          }
        });
      }
      // --- End of default unsetting logic ---

      let responseAddress: CustomerAddress;
      const payload: AddressPayload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        is_selected: formData.is_default_billing, // is_selected in payload now only reflects is_default_billing
      };

      if (formData.id) {
        responseAddress = await updateCustomerAddress(
          formData.id,
          payload,
          customerId,
          token
        );
        dispatch(updateAddress(responseAddress)); // Update Redux store with the response
        toast.success("Address updated successfully!");
      } else {
        responseAddress = await createCustomerAddress(
          payload,
          customerId,
          token
        );
        dispatch(addAddress(responseAddress)); // Add to Redux store with the response
        toast.success("Address added successfully!");
      }
      onSave();
    } catch (error: any) {
      console.error("Error saving address:", error);
      dispatch(setAddressError(error.message || "Failed to save address."));
      toast.error(error.message || "Failed to save address.");
    } finally {
      dispatch(setAddressLoading(false));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {addressToEdit ? "Edit Address" : "Add New Address"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 1
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="locality"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="locality"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="is_default_billing"
            name="is_default_billing"
            type="checkbox"
            checked={formData.is_default_billing}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_default_billing"
            className="ml-2 block text-sm text-gray-900"
          >
            Set as default billing address
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {addressToEdit ? "Save Changes" : "Add Address"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
