"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import fetchSecondary from "@/api/fetchSecondary";
import { Product } from "@/types/productTypes";
import Slider from "react-slick"; // Import Slider component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Category {
  id: number;
  name: string;
}

const ALL_PRODUCTS_CATEGORY_KEY = "all-products-display"; // Special key for "All Day Snacks"

export default function CategoryProductDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>(
    ALL_PRODUCTS_CATEGORY_KEY
  );

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
        let endpoint: string;
        if (activeCategory === ALL_PRODUCTS_CATEGORY_KEY) {
          endpoint = "/product";
        } else {
          endpoint = `/product/category?category=${encodeURIComponent(
            activeCategory
          )}`;
        }

        const data = (await fetchSecondary(endpoint, "GET")) as
          | { items?: Product[] }
          | Product[];

        const extracted = Array.isArray(data) ? data : data.items || [];
        setProducts(extracted);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [activeCategory]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
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
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: products.length > 3,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: products.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: products.length > 1,
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: products.length > 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <>
      <h1
        className="text-2xl md:text-[48px] my-8 text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        Trending Products
      </h1>
      <div className="flex px-4 md:px-12 py-8 h-[80vh] bg-white">
        {/* Sidebar Categories */}
        <div className="w-60 flex-shrink-0 bg-white rounded-lg border border-gray-200 mr-8 py-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center px-4 mb-2">
            Categories
          </h2>
          <nav>
            <ul>
              <li className="mb-1">
                <button
                  onClick={() => (
                    handleCategoryClick(ALL_PRODUCTS_CATEGORY_KEY),
                    setProducts([])
                  )}
                  className={`w-full text-left px-4 py-2 rounded-l-lg transition-colors duration-200
                    ${
                      activeCategory === ALL_PRODUCTS_CATEGORY_KEY
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
                    className={`w-full text-left px-4 py-2 rounded-l-lg transition-colors duration-200
                      ${
                        activeCategory === category.name
                          ? "bg-[#f58721] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Product Display or Loader */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-24 h-24 animate-spin-slow">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1404/1404945.png"
                  alt="Loading full pizza..."
                  className="w-full h-full object-contain"
                />
              </div>
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
              No products found for this category.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
