"use client";

import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import Link from "next/link";

interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

interface Variant {
  id: number;
  description: string;
  specification: {
    type: string;
  };
  Price: number;
  stock: number;
  productId: number;
  images?: VariantImage[];
}

interface SecondaryProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  description: string;
  variants: Variant[];
}

interface ProductCardProps {
  product: SecondaryProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.[0] || null
  );

  const mainImage =
    selectedVariant?.images?.[0]?.url || product.image || "/default.png";

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
      isOnSale: selectedVariant.Price < product.price,
      selectedVariantId: selectedVariant.id,
      stock: selectedVariant.stock,
      variant: selectedVariant.description, // ✅ Added field
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="relative bg-white/30 backdrop-blur-lg rounded-2xl shadow-lg p-5 transition hover:shadow-xl hover:-translate-y-1 duration-300 border border-gray-200 group max-w-sm w-full mx-auto">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-64 overflow-hidden rounded-xl mb-4 cursor-pointer">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
      </Link>

      {selectedVariant && (
        <p className="text-blue-600 font-bold mt-1 mb-3 text-sm">
          ₹ {selectedVariant.Price.toFixed(2)}
        </p>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {product.variants?.map((variant) => (
          <div
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            className={`w-12 h-12 rounded-lg border-2 cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 ${
              selectedVariant?.id === variant.id
                ? "border-blue-600 ring-2 ring-blue-400"
                : "border-gray-300"
            }`}
          >
            <Image
              src={variant.images?.[0]?.url || product.image}
              alt={`Variant ${variant.id}`}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-500 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-300"
      >
        Add to Cart
      </button>
    </div>
  );
}
