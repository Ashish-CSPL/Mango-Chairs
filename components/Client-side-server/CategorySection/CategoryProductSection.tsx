// CategoryProductDisplay.tsx

"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import fetchSecondary from "@/api/fetchSecondary";
import { Product } from "@/types/productTypes";
import { Loader2 } from "lucide-react"; // Import Loader2 icon
import Slider from "react-slick"; // Import Slider component
import "slick-carousel/slick/slick.css"; // Import slick carousel core CSS
import "slick-carousel/slick/slick-theme.css"; // Import slick carousel theme CSS

interface Category {
  id: number;
  name: string;
}

const ALL_PRODUCTS_CATEGORY_KEY = "all-products-display"; // Special key for "All Day Snacks"

export default function CategoryProductDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [activeCategory, setActiveCategory] = useState<string>(
    ALL_PRODUCTS_CATEGORY_KEY
  );

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

  // Fetch products based on activeCategory
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true); // Set loading to true before fetching products
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
        setProducts([]); // Clear products on error
      } finally {
        setLoading(false); // Set loading to false after fetch completes (success or error)
      }
    };

    fetchCategoryProducts();
  }, [activeCategory]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true, // Show navigation dots
    infinite: products.length > 3, // Only enable infinite loop if more than 3 products
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 3, // Show 3 products per row by default
    slidesToScroll: 1, // Scroll one slide at a time
    arrows: false, // Hide default arrows, rely on dots
    responsive: [
      {
        breakpoint: 1280, // xl breakpoint
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: products.length > 3,
          dots: true,
        },
      },
      {
        breakpoint: 1024, // lg breakpoint (e.g., smaller desktops/laptops)
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: products.length > 2,
          dots: true,
        },
      },
      {
        breakpoint: 768, // md breakpoint (e.g., tablets)
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: products.length > 1,
          dots: true,
        },
      },
      {
        breakpoint: 640, // sm breakpoint (e.g., mobile)
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
      <div className="flex px-4 md:px-12 py-8 min-h-screen bg-white">
        {/* Sidebar Categories */}
        <div className="w-56 flex-shrink-0 bg-white rounded-lg shadow-md mr-8 py-4">
          <h2 className="text-lg font-semibold text-gray-800 px-4 mb-2">
            Categories
          </h2>
          <nav>
            <ul>
              {/* "All Day Snacks" button, now linked to the special key */}
              <li className="mb-1">
                <button
                  onClick={() => (
                    handleCategoryClick(ALL_PRODUCTS_CATEGORY_KEY),
                    setProducts([])
                  )}
                  className={`w-full text-left px-4 py-2 rounded-l-lg transition-colors duration-200
                    ${
                      activeCategory === ALL_PRODUCTS_CATEGORY_KEY
                        ? "bg-[#734f2d] text-white"
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
                          ? "bg-[#734f2d] text-white"
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
        {/* Product Carousel/Display Area */}
        <div className="flex-1 overflow-hidden">
          {" "}
          {/* Added overflow-hidden for slider */}
          {loading ? (
            // Loader component
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin w-10 h-10 text-[#734f2d]" />
            </div>
          ) : products.length > 0 ? (
            // Products displayed in a Slider
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <div key={product.id} className="px-2 py-4">
                  {" "}
                  {/* Added horizontal padding */}
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          ) : (
            // No products found message
            <p className="text-center text-gray-500 py-10">
              No products found for this category.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
