"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import fetchSecondary from "@/api/fetchSecondary";
import { Product } from "@/types/productTypes";

interface Category {
  id: number;
  name: string;
}

export default function CategoryProductDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchSecondary<Category[]>(
          "/product/categories",
          "GET"
        );
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch all products initially
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = (await fetchSecondary("/product", "GET")) as
          | { items?: Product[] }
          | Product[];
        const extracted = Array.isArray(data) ? data : data.items || [];
        setProducts(extracted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  // Fetch products by category
  const handleCategoryClick = async (category: string) => {
    setActiveCategory(category);
    try {
      const endpoint = category
        ? `/product/category?category=${category}`
        : "/product";
      const data = (await fetchSecondary(endpoint, "GET")) as
        | { items?: Product[] }
        | Product[];
      const extracted = Array.isArray(data) ? data : data.items || [];
      setProducts(extracted);
    } catch (error) {
      console.error("Error fetching category products:", error);
    }
  };

  return (
    <div className="px-4 md:px-12 py-8">
      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button
          onClick={() => handleCategoryClick("")}
          className={`px-4 py-2 rounded-full border ${
            activeCategory === ""
              ? "bg-[#FF9601] text-white border-[#FF9601]"
              : "bg-white text-[#FF9601] border-[#FF9601] hover:bg-[#FF9601] hover:text-white"
          } transition-colors duration-300`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={`px-4 py-2 rounded-full border ${
              activeCategory === category.name
                ? "bg-[#FF9601] text-white border-[#FF9601]"
                : "bg-white text-[#FF9601] border-[#FF9601] hover:bg-[#FF9601] hover:text-white"
            } transition-colors duration-300`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
