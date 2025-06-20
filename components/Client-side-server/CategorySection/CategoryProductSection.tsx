"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import fetchSecondary from "@/api/fetchSecondary";
import { Product, ProductsApiResponse } from "@/types/productTypes";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Category {
  id: number;
  name: string;
}

const ALL_PRODUCTS_CATEGORY_KEY = "all-products-display";

export default function CategoryProductDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([
    ALL_PRODUCTS_CATEGORY_KEY,
  ]);

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

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        let productsList: Product[] = [];

        if (activeCategories.includes(ALL_PRODUCTS_CATEGORY_KEY)) {
          const allData = await fetchSecondary<Product[] | ProductsApiResponse>(
            "/product",
            "GET"
          );
          productsList = Array.isArray(allData) ? allData : allData.items || [];
        } else {
          const allRequests = activeCategories.map((category) =>
            fetchSecondary<Product[] | ProductsApiResponse>(
              `/product/category?category=${encodeURIComponent(category)}`,
              "GET"
            )
          );
          const responses = await Promise.all(allRequests);
          responses.forEach((res) => {
            const items = Array.isArray(res) ? res : res.items || [];
            productsList.push(...items);
          });
        }

        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeCategories.length > 0) {
      fetchCategoryProducts();
    }
  }, [activeCategories]);

  const handleCategoryClick = (category: string) => {
    if (category === ALL_PRODUCTS_CATEGORY_KEY) {
      setActiveCategories([ALL_PRODUCTS_CATEGORY_KEY]);
    } else {
      setActiveCategories((prev) => {
        const updated = prev.includes(category)
          ? prev.filter((cat) => cat !== category)
          : [
              ...prev.filter((cat) => cat !== ALL_PRODUCTS_CATEGORY_KEY),
              category,
            ];
        return updated;
      });
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: products.length > 3,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <>
      <h1 className="text-2xl md:text-[48px] my-8 text-center font-playfair text-[#3E3E3E]">
        Trending Products
      </h1>

      {/* Mobile Category Tabs */}
      <div className="lg:hidden flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
        <button
          onClick={() => handleCategoryClick(ALL_PRODUCTS_CATEGORY_KEY)}
          className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
            activeCategories.includes(ALL_PRODUCTS_CATEGORY_KEY)
              ? "bg-[#f58721] text-white"
              : "border-gray-300 text-gray-700"
          }`}
        >
          All Day Snacks
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
              activeCategories.includes(category.name)
                ? "bg-[#f58721] text-white"
                : "border-gray-300 text-gray-700"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Sidebar + Product Display */}
      <div className="flex flex-col lg:flex-row px-4 md:px-12 py-8 bg-white gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0 bg-white rounded-lg border border-gray-200 py-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center px-4 mb-2">
            Categories
          </h2>
          <ul>
            <li className="mb-1">
              <button
                onClick={() => handleCategoryClick(ALL_PRODUCTS_CATEGORY_KEY)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeCategories.includes(ALL_PRODUCTS_CATEGORY_KEY)
                    ? "bg-[#f58721] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                All Day Snacks
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id} className="mb-1">
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeCategories.includes(category.name)
                      ? "bg-[#f58721] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Slider */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[300px] space-y-4 text-center text-gray-600">
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
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <div key={product.id} className="px-2 py-4">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No products found for these categories.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
