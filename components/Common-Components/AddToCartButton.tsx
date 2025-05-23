"use client";

import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { AppDispatch } from "@/app/Redux/Store/store";

export default function AddToCartButton() {
  const dispatch = useDispatch<AppDispatch>();

  const handleAddToCart = () => {
    const sampleProduct = {
      id: 1,
      title: "Luggage Bag",
      name: "Premium Luggage Bag",
      price: 1499,
      image: "/images/luggage.jpg",
      quantity: 1,
    };

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
