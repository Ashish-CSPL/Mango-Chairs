"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";
import Image from "next/image";
import {
  CartItem,
  removeFromCart,
  updateQuantity,
} from "@/app/Redux/Store/cartSlice";
import toast, { Toaster } from "react-hot-toast";

export default function CartClientPage() {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch();

  const totalAmount = cartItems.reduce((total: number, item: CartItem) => {
    const priceValue = typeof item.price === "number" ? item.price : 0;
    return total + priceValue * item.quantity;
  }, 0);

  const handleRemove = (id: number, name: string) => {
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

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-sm text-gray-600 mb-4">
          <span className="hover:underline cursor-pointer">Home</span> /{" "}
          <span className="font-semibold">Your Basket</span>
        </div>

        <h1 className="text-3xl font-semibold mb-6">Your Basket</h1>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Your cart is empty.
          </p>
        ) : (
          // Responsive flex container:
          // Mobile: column (default)
          // Tablet md: row with stacked widths
          // Large lg: row with original widths
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 lg:w-2/3 bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-6">
              {cartItems.map((item: CartItem) => {
                const currentPrice =
                  typeof item.price === "number" ? item.price : 0;
                const regularPrice =
                  typeof item.regularPrice === "number" ? item.regularPrice : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <button
                      className="text-gray-400 hover:text-gray-600 text-xl font-bold self-start sm:self-auto"
                      onClick={() => handleRemove(item.id, item.name)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      &times;
                    </button>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-lg border border-gray-200"
                      priority
                    />
                    <div className="flex-grow">
                      {item.isRare && (
                        <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          RARE
                        </span>
                      )}
                      <h2 className="text-lg font-medium text-gray-800 mt-1">
                        {item.name}
                      </h2>
                      {item.title && (
                        <p className="text-sm text-gray-600">{item.title}</p>
                      )}
                      <p className="text-sm text-green-600 mt-2">
                        ✔ Click & Collect
                      </p>
                      <p className="text-sm text-green-600">✔ Home Delivery</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
                      <span className="text-gray-700">Qty:</span>
                      <div className="flex border border-gray-300 rounded">
                        <button
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l"
                          onClick={() =>
                            dispatch(
                              updateQuantity({ id: item.id, change: -1 })
                            )
                          }
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r"
                          onClick={() =>
                            dispatch(updateQuantity({ id: item.id, change: 1 }))
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        {item.isOnSale && regularPrice > currentPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            £{regularPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-gray-800">
                          £{currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800 ml-4">
                        £{(currentPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="md:w-1/3 lg:w-1/3 bg-white p-4 sm:p-6 rounded-lg shadow-md h-fit">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0 sm:space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="home"
                    defaultChecked
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className="text-gray-700">Home Delivery</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deliveryOption"
                    value="click"
                    className="form-radio text-blue-600 h-4 w-4"
                  />
                  <span className="text-gray-700">Click & Collect</span>
                </label>
              </div>

              <div className="space-y-3 mb-6 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>£{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>£0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3">
                  <span>Total:</span>
                  <span>£{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 rounded-lg transition duration-200">
                Checkout
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="#" className="underline hover:text-gray-700">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-gray-700">
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white p-4 sm:p-6 rounded-lg shadow-md text-sm text-gray-700">
          <h3 className="font-semibold text-base mb-2">
            Delivery Information:
          </h3>
          <p className="mb-1">
            Standard Delivery is{" "}
            <span className="font-semibold">2-4 working days</span>.
          </p>
          <p className="mb-2">Need it faster?</p>
          <p className="mb-2">
            You can upgrade to{" "}
            <span className="font-semibold">Next Day Delivery</span> during
            Checkout for{" "}
            <span className="font-semibold">
              Next Working Day delivery (Order before 10pm)
            </span>
            . Next Day Delivery is not available outside of N Ireland.
            <span className="font-semibold">
              {" "}
              Delivery is Monday to Friday, excluding public holidays.
            </span>
          </p>
          <p className="mb-2">
            Any orders placed after 10pm Friday and over the weekend will not be
            dispatched until Monday, excluding Public Holidays.
          </p>
          <p className="mb-2">
            FREE returns to any Smyths Toys Superstore near you.
          </p>
          <p className="text-xs">
            Please note, some large items (such as bikes, doll houses,
            playhouses) will be delivered in their original packing which may
            display images or details of the contents.
          </p>
        </div>
      </div>
    </div>
  );
}
