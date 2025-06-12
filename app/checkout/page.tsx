// app/checkout/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import { useRouter } from "next/navigation";
import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "@/app/Redux/Store/cartSlice";
import toast, { Toaster } from "react-hot-toast";

// Define the interface for locally managed addresses
export interface LocalAddressItem {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  address_type: "BILLING" | "SHIPPING" | "BOTH"; // Keep address_type for internal logic
}

// Define the interface for the data received from AddressForm (WITHOUT address_type)
interface LocalAddressPayload {
  full_name: string;
  phone_number: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

// Define the API Base URL (adjust this to your actual ngrok URL when deploying backend)
const API_BASE_URL = "http://localhost:8080/";

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  const [savedAddresses, setSavedAddresses] = useState<LocalAddressItem[]>([]);
  const [selectedBillingAddress, setSelectedBillingAddress] =
    useState<LocalAddressItem | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<LocalAddressItem | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "razorpay" | "cod"
  >("razorpay");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<LocalAddressItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const [isSameAsBilling, setIsSameAsBilling] = useState(true);

  // State to track the purpose of adding/editing an address
  const [formPurpose, setFormPurpose] = useState<
    "billing" | "shipping" | "general"
  >("general");

  const totalAmount = cartItems.reduce((total: number, item: any) => {
    const priceValue = typeof item.price === "number" ? item.price : 0;
    return total + priceValue * item.quantity;
  }, 0);

  // --- Helper functions for localStorage ---
  const loadAddressesFromLocalStorage = (): LocalAddressItem[] => {
    if (typeof window === "undefined") return []; // Defensive check for SSR
    try {
      const storedAddresses = localStorage.getItem("user_saved_addresses");
      if (storedAddresses) {
        const parsedAddresses: LocalAddressItem[] = JSON.parse(storedAddresses);
        const validatedAddresses = parsedAddresses.map((addr) => ({
          ...addr,
          address_type: addr.address_type || "BOTH", // Default to 'BOTH' if undefined
        }));
        if (Array.isArray(validatedAddresses)) {
          return validatedAddresses;
        } else {
          console.warn(
            "Stored addresses in localStorage are not an array or are corrupted. Clearing data."
          );
          localStorage.removeItem("user_saved_addresses");
          return [];
        }
      }
    } catch (error) {
      console.error(
        "Failed to parse addresses from localStorage, clearing data:",
        error
      );
      localStorage.removeItem("user_saved_addresses");
      toast.error("Error loading saved addresses.");
    }
    return []; // Return empty array if nothing found or error
  };

  const saveAddressesToLocalStorage = (addresses: LocalAddressItem[]) => {
    if (typeof window === "undefined") return; // Defensive check for SSR
    try {
      localStorage.setItem("user_saved_addresses", JSON.stringify(addresses));
    } catch (error) {
      console.error("Failed to save addresses to localStorage:", error);
      toast.error("Could not save addresses locally.");
    }
  };

  // --- useEffect for initial load ---
  useEffect(() => {
    setSavedAddresses(loadAddressesFromLocalStorage());
  }, []); // Run once on component mount

  // --- useEffect for managing selected addresses ---
  useEffect(() => {
    // Filter addresses by type. If "BOTH", they are available for both.
    const availableBillingAddresses = savedAddresses.filter(
      (addr) => addr.address_type === "BILLING" || addr.address_type === "BOTH"
    );
    const availableShippingAddresses = savedAddresses.filter(
      (addr) => addr.address_type === "SHIPPING" || addr.address_type === "BOTH"
    );

    // If currently selected billing address is not in the filtered list
    if (
      !selectedBillingAddress ||
      !availableBillingAddresses.some(
        (addr) => addr.id === selectedBillingAddress.id
      )
    ) {
      setSelectedBillingAddress(
        availableBillingAddresses.length > 0
          ? availableBillingAddresses[0]
          : null
      );
    }

    if (isSameAsBilling) {
      // If shipping is same as billing, update shipping whenever billing changes
      setSelectedShippingAddress(selectedBillingAddress);
    } else {
      // If shipping is different, ensure selected shipping is still valid
      if (
        !selectedShippingAddress ||
        !availableShippingAddresses.some(
          (addr) => addr.id === selectedShippingAddress.id
        )
      ) {
        setSelectedShippingAddress(
          availableShippingAddresses.length > 0
            ? availableShippingAddresses[0]
            : null
        );
      }
    }
  }, [
    savedAddresses,
    selectedBillingAddress,
    selectedShippingAddress,
    isSameAsBilling,
  ]);

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

  const handleAddNewAddress = (
    purpose: "billing" | "shipping" | "general" = "general"
  ) => {
    setAddressToEdit(null);
    setFormPurpose(purpose);
    setShowAddressForm(true);
  };

  const handleAddressFormSave = (
    newAddressData: Omit<LocalAddressItem, "id" | "address_type">
  ) => {
    let updatedAddresses: LocalAddressItem[];

    if (addressToEdit) {
      // Editing existing address
      updatedAddresses = savedAddresses.map((addr) =>
        addr.id === addressToEdit.id
          ? {
              ...newAddressData,
              id: addressToEdit.id,
              address_type: addressToEdit.address_type,
            } // Use existing type
          : addr
      );
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-blue-500 text-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 items-center justify-center`}
          >
            <p className="text-sm font-medium text-center">
              Address updated successfully!
            </p>
          </div>
        ),
        { position: "top-center", duration: 3000 }
      );
    } else {
      // Adding new address
      let determinedType: "BILLING" | "SHIPPING" | "BOTH";
      if (formPurpose === "billing") {
        determinedType = "BILLING";
      } else if (formPurpose === "shipping") {
        determinedType = "SHIPPING";
      } else {
        determinedType = "BOTH"; // Default for general addition
      }

      const newAddressWithId: LocalAddressItem = {
        ...newAddressData,
        id: Date.now().toString(), // Ensure unique ID for new addresses
        address_type: determinedType, // Assign determined type
      };
      updatedAddresses = [...savedAddresses, newAddressWithId];
    }

    setSavedAddresses(updatedAddresses); // Update state
    saveAddressesToLocalStorage(updatedAddresses); // Explicitly save to localStorage immediately
    setShowAddressForm(false);
    setAddressToEdit(null);
    setFormPurpose("general");
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
    setAddressToEdit(null);
    setFormPurpose("general");
  };

  const handleSelectBilling = (address: LocalAddressItem) => {
    setSelectedBillingAddress(address);
    if (isSameAsBilling) {
      setSelectedShippingAddress(address);
    }
  };

  const handleSelectShipping = (address: LocalAddressItem) => {
    setSelectedShippingAddress(address);
  };

  const handleEditAddress = (address: LocalAddressItem) => {
    setAddressToEdit(address);
    setShowAddressForm(true);
  };

  const performAddressDelete = (addressId: string) => {
    const updatedAddresses = savedAddresses.filter(
      (addr) => addr.id !== addressId
    );
    setSavedAddresses(updatedAddresses); // Update state
    saveAddressesToLocalStorage(updatedAddresses); // Explicitly save to localStorage immediately

    // Adjust selected addresses if the deleted one was selected
    const availableBilling = updatedAddresses.filter(
      (addr) => addr.address_type === "BILLING" || addr.address_type === "BOTH"
    );
    const availableShipping = updatedAddresses.filter(
      (addr) => addr.address_type === "SHIPPING" || addr.address_type === "BOTH"
    );

    if (selectedBillingAddress?.id === addressId) {
      setSelectedBillingAddress(
        availableBilling.length > 0 ? availableBilling[0] : null
      );
    }
    if (selectedShippingAddress?.id === addressId) {
      setSelectedShippingAddress(
        availableShipping.length > 0 ? availableShipping[0] : null
      );
    }
    if (isSameAsBilling) {
      setSelectedShippingAddress(selectedBillingAddress);
    }
    toast.error("Address deleted.");
  };

  const handleDeleteAddress = (addressId: string) => {
    toast(
      (t) => (
        <div className="flex flex-col bg-white p-4 rounded-md shadow-lg border border-gray-200">
          <p className="text-gray-800 font-semibold mb-3">
            Are you sure you want to delete this address?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                performAddressDelete(addressId);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        className: "w-full max-w-xs md:max-w-md",
      }
    );
  };

  const formatAddressToString = (address: LocalAddressItem | null): string => {
    if (!address) return "No address selected.";
    return `${address.full_name}, ${address.address}${
      address.locality ? `, ${address.locality}` : ""
    }, ${address.city}, ${address.state} - ${address.zipcode}, ${
      address.country
    }, Phone: ${address.phone_number}`;
  };

  const handlePlaceOrder = async () => {
    if (!selectedBillingAddress) {
      toast.error("Please select a billing address.");
      return;
    }
    if (!selectedShippingAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    setIsLoading(true);

    const orderPayload = {
      billingAddress: formatAddressToString(selectedBillingAddress),
      deliveryAddress: formatAddressToString(selectedShippingAddress),
      products: cartItems.map((item) => ({
        productId: item.id,
        unitPrice: item.price,
        quantity: item.quantity,
      })),
      paymentType: selectedPaymentMethod.toUpperCase(),
      subTotal: totalAmount,
      couponCode: couponCode || null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}order/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to place order due to a server error."
        );
      }

      const orderResponse = await response.json();
      console.log("Order placed successfully!", orderResponse);
      toast.success("Order placed successfully!");

      dispatch(clearCart());
      router.push(`/order-confirmation/${orderResponse.orderId || "success"}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Could not place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}order/get-orders`, {
        method: "GET",
        headers: {},
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }
      const orders = await response.json();
      console.log("All orders:", orders);
      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders.");
      return [];
    }
  };

  const getSingleOrder = async (orderId: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}order/orderid/${orderId}`, {
        method: "GET",
        headers: {},
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch order ${orderId}.`);
      }
      const order = await response.json();
      console.log(`Order ${orderId}:`, order);
      return order;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      toast.error(`Failed to load order ${orderId}.`);
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Billing Address
            </h2>
            <AddressList
              addresses={savedAddresses.filter(
                (addr) =>
                  addr.address_type === "BILLING" ||
                  addr.address_type === "BOTH"
              )}
              selectedAddress={selectedBillingAddress}
              onSelect={handleSelectBilling}
              onEditAddress={handleEditAddress}
              onDeleteAddress={handleDeleteAddress}
              onAddNewAddress={() => handleAddNewAddress("billing")}
              forPurpose="billing"
              isSameAsBilling={isSameAsBilling} // Pass isSameAsBilling to Billing AddressList
            />

            <div className="flex items-center mt-6 mb-4 p-3 bg-gray-50 rounded-md">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={isSameAsBilling}
                onChange={(e) => setIsSameAsBilling(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="sameAsBilling"
                className="ml-2 text-gray-700 font-medium cursor-pointer"
              >
                Delivery address is same as billing address
              </label>
            </div>

            {!isSameAsBilling && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-dashed border-gray-300">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Choose Delivery Address
                </h3>
                <AddressList
                  addresses={savedAddresses.filter(
                    (addr) =>
                      addr.address_type === "SHIPPING" ||
                      addr.address_type === "BOTH"
                  )}
                  selectedAddress={selectedShippingAddress}
                  onSelect={handleSelectShipping}
                  onEditAddress={handleEditAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onAddNewAddress={() => handleAddNewAddress("shipping")}
                  forPurpose="shipping"
                  // No need to pass isSameAsBilling to shipping list, as its label is not affected
                />
              </div>
            )}

            <Modal isOpen={showAddressForm} onClose={handleAddressFormCancel}>
              <AddressForm
                addressToEdit={addressToEdit}
                onSave={handleAddressFormSave}
                onCancel={handleAddressFormCancel}
              />
            </Modal>
          </div>

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
                className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-4 mt-4">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <button
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={
                !selectedBillingAddress ||
                !selectedShippingAddress ||
                cartItems.length === 0 ||
                isLoading
              }
            >
              {isLoading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
