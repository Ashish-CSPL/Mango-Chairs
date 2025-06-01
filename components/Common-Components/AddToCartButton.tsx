// AddToCartButton.tsx
"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { AppDispatch } from "@/app/Redux/Store/store";

export default function AddToCartButton() {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    // --- IMPORTANT: This `sampleProduct` structure needs to match what your cartSlice expects.
    // Your cartSlice.ts looks for `selling_price`, `original_price`, and `images` (an array).
    // I've adjusted this sample to reflect that.
    const sampleProduct = {
      id: 1,
      name: "Premium Luggage Bag", // Matches `item.name`
      title: "Stylish Travel Companion", // Matches `item.title`
      selling_price: 1499.0, // Matches `item.selling_price`
      original_price: 1800.0, // Matches `item.original_price` for isOnSale calculation
      images: ["/images/luggage.jpg"], // Matches `item.images?.[0]` (as an array)
      isRare: false, // Matches `item.isRare`
      // No need for a `quantity` property here, as `addToCart` always adds 1 by default.
    };

    console.log(
      "AddToCartButton: Attempting to add product to cart with payload:",
      sampleProduct
    ); // DEBUG LOG
    dispatch(addToCart(sampleProduct));
  };

  return (
    <button
      onClick={handleAddToCart}
      className="px-4 py-2 bg-black text-white rounded-lg"
    >
      Add to Cart
    </button>
  );
}
