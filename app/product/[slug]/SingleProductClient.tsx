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
  const [mainImage, setMainImage] = useState<string>(
    selectedVariant?.images?.[0]?.url || product.image
  );

  const formatImageUrl = (url: string) => {
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
        price: selectedVariant.Price,
        variant: selectedVariant.description,
        quantity: 1,
      })
    );
    toast.success("Product added to cart!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mt-20">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Variant Thumbnails */}
        <div className="flex md:flex-col gap-3 max-h-[500px] overflow-auto">
          {product.variants.map((variant) =>
            variant.images.map((img) => (
              <Image
                key={img.id}
                src={formatImageUrl(img.url)}
                alt="Variant Thumbnail"
                width={64}
                height={64}
                className="w-16 h-16 object-cover border cursor-pointer rounded"
                onClick={() => {
                  setMainImage(img.url);
                  setSelectedVariant(variant);
                }}
              />
            ))
          )}
        </div>

        {/* Main Image */}
        <div className="flex-1">
          <Image
            src={formatImageUrl(mainImage)}
            alt={product.name}
            width={500}
            height={500}
            className="w-full max-w-md h-auto object-cover border rounded"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="mb-4 text-gray-600">{product.description}</p>

          <p className="text-lg font-medium text-gray-800 mb-2">
            Price: ₹{selectedVariant?.Price ?? product.price}
          </p>

          {/* Variant Selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariant(variant);
                  setMainImage(variant.images[0]?.url || product.image);
                }}
                className={`px-3 py-1 border rounded ${
                  selectedVariant?.id === variant.id
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {variant.specification.color}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductClient;
