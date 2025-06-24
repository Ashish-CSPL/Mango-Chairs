"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/Products";
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import DeliveryBanner from "@/components/Client-side-server/DeliveryBanner/DeliveryBanner";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const { Range } = Slider;

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

const tagOptions = ["Snack", "Paneer", "Popular", "Sweet", "Pizza", "Nonveg"];

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
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
        let productsList: Product[] = [];

        if (selectedCategories.length > 0) {
          const allRequests = selectedCategories.map((category) =>
            fetchSecondary(
              `/product/category?category=${encodeURIComponent(category)}`,
              "GET"
            )
          );
          const responses = await Promise.all(allRequests);
          responses.forEach((res) => {
            const items = (res as any)?.items || [];
            productsList.push(...items);
          });
        } else {
          const allData = await fetchSecondary("/product", "GET");
          const items = (allData as any)?.items || [];
          productsList = items;
        }

        // Filter by selected tags
        if (selectedTags.length > 0) {
          productsList = productsList.filter((product) =>
            product.tag?.some((tag: string) => selectedTags.includes(tag))
          );
        }

        // Filter by price range
        productsList = productsList.filter(
          (product) =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        setProducts(productsList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedTags, sortOption, priceRange]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      <DeliveryBanner />
      <div className="max-w-7xl mx-auto px-4 bg-[#FFF9F4] py-6">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-[#FFF4E6] p-5 rounded-xl shadow-md space-y-8">
            {/* Categories */}
            <div>
              <h2 className="text-xl font-bold text-[#F58721] mb-3">
                Categories
              </h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={`w-full text-left px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategories.length === 0
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
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full text-left px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedCategories.includes(category.name)
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

            {/* Tags */}
            <div>
              <h2 className="text-xl font-bold text-[#F58721] mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-1 rounded-full text-xs font-medium transition ${
                      selectedTags.includes(tag)
                        ? "bg-[#F58721] text-white shadow-md"
                        : "bg-white text-[#333] hover:bg-[#FFE8D1] border border-[#F58721]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range - Hidden */}
            <div className="hidden">
              <h2 className="text-xl font-bold text-[#F58721] mb-3">
                Price Range
              </h2>
              <Range
                min={0}
                max={1000}
                value={priceRange}
                onChange={(val) => setPriceRange(val as [number, number])}
                allowCross={false}
                trackStyle={[{ backgroundColor: "#F58721" }]}
                handleStyle={[
                  { borderColor: "#F58721" },
                  { borderColor: "#F58721" },
                ]}
              />
              <p className="mt-2 text-sm text-gray-700">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </p>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[#F58721]">
                Shop Your Favorite Bites
              </h1>

              {/* Sort Dropdown - Hidden */}
              <div className="hidden">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-[#F58721] rounded-full px-5 py-2 text-sm bg-white shadow-sm"
                >
                  <option value="">Sort by Price</option>
                  <option value="lowToHigh">Low to High</option>
                  <option value="highToLow">High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center mt-10 text-lg">
                No delicious items found.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
