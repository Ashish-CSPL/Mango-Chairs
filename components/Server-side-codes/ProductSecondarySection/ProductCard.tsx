"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Product, Variant } from "@/types/productTypes";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [mainImage, setMainImage] = useState<string>(
    product.image || "/default.png"
  );

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);

      const defaultImg =
        firstVariant?.images?.[0] &&
        (typeof firstVariant.images[0] === "string"
          ? firstVariant.images[0]
          : (firstVariant.images[0] as { url?: string })?.url);

      if (defaultImg) setMainImage(defaultImg);
    }
  }, [product]);

  const handleVariantImageClick = (img: string) => {
    setMainImage(img);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      title: selectedVariant?.description || product.name,
      image: mainImage,
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

  // --- UPDATED FSSAI SVG Icons (Transparent Background) ---
  const VegIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width="20"
      height="20"
      fill="none"
      stroke="none"
    >
      {/* Changed fill to "none" */}
      <rect
        x="0"
        y="0"
        width="30"
        height="30"
        fill="none"
        stroke="#008000"
        strokeWidth="2"
      />{" "}
      {/* Green border, transparent fill */}
      <circle cx="15" cy="15" r="7" fill="#008000" />{" "}
      {/* Green circle inside */}
    </svg>
  );

  const NonVegIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      width="20"
      height="20"
      fill="none"
      stroke="none"
    >
      {/* Changed fill to "none" */}
      <rect
        x="0"
        y="0"
        width="30"
        height="30"
        fill="none"
        stroke="#FF0000"
        strokeWidth="2"
      />{" "}
      {/* Red border, transparent fill */}
      <circle cx="15" cy="15" r="7" fill="#FF0000" /> {/* Red circle inside */}
    </svg>
  );
  // --- END UPDATED FSSAI SVG Icons ---

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full my-4 max-w-sm mx-auto hover:shadow-2xl transition duration-300 ease-in-out">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-56 rounded-t-2xl overflow-hidden group">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-md z-20 flex items-center justify-center">
            {product.type === "veg" ? <VegIcon /> : <NonVegIcon />}
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-sm text-yellow-500">
          {[...Array(4)].map((_, i) => (
            <span key={i}>★</span>
          ))}
          <span className="text-gray-300">★</span>
        </div>

        <h3 className="text-lg font-bold text-gray-800 truncate">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description ||
            "Tasty, hot and fresh straight from our kitchen!"}
        </p>

        {selectedVariant?.images && selectedVariant.images.length > 1 && (
          <div className="flex gap-2 mt-2">
            {selectedVariant.images.map((img, idx) => {
              const imageUrl =
                typeof img === "string"
                  ? img
                  : (img as { url?: string })?.url || "/default.png";
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVariantImageClick(imageUrl)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    mainImage === imageUrl
                      ? "border-orange-500"
                      : "border-gray-200"
                  } overflow-hidden focus:outline-none`}
                >
                  <Image
                    src={imageUrl}
                    alt={`Variant ${idx + 1}`}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <div className="text-lg font-bold text-orange-600">
            ₹
            {typeof selectedVariant?.Price === "number"
              ? selectedVariant.Price.toFixed(2)
              : typeof product.price === "number"
              ? product.price.toFixed(2)
              : "0.00"}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
