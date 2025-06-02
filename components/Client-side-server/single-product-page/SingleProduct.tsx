// components/Client-side-server/single-product-page/SingleProduct.tsx
"use client";

import { useState } from "react";
import { Product, Variant } from "@/types/Products"; // Ensure path is correct

interface Props {
  product: Product;
}

export default function SingleProduct({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | Product>(
    product.has_variant && product.variant_list?.length
      ? product.variant_list.find((v) => v.is_selected) ||
          product.variant_list[0]
      : product
  );

  const productImage =
    (selectedVariant as Variant)?.images?.[0] || product.images?.[0] || "";

  // Helper function to check if selectedVariant is actually a Variant type
  const isSelectedVariant = (item: Product | Variant): item is Variant => {
    // A Variant has 'specification' property, a Product generally doesn't directly
    return (item as Variant).specification !== undefined;
  };

  return (
    <div className="max-w-7xl mx-auto h-screen px-4 pt-22 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
      {/* Left: Image & Thumbnails */}
      <div className="space-y-4 flex flex-col items-center overflow-y-auto max-h-full">
        {productImage && (
          <img
            src={`https://nxadmin.consociate.co.in${productImage}`}
            alt={product.name} // FIX 1: Always use product.name for the main title's alt text
            className="w-full max-h-[60vh] object-contain rounded-xl border shadow"
          />
        )}

        {product.has_variant &&
          product.variant_list &&
          product.variant_list.length > 0 && (
            <div className="flex gap-3 justify-center overflow-x-auto">
              {product.variant_list.map((variant) => (
                <img
                  key={variant.id}
                  src={`https://nxadmin.consociate.co.in${
                    variant.images?.[0] || ""
                  }`}
                  alt={variant.specification?.colour || "Variant Image"}
                  className={`w-16 h-16 rounded border object-cover cursor-pointer ${
                    selectedVariant.id === variant.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                />
              ))}
            </div>
          )}
      </div>

      {/* Right: Product Info */}
      <div className="overflow-y-auto max-h-full pr-2 space-y-3 text-sm">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>{" "}
        {/* FIX 1: Use product.name */}
        {/* FIX 2: Use type narrowing for 'specification' */}
        {isSelectedVariant(selectedVariant) &&
          selectedVariant.specification?.colour && (
            <p className="text-gray-600">
              Color: {selectedVariant.specification.colour}
            </p>
          )}
        {product.category_name && (
          <p className="text-gray-600">Category: {product.category_name}</p>
        )}
        <div className="text-lg font-semibold text-green-600">
          ₹{selectedVariant.selling_price}
          {/* FIX 3: Corrected base price display logic */}
          {/* Show base price if the selected item is the main product and it has a different base price */}
          {selectedVariant.id === product.id &&
            product.base_price &&
            product.base_price !== product.selling_price && (
              <span className="line-through ml-2 text-gray-400 text-xs">
                ₹{product.base_price}
              </span>
            )}
        </div>
        {/* Use selected variant's description if it's a variant, otherwise product's description */}
        {selectedVariant.description && (
          <p
            className="text-gray-700 text-xs"
            dangerouslySetInnerHTML={{ __html: selectedVariant.description }}
          ></p>
        )}
        {/* Specifications - Use product.product_details for general product specs */}
        <div>
          <h3 className="font-semibold mb-1">Specifications:</h3>
          <ul className="list-disc pl-5 space-y-0.5 text-gray-700 text-xs">
            {product.product_details?.material && (
              <li>Material: {product.product_details.material}</li>
            )}
            {product.product_details?.weight_bearing_number && (
              <li>
                Weight capacity: {product.product_details.weight_bearing_number}{" "}
                kg
              </li>
            )}
            {product.product_details?.is_stackable !== undefined && (
              <li>
                Stackable: {product.product_details.is_stackable ? "Yes" : "No"}{" "}
                {product.product_details?.stackable_pieces_number &&
                  `(${product.product_details.stackable_pieces_number} pcs)`}
              </li>
            )}
            {selectedVariant.dimensions && (
              <li>
                Dimensions: {selectedVariant.dimensions.length}L x{" "}
                {selectedVariant.dimensions.width}W x{" "}
                {selectedVariant.dimensions.height}H
              </li>
            )}
          </ul>
        </div>
        {/* Color Variants */}
        {product.has_variant &&
          product.variant_list &&
          product.variant_list.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1">Available Colors:</h3>
              <div className="flex gap-2">
                {product.variant_list.map((variant) => (
                  <div
                    key={variant.id}
                    title={variant.specification?.colour || "Unknown Color"}
                    className={`w-7 h-7 rounded-full border cursor-pointer ${
                      selectedVariant.id === variant.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={{
                      backgroundColor: variant.colour_code || "transparent",
                    }}
                    onClick={() => setSelectedVariant(variant)}
                  ></div>
                ))}
              </div>
            </div>
          )}
        {/* Action Buttons (Quantity, Buy Now, Add to Cart) */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center border rounded-lg px-2 py-1 text-sm">
            <button className="px-2 text-lg font-bold text-gray-700 hover:text-red-600">
              −
            </button>
            <span className="px-2">1</span>
            <button className="px-2 text-lg font-bold text-gray-700 hover:text-green-600">
              +
            </button>
          </div>
          <button className="w-32 bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 rounded-lg shadow text-sm">
            Buy Now
          </button>
          <button className="w-32 border border-purple-600 text-purple-600 hover:bg-purple-100 font-semibold py-2 rounded-lg shadow text-sm">
            Add to Cart
          </button>
        </div>
        {/* Care, Warranty & Delivery Info */}
        <div className="pt-6 space-y-4 border-t mt-4">
          {product.care_instruction && (
            <div>
              <h3 className="font-semibold mb-1">Care Instructions:</h3>
              <div
                className="text-gray-600"
                dangerouslySetInnerHTML={{
                  __html: product.care_instruction,
                }}
              />
            </div>
          )}

          {product.warranty && (
            <div>
              <h3 className="font-semibold mb-1">Warranty:</h3>
              <div
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.warranty }}
              />
            </div>
          )}

          {product.delivery_or_installation_tips && (
            <div>
              <h3 className="font-semibold mb-1">Delivery/Installation:</h3>
              <p className="text-gray-600">
                {product.delivery_or_installation_tips}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
