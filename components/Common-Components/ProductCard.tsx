"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Product, Variant } from "@/types/Products"; // Correct path and exports assumed

// --- REDUX IMPORTS ---
import { useDispatch } from "react-redux";
import { addToCart, CartItem } from "@/app/Redux/Store/cartSlice"; // <-- CartItem imported here

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const dispatch = useDispatch();

  // Determine the image to display: selected variant's first image, or product's first image, or a placeholder
  const displayImage =
    selectedVariant?.images?.[0] || product.images?.[0] || "/placeholder.png";

  // Determine the price to display: selected variant's selling price, or product's selling price
  const displayPrice =
    selectedVariant?.selling_price ?? product.selling_price ?? "0";
  const basePrice = product.base_price ?? "0"; // Base price always comes from the main product

  const handleAddToCart = () => {
    // Determine the actual item data (product or selected variant) to add to cart
    // If a variant is selected, use its details; otherwise, use the main product's details.
    const itemToAdd = selectedVariant || product;

    // Construct the CartItem object with necessary properties.
    // Ensure that `id`, `name`, `image`, `price`, and `quantity` are always present.
    const cartItem: CartItem = {
      // Use the variant's ID if a variant is selected, otherwise the product's ID.
      id: itemToAdd.id,
      // Use the variant's name if available, otherwise the product's name.
      // Type assertion `as Product` or `as Variant` helps TypeScript understand the properties.
      name: (itemToAdd as Product).name || product.name,
      // Construct the full image URL.
      image: `https://nxadmin.consociate.co.in${displayImage}`,
      // Convert the display price to a number.
      price: parseFloat(displayPrice.toString()),
      quantity: 1, // Always add 1 item to cart on click

      // Include optional properties for richer cart experience
      slug: product.slug, // The product's slug is used for linking back to the product page from cart
      selectedVariantId: selectedVariant?.id, // ID of the selected variant, if any
      color: selectedVariant?.specification?.colour,
      size: selectedVariant?.specification?.size,
      stock: itemToAdd.stock,
      title: undefined,
      isRare: undefined,
      regularPrice: undefined,
      isOnSale: false,
    };

    console.log("Adding to cart (Dispatching Redux action):", cartItem);
    dispatch(addToCart(cartItem));

    toast.success("Product added successfully!");
  };

  return (
    <div className="px-2">
      <div className="border-[1px] border-[#C5C5C5] hover:shadow-md transition min-h-full w-full mb-6">
        <div
          className="p-1 flex items-center justify-center relative"
          style={{ borderBottom: "1px solid #C5C5C5" }}
        >
          {/* Link to product details page if slug exists */}
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
            // Fallback if no slug (though typically products will have slugs)
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

          {/* Wishlist Button */}
          <div className="absolute top-1 right-1 z-20 bg-white p-1 rounded-full shadow hover:text-red-500 h-8 w-8 flex items-center justify-center">
            <button>
              <Heart size={16} strokeWidth={1.5} />
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

            {/* Variant selection (colors/images) */}
            <div className="flex gap-1 mt-1 flex-wrap">
              {product.variant_list?.slice(0, 3).map((variant, index) => (
                <div
                  key={variant.id ?? `variant-${index}`} // Use variant ID or a unique index for key
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

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className="mt-2 bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
            >
              Add to Cart
            </button>
          </div>

          {/* Star Rating Placeholder */}
          <div className="text-yellow-500 text-sm sm:text-base whitespace-nowrap sm:mt-0">
            ★★★★<span className="text-gray-300">★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
