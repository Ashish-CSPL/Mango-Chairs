// app/product/[slug]/page.tsx
import React from "react";
import fetchData from "@/api/fetchdata"; // Assuming this can fetch single products
import { Product } from "@/types/Products"; // Adjust path if needed

interface ProductPageProps {
  params: {
    slug: string; // The slug captured from the URL (e.g., 'symphony')
  };
}

// You might want to make this a server component for better performance (default in App Router)
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  let product: Product | null = null;
  let error: string | null = null;

  try {
    // Assuming your fetchData function can fetch a single product by slug
    // You'll likely need a specific API endpoint for single product details.
    // For example: `frontend/products/by-slug/${slug}` or `frontend/products/?slug=${slug}`
    const response = await fetchData(`frontend/products/by-slug/${slug}`); // <-- Adjust this API endpoint!
    if (response && response.product) {
      // Assuming the response has a 'product' field
      product = response.product;
    } else if (
      response &&
      Array.isArray(response.products) &&
      response.products.length > 0
    ) {
      // If your API returns an array for a slug query
      product = response.products[0];
    } else {
      error = "Product not found.";
    }
  } catch (err: any) {
    console.error("Failed to fetch product:", err);
    error = err.message || "Failed to load product details.";
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-center text-red-600 text-xl">
        {error}
        <p className="mt-4 text-gray-700 text-base">
          Please check the product URL or try again later.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-center text-gray-600 text-xl">
        Loading product...
      </div>
    );
  }

  // Render your product details here using the 'product' data
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-700 mb-6">
        {product.description || "No description available."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.images && product.images[0] && (
            <img
              src={`https://nxadmin.consociate.co.in${product.images[0]}`}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          )}
        </div>
        <div>
          <p className="text-3xl font-semibold text-green-600 mb-4">
            ₹{product.selling_price || "N/A"}
            {product.base_price &&
              product.base_price !== product.selling_price && (
                <span className="line-through text-lg ml-2 text-gray-500">
                  ₹{product.base_price}
                </span>
              )}
          </p>
          {/* Add more product details here, e.g., variants, add to cart button, etc. */}
          <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
