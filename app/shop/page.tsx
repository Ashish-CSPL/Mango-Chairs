"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/Products";
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DeliveryBanner from "@/components/Client-side-server/DeliveryBanner/DeliveryBanner";

interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const availableTags = [
    "Snack",
    "Paneer",
    "Popular",
    "Sweet",
    "Pizza",
    "Nonveg",
  ];

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
            const data = res as Product[] | { items?: Product[] };
            const items = Array.isArray(data) ? data : data.items || [];
            productsList.push(...items);
          });
        } else if (selectedTags.length > 0) {
          const tagsQuery = selectedTags.join(",");
          const res = await fetchSecondary<{ items: Product[] }>(
            `/product/by-tags/`,
            "GET",
            {
              queryParams: { tags: tagsQuery },
            }
          );
          productsList = res.items;
        } else {
          const allData = await fetchSecondary<
            Product[] | { items?: Product[] }
          >("/product", "GET");
          productsList = Array.isArray(allData) ? allData : allData.items || [];
        }

        setProducts(productsList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedTags, sortOption]);

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

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <DeliveryBanner />
      <div className="max-w-7xl mx-auto px-4 bg-[#FFF9F4]">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Sidebar */}
          <div className="w-full md:w-1/4 bg-[#FFF4E6] p-5 rounded-xl shadow-md space-y-6">
            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold text-[#F58721] mb-4 border-b-2 border-[#F58721] pb-2">
                Categories
              </h2>

              {/* Mobile slider for categories */}
              <div className="block md:hidden">
                <Slider {...sliderSettings}>
                  {categories.map((category) => (
                    <div key={category.id} className="px-1">
                      <button
                        onClick={() => handleCategoryClick(category.name)}
                        className={`w-full whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition ${
                          selectedCategories.includes(category.name)
                            ? "bg-[#F58721] text-white shadow-md"
                            : "bg-white text-[#333] hover:bg-[#FFE8D1] border border-[#F58721]"
                        }`}
                      >
                        {category.name}
                      </button>
                    </div>
                  ))}
                </Slider>
              </div>

              {/* Desktop list for categories */}
              <ul className="hidden md:block space-y-3 mt-4">
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
              <h2 className="text-2xl font-bold text-[#F58721] mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
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

            {/* Loader or Product List */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse space-y-4 p-4 bg-white rounded-2xl shadow-md border border-gray-200"
                  >
                    <div className="w-full h-48 bg-gray-200 rounded-xl shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 shimmer"></div>
                    <div className="flex justify-end">
                      <div className="w-8 h-8 bg-gray-200 rounded-full shimmer"></div>
                    </div>
                  </div>
                ))}
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
    </>
  );
};

export default ShopPage;
