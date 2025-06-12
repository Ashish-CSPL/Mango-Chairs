// app/wishlist/page.tsx

"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

// --- REDUX IMPORTS ---
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/Redux/Store/store";
import { addToCart, CartItem } from "@/app/Redux/Store/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlistItems,
  WishlistItem,
  AddWishlistPayload,
} from "@/app/Redux/Slices/wishlistSlice";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlistItems, status, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  useEffect(() => {
    // Only fetch if authenticated and user ID is available, and if status is idle or no items are loaded yet
    if (
      isAuthenticated &&
      user?.id &&
      (status === "idle" || wishlistItems.length === 0)
    ) {
      dispatch(fetchWishlistItems(user.id.toString()));
    }
  }, [isAuthenticated, user?.id, dispatch, status, wishlistItems.length]);

  const handleRemoveFromWishlist = (itemToRemove: WishlistItem) => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to remove items from your wishlist.");
      return;
    }

    console.log(
      "WishlistPage: Calling handleRemoveFromWishlist for item:",
      itemToRemove.product_name
    );
    console.log(
      "WishlistPage: Product ID being sent for removal:",
      itemToRemove.product_id
    );

    const payloadForToggle: AddWishlistPayload = {
      customer: user.id.toString(),
      product_id: itemToRemove.product_id,
      quantity: itemToRemove.quantity,
      is_cart: false,
      product_name: itemToRemove.product_name,
      product_image: itemToRemove.product_image,
      product_price: itemToRemove.product_price,
      base_price: itemToRemove.base_price,
      selling_price: itemToRemove.selling_price,
      slug: itemToRemove.slug,
      stock: itemToRemove.stock,
    };

    dispatch(toggleWishlistItem(payloadForToggle))
      .unwrap()
      .then(() => {
        console.log("WishlistPage: toggleWishlistItem (remove) SUCCEEDED.");
      })
      .catch((err) => {
        console.error("WishlistPage: toggleWishlistItem (remove) FAILED:", err);
      });
  };

  const handleAddToCartFromWishlist = (item: WishlistItem) => {
    const cartItem: CartItem = {
      id: item.product_id, // Using product_id as the cart item ID
      name: item.product_name,
      image:
        item.product_image && item.product_image.startsWith("/")
          ? `https://nxadmin.consociate.co.in${item.product_image}`
          : `https://nxadmin.consociate.co.in/media/placeholder.png`,
      price: item.selling_price,
      quantity: 1,
      slug: item.slug,
      stock: item.stock,
      // Optional/undefined properties for CartItem
      title: undefined,
      isRare: undefined,
      regularPrice: undefined,
      isOnSale: false,
      selectedVariantId: undefined, // If wishlist items don't store variant info
      color: undefined,
      size: undefined,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${item.product_name} added to cart!`);
    handleRemoveFromWishlist(item); // Optionally remove from wishlist after adding to cart
  };

  if (status === "loading") {
    return <div className="p-4 text-center">Loading wishlist...</div>;
  }

  if (status === "failed") {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center">
        Please log in to view your wishlist.
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return <div className="p-4 text-center">Your wishlist is empty.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="border p-4 rounded-lg shadow-md flex flex-col items-center"
          >
            <Link href={`/product/${item.slug}`} className="w-full text-center">
              <Image
                src={
                  item.product_image && item.product_image.startsWith("/")
                    ? `https://nxadmin.consociate.co.in${item.product_image}`
                    : `https://nxadmin.consociate.co.in/media/placeholder.png`
                }
                alt={item.product_name || "Wishlist Item Image"}
                width={200}
                height={200}
                className="object-contain mb-4"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/200x200/cccccc/333333?text=No+Image";
                }}
              />
              <h2 className="text-lg font-semibold line-clamp-1">
                {item.product_name}
              </h2>
            </Link>
            <p className="text-gray-700 mt-2">₹{item.selling_price}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleAddToCartFromWishlist(item)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleRemoveFromWishlist(item)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
