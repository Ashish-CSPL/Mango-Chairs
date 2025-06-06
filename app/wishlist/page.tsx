// app/wishlist/page.tsx
"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/Redux/Store/store";
import {
  fetchWishlistItems,
  removeWishlistItem,
  WishlistItem,
} from "@/app/Redux/Slices/wishlistSlice";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const WishlistPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { wishlistItems, status, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your wishlist.");
      router.push("/login"); // Redirect to login if not authenticated
      return;
    }
    if (user?.id && status === "idle") {
      dispatch(fetchWishlistItems(user.id.toString()));
    }
  }, [isAuthenticated, user?.id, dispatch, status, router]);

  const handleRemoveFromWishlist = (product_id: string) => {
    if (!user?.id) {
      toast.error("User not identified for removal.");
      return;
    }
    dispatch(
      removeWishlistItem({ customer_id: user.id.toString(), product_id })
    )
      .unwrap()
      .then(() => {
        // Toast handled by slice
      })
      .catch((err: any) => {
        console.error("Failed to remove item from wishlist:", err);
      });
  };

  const handleAddToCartFromWishlist = (item: WishlistItem) => {
    if (!user?.id) {
      toast.error("Please log in to add items to cart.");
      return;
    }

    // Prepare cart item payload. This should match your CartItem interface.
    // Ensure all required fields for CartItem are present.
    const cartItemPayload = {
      id: item.product_id, // This needs to be 'product_id' in the payload if backend expects that
      name: item.product_name, // This needs to be 'product_name'
      image: item.product_image, // This needs to be 'product_image'
      price: item.selling_price, // This needs to be 'product_price'
      quantity: 1,
      slug: item.slug,
      stock: item.stock,
      // The payload for addOrUpdateWishlistItem expects these specific keys:
      customer: user.id.toString(), // Missing in your cartItemPayload construction for wishlist update
      product_id: item.product_id,
      is_cart: false, // Explicitly false for wishlist
      base_price: item.base_price, // Make sure WishlistItem has base_price
      selling_price: item.selling_price,
      // ... and other product details as specified in AddUpdateWishlistPayload
    };

    // Dispatch the synchronous addToCart action
    dispatch(addToCart(cartItemPayload));

    // Show success toast immediately after dispatching
    toast.success(`${item.product_name} added to cart!`);

    // Optionally, remove from wishlist immediately after adding to cart
    // This is an async operation, so it keeps its .then/.catch structure.
    handleRemoveFromWishlist(item.product_id);
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    // Adjust this base URL if your media files are served differently
    return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
      "/api",
      ""
    )}${path}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="text-gray-600">
          You need to be logged in to view your wishlist.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto p-8 text-center mt-20">
        <p className="text-xl">Loading wishlist...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Error loading wishlist
        </h1>
        <p className="text-gray-600">
          {error || "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-20">
      <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-10 border rounded-lg shadow-sm bg-white">
          <p className="text-xl text-gray-600 mb-4">Your wishlist is empty.</p>
          <p className="text-md text-gray-500">
            Start adding products you love to your wishlist!
          </p>
          <Link
            href="/"
            className="mt-6 inline-block bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 shadow-md flex flex-col items-center text-center relative bg-white"
            >
              <Link
                href={`/product/${item.slug}`}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={getImageUrl(item.product_image)}
                    alt={item.product_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-contain rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
                <h2 className="text-lg font-semibold truncate mb-1 w-full px-2">
                  {item.product_name}
                </h2>
                <p className="text-gray-700 mb-4">
                  ₹{item.product_price.toFixed(2)}
                </p>
              </Link>
              <div className="flex gap-2 mt-auto w-full justify-center">
                <button
                  onClick={() => handleAddToCartFromWishlist(item)}
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex-grow"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                  className="flex items-center justify-center p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
