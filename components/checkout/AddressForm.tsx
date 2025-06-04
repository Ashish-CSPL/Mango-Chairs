// components/checkout/AddressForm.tsx (UPDATED)
"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/Redux/Store/store";
import {
  AddressPayload, // This type will now have 'address', 'locality', 'is_selected'
  createCustomerAddress,
  updateCustomerAddress,
} from "@/app/API_Calls/customerAddress";
import {
  addAddress,
  updateAddress,
  setAddressLoading,
  setAddressError,
} from "@/app/Redux/Slices/addressSlice";
import toast from "react-hot-toast";

// Interface extending AddressPayload to include an optional 'id' for editing
interface FormAddress extends AddressPayload {
  id?: number;
}

interface AddressFormProps {
  addressToEdit: FormAddress | null;
  customerId: number;
  token: string;
  onSave: () => void;
  onCancel: () => void;
}

// Initial state for the form fields (empty for new address)
const initialFormData: FormAddress = {
  full_name: "",
  phone_number: "",
  address: "", // Changed from address_line1
  locality: "", // Changed from address_line2
  city: "",
  state: "",
  zipcode: "",
  country: "",
  is_selected: false, // Changed from is_default
};

const AddressForm: React.FC<AddressFormProps> = ({
  addressToEdit,
  customerId,
  token,
  onSave,
  onCancel,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [formData, setFormData] = useState<FormAddress>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to populate form data when `addressToEdit` prop changes
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        id: addressToEdit.id,
        full_name: addressToEdit.full_name || "", // Ensure string
        phone_number: addressToEdit.phone_number || "", // Ensure string
        address: addressToEdit.address, // Changed from address_line1
        locality: addressToEdit.locality || "", // Changed from address_line2
        city: addressToEdit.city,
        state: addressToEdit.state,
        zipcode: addressToEdit.zipcode,
        country: addressToEdit.country,
        is_selected: addressToEdit.is_selected || false, // Changed from is_default
      });
    } else {
      setFormData(initialFormData);
    }
  }, [addressToEdit]);

  // Handler for input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handler for form submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || typeof customerId !== "number") {
      toast.error("Authentication or Customer ID missing. Please log in.");
      return;
    }

    setIsSubmitting(true);
    dispatch(setAddressLoading(true));

    try {
      let responseAddress;
      const payload: AddressPayload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address, // Changed from address_line1
        locality: formData.locality, // Changed from address_line2
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        country: formData.country,
        is_selected: formData.is_selected, // Changed from is_default
      };

      if (addressToEdit && formData.id) {
        responseAddress = await updateCustomerAddress(
          formData.id,
          payload,
          customerId,
          token
        );
        dispatch(updateAddress(responseAddress));
        toast.success("Address updated successfully!");
      } else {
        responseAddress = await createCustomerAddress(
          payload,
          customerId,
          token
        );
        dispatch(addAddress(responseAddress));
        toast.success("Address created successfully!");
      }
      onSave();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save address.";
      toast.error(errorMessage);
      dispatch(setAddressError(errorMessage));
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
      dispatch(setAddressLoading(false));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {addressToEdit ? "Edit Address" : "Add New Address"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label
            htmlFor="full_name"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Full Name:
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone_number"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Phone Number:
          </label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="address"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Address Line 1: (Street, House No.)
        </label>
        <input
          type="text"
          id="address" // Changed from address_line1
          name="address" // Changed from address_line1
          value={formData.address} // Changed from address_line1
          onChange={handleChange}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="locality"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Address Line 2: (Locality, Apt/Suite, Optional)
        </label>
        <input
          type="text"
          id="locality" // Changed from address_line2
          name="locality" // Changed from address_line2
          value={formData.locality} // Changed from address_line2
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mb-4">
          <label
            htmlFor="city"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            City:
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="state"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            State:
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="zipcode"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Zip Code:
          </label>
          <input
            type="text"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="country"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Country:
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="is_selected" // Changed from is_default
          name="is_selected" // Changed from is_default
          checked={formData.is_selected} // Changed from is_default
          onChange={handleChange}
          className="mr-2 leading-tight"
        />
        <label htmlFor="is_selected" className="text-sm text-gray-700">
          {" "}
          {/* Changed from is_default */}
          Set as Default/Selected Address
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
        >
          {isSubmitting
            ? "Saving..."
            : addressToEdit
            ? "Update Address"
            : "Add Address"}
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
