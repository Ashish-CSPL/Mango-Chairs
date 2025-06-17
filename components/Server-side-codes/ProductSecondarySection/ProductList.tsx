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
      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedFilter(option.value)}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              selectedFilter === option.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {option.label}
          </button>
        ))}
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
