"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/Products";
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("");

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchSecondary<Category[]>(
          "/product/categories",
          "GET"
        );
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products either by category or all
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = selectedCategory
          ? `/product/category?category=${selectedCategory}`
          : "/product";
        const data = await fetchSecondary<{ items: Product[] } | Product[]>(
          endpoint,
          "GET"
        );
        const productsData = Array.isArray(data) ? data : data.items;
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Get min & max variant price helpers
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

  // Apply sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "lowToHigh") {
      return getMinVariantPrice(a) - getMinVariantPrice(b);
    } else if (sortOption === "highToLow") {
      return getMaxVariantPrice(b) - getMaxVariantPrice(a);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side categories */}
        <div className="w-full md:w-1/4">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedCategory === ""
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    selectedCategory === category.name
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side products */}
        <div className="flex-1">
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
      </div>
    </div>
  );
};

export default ShopPage;
