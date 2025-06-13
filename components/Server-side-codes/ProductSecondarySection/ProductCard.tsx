"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import Link from "next/link";
import { Product, Variant } from "@/types/Products";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null
  );

  const mainImage =
    selectedVariant?.images?.[0] &&
    typeof selectedVariant.images[0] !== "string"
      ? selectedVariant.images[0].url
      : product.image || "/default.png";

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      title: selectedVariant.description || product.name,
      image: mainImage,
      price: selectedVariant.Price || product.price,
      quantity: 1,
      isRare: false,
      regularPrice: product.price,
      isOnSale: (selectedVariant.Price || 0) < product.price,
      selectedVariantId: selectedVariant.id,
      stock: selectedVariant.stock,
      variant: selectedVariant.description ?? "",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="relative bg-white shadow-xl rounded-2xl border border-gray-200 p-4 transition-transform hover:-translate-y-1 hover:shadow-2xl duration-300 max-w-sm w-full mx-auto group">
      {/* Product image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-60 rounded-xl overflow-hidden mb-3 bg-white">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Title */}
      <h3 className="text-gray-900 text-lg font-semibold truncate mb-1">
        {product.name}
      </h3>

      {/* Price */}
      {selectedVariant?.Price && (
        <p className="text-indigo-600 font-bold text-sm mb-4">
          ₹ {selectedVariant.Price.toFixed(2)}
        </p>
      )}

      {/* Variant selectors & Cart icon */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {product.variants?.map((variant) => {
            const variantImage =
              variant.images?.[0] &&
              typeof variant.images[0] !== "string" &&
              variant.images[0].url
                ? variant.images[0].url
                : product.image;

            const isActive = selectedVariant?.id === variant.id;

            return (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`w-10 h-10 rounded-lg border-2 overflow-hidden p-[1px] transition-transform duration-200 hover:scale-105 ${
                  isActive
                    ? "border-indigo-500 ring-2 ring-indigo-300"
                    : "border-gray-300"
                }`}
              >
                <Image
                  src={variantImage}
                  alt={`Variant ${variant.id}`}
                  width={40}
                  height={40}
                  className="object-cover rounded-md w-full h-full"
                />
              </button>
            );
          })}
        </div>

        <button
          onClick={handleAddToCart}
          title="Add to Cart"
          className="p-2 border border-indigo-500 text-indigo-600 rounded-full hover:scale-110 hover:border-indigo-600 hover:text-indigo-700 transition duration-300 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
