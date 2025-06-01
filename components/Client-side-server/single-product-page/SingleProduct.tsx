"use client";

import { useState } from "react";
// Ensure you import from your unified types/product.ts file
import { Product, Variant } from "@/types/Products";

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  // Initialize selectedVariant state. It can be a Variant or the main Product.
  // We prioritize a variant that's marked as 'is_selected', otherwise, default to the main product.
  const [selectedVariant, setSelectedVariant] = useState<Variant | Product>(
    product.variant_list?.find((v) => v.is_selected) || product
  );

  // Determine the image to display based on the selected variant or the main product.
  // Provide a fallback to an empty string to ensure the src attribute is always a string.
  const productImage =
    (selectedVariant as Variant).images?.[0] || // Try selected variant's first image
    product.images?.[0] || // Fallback to product's first image
    ""; // Fallback to an empty string

  return (
    <div className="max-w-7xl mx-auto h-screen px-4 pt-22 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
      {/* Left: Image & Thumbnails */}
      <div className="space-y-4 flex flex-col items-center overflow-y-auto max-h-full">
        {/* Only render the main image if a valid URL is available */}
        {productImage && (
          <img
            src={`https://nxadmin.consociate.co.in${productImage}`}
            alt={product.name}
            className="w-full max-h-[60vh] object-contain rounded-xl border shadow"
          />
        )}

        {/* Only render variant thumbnails if variant_list exists and has items */}
        {product.variant_list && product.variant_list.length > 0 && (
          <div className="flex gap-3 justify-center overflow-x-auto">
            {product.variant_list.map((variant) => (
              <img
                key={variant.id} // Use variant.id as the key
                src={`https://nxadmin.consociate.co.in${
                  variant.images?.[0] || "" // Safely access image and provide fallback
                }`}
                alt={variant.specification?.colour || "Variant Image"} // Safely access specification and provide fallback
                className={`w-16 h-16 rounded border object-cover cursor-pointer ${
                  selectedVariant.id === variant.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedVariant(variant)} // Update selected variant on click
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info */}
      <div className="overflow-y-auto max-h-full pr-2 space-y-3 text-sm">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        {product.category_name && (
          <p className="text-gray-600">Category: {product.category_name}</p>
        )}

        <div className="text-lg font-semibold text-green-600">
          {/* Display selling price of the selected variant */}₹
          {selectedVariant.selling_price}
          {/* Display base price if it exists and is different from selling price */}
          {(selectedVariant as Product).base_price &&
            (selectedVariant as Product).base_price !==
              selectedVariant.selling_price && (
              <span className="line-through ml-2 text-gray-400 text-xs">
                ₹{(selectedVariant as Product).base_price}
              </span>
            )}
        </div>

        {product.description && (
          <p className="text-gray-700 text-xs">{product.description}</p>
        )}

        {/* Specifications */}
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
            {product.dimensions && (
              <li>
                Dimensions: {product.dimensions.length}L x{" "}
                {product.dimensions.width}W x {product.dimensions.height}H
              </li>
            )}
          </ul>
        </div>

        {/* Color Variants */}
        {product.variant_list && product.variant_list.length > 0 && (
          <div>
            <h3 className="font-semibold mb-1">Available Colors:</h3>
            <div className="flex gap-2">
              {product.variant_list.map((variant) => (
                <div
                  key={variant.id}
                  title={variant.specification?.colour || "Unknown Color"}
                  className="w-7 h-7 rounded-full border cursor-pointer"
                  style={{
                    backgroundColor: variant.colour_code || "transparent",
                  }} // Provide a default for background-color
                  onClick={() => setSelectedVariant(variant)}
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {/* Quantity Selector */}
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
