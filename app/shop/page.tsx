// app/shop/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/Products";
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchSecondary<{ items: Product[] }>(
          "/product",
          "GET"
        );
        setProducts(data.items);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Helper functions to get min/max variant price safely
  const getMinVariantPrice = (product: Product): number => {
    const prices = product.variants
      ?.map((v) => v.Price)
      .filter((p): p is number => typeof p === "number");
    return prices.length > 0 ? Math.min(...prices) : Infinity;
  };

  const getMaxVariantPrice = (product: Product): number => {
    const prices = product.variants
      ?.map((v) => v.Price)
      .filter((p): p is number => typeof p === "number");
    return prices.length > 0 ? Math.max(...prices) : -Infinity;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "lowToHigh") {
      return getMinVariantPrice(a) - getMinVariantPrice(b);
    } else if (sortOption === "highToLow") {
      return getMaxVariantPrice(b) - getMaxVariantPrice(a);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shop All Products</h1>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Sort by Price</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products found.</p>
      )}
    </div>
  );
};

export default ShopPage;
