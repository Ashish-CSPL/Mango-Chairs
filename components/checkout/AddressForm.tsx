// components/checkout/AddressForm.tsx
import React, { useState, useEffect } from "react";
// Import LocalAddressItem for type safety, but the form won't directly set address_type
import { LocalAddressItem } from "@/app/checkout/page";

interface AddressFormProps {
  addressToEdit: LocalAddressItem | null;
  // The onSave function will no longer expect address_type directly from the form
  // It will be passed in by the parent component.
  onSave: (address: Omit<LocalAddressItem, "id" | "address_type">) => void; // Removed address_type from payload type
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  addressToEdit,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        full_name: addressToEdit.full_name,
        phone_number: addressToEdit.phone_number,
        address: addressToEdit.address,
        locality: addressToEdit.locality,
        city: addressToEdit.city,
        state: addressToEdit.state,
        zipcode: addressToEdit.zipcode,
        country: addressToEdit.country,
      });
    } else {
      // Clear form if no address to edit (i.e., adding a new address)
      setFormData({
        full_name: "",
        phone_number: "",
        address: "",
        locality: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
      });
    }
  }, [addressToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // Now, formData does NOT include address_type
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
            Address (House No., Building, Street)
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
            Area / Locality
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
              Zip Code
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

        {/* REMOVED ADDRESS TYPE SELECTION */}
        {/*
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="address_type"
                value="BILLING"
                checked={formData.address_type === 'BILLING'}
                onChange={handleChange}
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">Billing</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="address_type"
                value="SHIPPING"
                checked={formData.address_type === 'SHIPPING'}
                onChange={handleChange}
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">Delivery</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="address_type"
                value="BOTH"
                checked={formData.address_type === 'BOTH'}
                onChange={handleChange}
                className="form-radio text-blue-600 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">Both</span>
            </label>
          </div>
        </div>
        */}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {addressToEdit ? "Save Changes" : "Add Address"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
