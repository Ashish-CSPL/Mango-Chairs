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
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = "/product";
        if (sortOption && selectedCategory) {
          endpoint = `/product/filter?sort=${
            sortOption === "lowToHigh" ? "asc" : "desc"
          }&category=${selectedCategory}`;
        } else if (sortOption) {
          endpoint = `/product/filter?sort=${
            sortOption === "lowToHigh" ? "asc" : "desc"
          }`;
        } else if (selectedCategory) {
          endpoint = `/product/category?category=${selectedCategory}`;
        }

        const data = await fetchSecondary<{ items: Product[] } | Product[]>(
          endpoint,
          "GET"
        );
        const productsData = Array.isArray(data) ? data : data.items;
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20 bg-[#FFF9F4]">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left - Categories */}
        <div className="w-full md:w-1/4 bg-[#FFF4E6] p-5 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-[#F58721] mb-4 border-b-2 border-[#F58721] pb-2">
            Categories
          </h2>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === ""
                    ? "bg-[#F58721] text-white shadow-md"
                    : "bg-white text-[#333] hover:bg-[#FFE8D1] border border-[#F58721]"
                }`}
              >
                All Items
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full text-left px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category.name
                      ? "bg-[#F58721] text-white shadow-md"
                      : "bg-white text-[#333] hover:bg-[#FFE8D1] border border-[#F58721]"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right - Products */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-[#F58721] tracking-wide">
              Shop Your Favorite Bites
            </h1>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-[#F58721] rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F58721] bg-white shadow-sm"
            >
              <option value="">Sort by Price</option>
              <option value="lowToHigh">Low to High</option>
              <option value="highToLow">High to Low</option>
            </select>
          </div>

          {/* Loader / Products */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[300px] text-center text-gray-600 space-y-4">
              <div className="w-24 h-24 animate-spin-slow">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1404/1404945.png"
                  alt="Loading pizza..."
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm font-semibold tracking-wide text-[#F58721]">
                Freshly preparing your menu...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center mt-10 text-lg">
              No delicious items found. Try another filter!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
