// components/ProductCard.tsx
"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Product, Variant } from "@/types/Products";

// --- REDUX IMPORTS ---
import { useDispatch, useSelector } from "react-redux";
import { addToCart, CartItem } from "@/app/Redux/Store/cartSlice";
// --- CORRECTED IMPORT STATEMENT HERE ---
import {
  addOrUpdateWishlistItem, // Now correctly imported as named exports
  removeWishlistItem, // Now correctly imported as named exports
} from "@/app/Redux/Slices/wishlistSlice";
import { RootState, AppDispatch } from "@/app/Redux/Store/store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const dispatch: AppDispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { wishlistItems } = useSelector((state: RootState) => state.wishlist);

  // Determine if the current product is in the wishlist
  const isInWishlist = useMemo(() => {
    // Ensure wishlistItems is an array for safety
    if (!Array.isArray(wishlistItems)) {
      return false;
    }
    // Correctly check if ANY item in wishlistItems has the current product's ID
    // assuming WishlistItem in Redux contains product_id
    return wishlistItems.some((item) => item.product_id === product.id);
  }, [wishlistItems, product.id]);

  const displayImage =
    selectedVariant?.images?.[0] || product.images?.[0] || "/placeholder.png";

  const displayPrice =
    selectedVariant?.selling_price ?? product.selling_price ?? "0";
  const basePrice = product.base_price ?? "0";

  const handleAddToCart = () => {
    // Determine the item to add based on selected variant or main product
    const itemToAdd = selectedVariant || product;

    // Construct the CartItem object
    const cartItem: CartItem = {
      id: itemToAdd.id, // Use variant ID if selected, otherwise product ID
      name: (itemToAdd as Product).name || product.name, // Use variant name or product name
      image: `https://nxadmin.consociate.co.in${displayImage}`, // Use displayImage for consistency
      price: parseFloat(displayPrice.toString()),
      quantity: 1,

      slug: product.slug,
      selectedVariantId: selectedVariant?.id,
      color: selectedVariant?.specification?.colour,
      size: selectedVariant?.specification?.size || undefined,
      stock: itemToAdd.stock,
      title: product.name, // Use product name as title if not defined
      isRare: false, // Default or get from product data
      regularPrice: parseFloat(basePrice.toString()),
      isOnSale:
        parseFloat(displayPrice.toString()) < parseFloat(basePrice.toString()),
    };

    dispatch(addToCart(cartItem));
    toast.success("Product added to cart!");
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please log in to manage your wishlist.");
      return;
    }

    if (isInWishlist) {
      // Product is in wishlist, so remove it
      dispatch(
        removeWishlistItem({
          customer_id: user.id,
          product_id: product.id,
        })
      )
        .unwrap()
        .then(() => {
          // Toast is now handled by the extraReducers in wishlistSlice
        })
        .catch((error: unknown) => {
          // Toast is now handled by the extraReducers in wishlistSlice
          console.error("Wishlist removal error:", error);
        });
    } else {
      // Product is not in wishlist, so add it
      dispatch(
        addOrUpdateWishlistItem({
          customer_id: user.id,
          product_id: product.id,
          quantity: 1, // Wishlist quantity is typically 1
          // Pass product details for storage in Redux state
          product_name: product.name,
          product_image: product.images?.[0] || "/placeholder.png",
          product_price: parseFloat(displayPrice.toString()),
        })
      )
        .unwrap()
        .then(() => {
          // Toast is now handled by the extraReducers in wishlistSlice
        })
        .catch((error: unknown) => {
          // Toast is now handled by the extraReducers in wishlistSlice
          console.error("Wishlist addition error:", error);
        });
    }
  };

  return (
    <div className="px-2">
      <div className="border-[1px] border-[#C5C5C5] hover:shadow-md transition min-h-full w-full mb-6">
        <div
          className="p-1 flex items-center justify-center relative"
          style={{ borderBottom: "1px solid #C5C5C5" }}
        >
          {product.slug ? (
            <Link href={`/product/${product.slug}`}>
              <Image
                src={`https://nxadmin.consociate.co.in${displayImage}`}
                width={300}
                height={300}
                className="object-cover rounded mb-3"
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/300x300/cccccc/333333?text=No+Image";
                }}
              />
            </Link>
          ) : (
            <Image
              src={`https://nxadmin.consociate.co.in${displayImage}`}
              width={300}
              height={300}
              className="object-cover rounded mb-3"
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/300x300/cccccc/333333?text=No+Image";
              }}
            />
          )}

          {/* Wishlist Button - Updated for Toggle & Color */}
          <div className="absolute top-1 right-1 z-20 bg-white p-1 rounded-full shadow hover:shadow-lg h-8 w-8 flex items-center justify-center transition-all duration-200">
            <button
              onClick={handleWishlistToggle}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
              className="focus:outline-none"
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                // Use Tailwind classes directly for color and fill
                className={
                  isInWishlist ? "text-red-500 fill-red-500" : "text-gray-600"
                }
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center text-center sm:text-left px-2 py-1">
          <div className="flex flex-col p-0 sm:p-2 md:p-2">
            <h2 className="line-clamp-1 text-sm font-semibold">
              {product.slug ? (
                <Link href={`/product/${product.slug}`}>
                  <h2 className="line-clamp-1 text-sm font-semibold hover:underline">
                    {product.name}
                  </h2>
                </Link>
              ) : (
                <h2 className="line-clamp-1 text-sm font-semibold">
                  {product.name}
                </h2>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#f83a3a]">
              ₹{displayPrice}
              {basePrice !== displayPrice && (
                <span className="line-through text-xs ml-1 text-gray-500">
                  ₹{basePrice}
                </span>
              )}
            </p>

            <div className="flex gap-1 mt-1 flex-wrap">
              {product.variant_list?.slice(0, 3).map((variant, index) => (
                <div
                  key={variant.id ?? `variant-${index}`}
                  title={variant.specification?.colour}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-8 h-8 border-[1px] border-[#C5C5C5] cursor-pointer rounded-full overflow-hidden flex items-center justify-center hover:border-blue-400 ${
                    selectedVariant?.id === variant.id
                      ? "ring-2 ring-orange-400"
                      : ""
                  }`}
                >
                  {variant.images?.[0] && (
                    <Image
                      src={`https://nxadmin.consociate.co.in${variant.images[0]}`}
                      alt={variant.specification?.colour || "Variant"}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-2 bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
            >
              Add to Cart
            </button>
          </div>

          <div className="text-yellow-500 text-sm sm:text-base whitespace-nowrap sm:mt-0">
            ★★★★<span className="text-gray-300">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
