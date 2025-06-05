// app/wishlist/page.tsx
"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/Redux/Store/store"; // Import AppDispatch
import {
  removeWishlistItem, // <--- CORRECTED IMPORT NAME HERE
  WishlistItem, // Make sure WishlistItem is exported from your slice
} from "@/app/Redux/Slices/wishlistSlice";
import Image from "next/image";
import Link from "next/link";
import { XCircle } from "lucide-react"; // Using XCircle for a clearer "remove" icon
import toast from "react-hot-toast"; // Ensure you have react-hot-toast installed

const WishlistPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Use AppDispatch type
  // Select wishlist items, status, and error from the Redux store
  const { wishlistItems, status, error } = useSelector(
    (state: RootState) => state.wishlist
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Optional: useEffect to fetch wishlist from backend if needed on page load/user login
  // You would need a separate async thunk for fetching if you implement this.
  // Example:
  // useEffect(() => {
  //   if (isAuthenticated && user?.id && status === 'idle' && wishlistItems.length === 0) {
  //     // Dispatch your fetch wishlist thunk here
  //     // dispatch(fetchWishlistItems(user.id));
  //   }
  // }, [isAuthenticated, user?.id, status, dispatch, wishlistItems.length]);

  const handleRemoveFromWishlist = (productId: string) => {
    // Add authentication check before dispatching the removal
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to manage your wishlist.");
      return;
    }

    // Dispatch action to remove by product_id, including customer_id as required by the thunk
    dispatch(
      removeWishlistItem({ customer_id: user.id, product_id: productId })
    )
      .unwrap() // Use unwrap to handle success/failure promises from thunk
      .then(() => {
        // Success toast is handled within the wishlistSlice extraReducers
      })
      .catch((err) => {
        // Error toast is handled within the wishlistSlice extraReducers
        console.error("Failed to remove item from wishlist:", err);
      });
  };

  // Display loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 mt-20 sm:mt-24 lg:mt-28 text-center text-gray-700">
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  // Display error state
  if (status === "failed" && error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20 sm:mt-24 lg:mt-28 text-center text-red-600">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20 sm:mt-24 lg:mt-28">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg mb-4">Your wishlist is empty.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Start adding some products!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item: WishlistItem) => (
            <div
              key={item.product_id}
              className="border rounded-lg p-4 shadow-md flex flex-col relative group"
            >
              <Link
                href={`/product/${item.product_id}`}
                className="flex flex-col flex-grow items-center text-center"
              >
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={`https://nxadmin.consociate.co.in${item.product_image}`}
                    alt={item.product_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png"; // Fallback image if original fails
                    }}
                  />
                </div>
                <h2 className="text-lg font-semibold truncate mb-1">
                  {item.product_name} {/* <--- CORRECTED PRODUCT NAME HERE */}
                </h2>
                <p className="text-gray-700">
                  ₹{item.product_price.toFixed(2)}
                </p>{" "}
                {/* <--- CORRECTED PRICE HERE */}
              </Link>
              <button
                onClick={() => handleRemoveFromWishlist(item.product_id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove from wishlist"
              >
                <XCircle size={20} /> {/* Using XCircle for consistency */}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
