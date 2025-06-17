"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/productTypes";
import fetchSecondary from "@/api/fetchSecondary";
import { Loader2 } from "lucide-react";
import Slider from "react-slick";

const FILTER_OPTIONS = [
  { label: "All Products", value: "all" },
  { label: "New Arrival", value: "new" },
  { label: "Best Selling", value: "stock" },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const fetchProducts = async (filter: string) => {
    setLoading(true);
    try {
      let data: Product[] = [];

      if (filter === "new") {
        data = await fetchSecondary<Product[]>("/product/newarrival", "GET");
      } else if (filter === "stock") {
        data = await fetchSecondary<Product[]>("/product/bestselling", "GET");
      } else {
        const response = await fetchSecondary<{ items: Product[] }>(
          "/product",
          "GET"
        );
        data = response.items;
      }

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedFilter);
  }, [selectedFilter]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="px-4 md:px-10 mt-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">
        Our Products
      </h2>

      {/* Filter Buttons */}
      <style jsx>{`
        .fill-animate {
          position: relative;
          overflow: hidden;
          z-index: 0;
        }

        .fill-animate::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: #ef4444; /* red-500 */
          z-index: -1;
          transition: width 0.5s ease;
        }

        .fill-animate.active::before {
          width: 100%;
        }
      `}</style>

      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        {FILTER_OPTIONS.map((option) => {
          const getIcon = (value: string) => {
            switch (value) {
              case "all":
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                );
              case "new":
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C9.243 2 7 4.243 7 7v2H5c-.552 0-1 .448-1 1v1h16v-1c0-.552-.448-1-1-1h-2V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v2h-6V7c0-1.654 1.346-3 3-3zM4 13v6c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-6H4z" />
                  </svg>
                );
              case "bestselling":
                return (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C9 7 13 8 13 12c0 2-2 4-2 7 0 1 1 2 1 2s-6-3-6-9c0-2 1-4 3-5.5C11 5 12 2 12 2z" />
                  </svg>
                );
              default:
                return null;
            }
          };

          return (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`relative fill-animate px-6 py-2 rounded-full text-sm font-semibold border-2 flex items-center transition-all duration-300 shadow-md ${
                selectedFilter === option.value
                  ? "text-white border-red-500 active"
                  : "text-red-500 border-red-300 hover:text-white hover:border-red-500"
              } ${selectedFilter === option.value ? "active" : ""}`}
            >
              {getIcon(option.value)}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Product Carousel */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
          </div>
        ) : products.length > 0 ? (
          <Slider {...sliderSettings}>
            {products.map((product: Product) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}
