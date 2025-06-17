"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Product, Variant } from "@/types/productTypes";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const [selectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null
  );

  const imageUrl =
    selectedVariant?.images?.[0] &&
    typeof selectedVariant.images[0] !== "string"
      ? selectedVariant.images[0].url
      : product.image || "/default.png";

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      title: selectedVariant?.description || product.name,
      image: imageUrl,
      price: selectedVariant?.Price || product.price,
      quantity: 1,
      isRare: false,
      regularPrice: product.price,
      isOnSale: selectedVariant?.Price
        ? selectedVariant.Price < product.price
        : false,
      selectedVariantId: selectedVariant?.id,
      stock: selectedVariant?.stock || 0,
      variant: selectedVariant?.description || "",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 max-w-xs w-full mx-auto transition-all">
      <Link href={`/product/${product.slug}`}>
        {/* Image Container with hover fill effect */}
        <div className="relative w-full h-60 overflow-hidden group rounded-t-2xl">
          <div className="absolute inset-0 bg-yellow-400 origin-bottom transform scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0" />
          <div className="relative z-10 flex justify-center items-center h-full">
            <div className="w-[85%] h-[85%] relative">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </Link>

      {/* Text Content */}
      <div className="p-4 space-y-2">
        {/* Rating */}
        <div className="flex gap-1 text-yellow-400 text-sm">
          {[...Array(4)].map((_, i) => (
            <span key={i}>★</span>
          ))}
          <span className="text-gray-300">★</span>
        </div>

        {/* Title with Veg/Non-Veg Icon */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex items-center gap-4">
          {product.name}
          {product.type === "veg" ? (
            <span className="inline-flex items-center justify-center w-4 h-4 border border-green-600 rounded-sm">
              <span className="w-2 h-2 bg-green-600 rounded-full" />
            </span>
          ) : (
            <span className="inline-flex items-center justify-center w-4 h-4 border border-red-600 rounded-sm">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
            </span>
          )}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-snug line-clamp-2">
          {product.description || "Delicious and cheesy delight..."}
        </p>

        {/* Variant Images */}
        {product.variants?.[0]?.images?.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {product.variants[0].images.map((img, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full border border-gray-300 overflow-hidden"
              >
                <Image
                  src={typeof img === "string" ? img : img.url}
                  alt={`Variant ${idx + 1}`}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Price and Cart Button */}
        <div className="flex items-center justify-between pt-3">
          <div className="text-lg font-bold text-yellow-600">
            ₹{selectedVariant?.Price?.toFixed(2) || product.price.toFixed(2)}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-yellow-400 hover:bg-yellow-500 p-2 rounded-full transition"
          >
            <ShoppingCart size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
