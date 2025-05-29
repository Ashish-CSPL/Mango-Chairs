"use client";

import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { Heart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Product, Variant } from "@/types/Products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const dispatch = useDispatch();

  const displayImage =
    selectedVariant?.images?.[0] || product.images?.[0] || "/placeholder.png";

  const displayPrice =
    selectedVariant?.selling_price ?? product.selling_price ?? "0";
  const basePrice = product.base_price ?? "0";

  const handleAddToCart = () => {
    const cartProduct = selectedVariant
      ? { ...selectedVariant, parentProduct: product }
      : product;

    dispatch(addToCart(cartProduct));
    toast.success("Product added successfully!");
  };

  return (
    <div className="px-2">
      <div className="border-[1px] border-[#C5C5C5] hover:shadow-md transition min-h-full w-full mb-6">
        <div
          className="p-1 flex items-center justify-center relative"
          style={{ borderBottom: "1px solid #C5C5C5" }}
        >
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

          <div className="absolute top-1 right-1 z-20 bg-white p-1 rounded-full shadow hover:text-red-500 h-8 w-8 flex items-center justify-center">
            <button>
              <Heart size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center text-center sm:text-left px-2 py-1">
          <div className="flex flex-col p-0 sm:p-2 md:p-2">
            <h2 className="line-clamp-1 text-sm font-semibold">
              <Link href={`/product/${product.slug}`}>
                <h2 className="line-clamp-1 text-sm font-semibold hover:underline">
                  {product.name}
                </h2>
              </Link>
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
                  key={variant.id ?? index}
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
