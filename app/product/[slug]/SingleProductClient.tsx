"use client";

import { useState } from "react";
import { Product, Variant } from "@/types/productTypes";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import toast from "react-hot-toast";
import Image from "next/image";

interface Props {
  product: Product;
}

const SingleProductClient = ({ product }: Props) => {
  const dispatch = useDispatch();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants[0] || null
  );

  const initialImage =
    selectedVariant?.images?.[0] &&
    typeof selectedVariant.images[0] !== "string"
      ? selectedVariant.images[0].url
      : product.image || "/default.png";

  const [mainImage, setMainImage] = useState<string>(initialImage);

  const formatImageUrl = (url?: string) => {
    if (!url) return "/default.png";
    return url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_SECONDARY_API}${url}`;
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        image: formatImageUrl(mainImage),
        price: selectedVariant.Price ?? product.price ?? 0,
        variant: selectedVariant.description ?? "Variant", // ✅ FIXED HERE
        quantity: 1,
      })
    );
    toast.success("Product added to cart!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 mt-20 overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Variant Thumbnails */}
        <div className="flex md:flex-col gap-3 max-h-[500px] overflow-x-auto md:overflow-y-auto">
          {product.variants.map((variant) =>
            variant.images.map((img, index) => {
              const imageUrl =
                typeof img === "string" ? img : img?.url ?? product.image;

              const imageId =
                typeof img === "string" ? `${variant.id}-${index}` : img?.id;

              return (
                <Image
                  key={imageId}
                  src={formatImageUrl(imageUrl)}
                  alt="Variant Thumbnail"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover border cursor-pointer rounded flex-shrink-0"
                  onClick={() => {
                    setMainImage(imageUrl || product.image);
                    setSelectedVariant(variant);
                  }}
                />
              );
            })
          )}
        </div>

        {/* Main Image */}
        <div className="flex-1 w-full">
          <Image
            src={formatImageUrl(mainImage)}
            alt={product.name}
            width={500}
            height={500}
            className="w-full max-w-md h-auto object-cover border rounded mx-auto"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 w-full">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="mb-4 text-gray-600">{product.description}</p>

          {/* Price (Mobile & Tablet view aligned below description) */}
          <div className="text-lg font-medium text-gray-800 mb-2 md:mb-4">
            Price: ₹{selectedVariant?.Price ?? product.price ?? 0}
          </div>

          {/* Variant Selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  const img =
                    typeof variant.images?.[0] === "string"
                      ? variant.images[0]
                      : variant.images?.[0]?.url;

                  setSelectedVariant(variant);
                  setMainImage(img || product.image);
                }}
                className={`px-3 py-1 border rounded ${
                  selectedVariant?.id === variant.id
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {variant.specification?.colour ?? "Default"}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 w-full sm:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductClient;
