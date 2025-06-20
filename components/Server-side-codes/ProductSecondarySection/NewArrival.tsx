"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/productTypes";
import fetchSecondary from "@/api/fetchSecondary";
import { Loader2 } from "lucide-react";
import Slider from "react-slick";

// No FILTER_OPTIONS needed if no buttons are displayed
// const FILTER_OPTIONS = [
//   { label: "New Arrival", value: "new" },
// ];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // No longer need selectedFilter state if there are no buttons to change it
  // const [selectedFilter, setSelectedFilter] = useState<string>("new");

  const fetchNewArrivalProducts = async () => {
    // Renamed function for clarity
    setLoading(true);
    try {
      // Directly fetch new arrival products
      const data = await fetchSecondary<Product[]>(
        "/product/newarrival",
        "GET"
      );
      setProducts(data);
    } catch (error) {
      console.error("Error fetching new arrival products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivalProducts(); // Call the specific fetch function
  }, []); // Empty dependency array means it runs once on mount

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
        New Arrival Products {/* Changed heading to reflect content */}
      </h2>

      {/* Removed the <style jsx> block as it's no longer needed */}
      {/* Removed the filter buttons rendering div */}

      {/* Product Carousel */}
      <div className="max-w-screen-xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin w-8 h-8 text-[#FF9601]" />
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
          <p className="text-center text-gray-500">
            No new arrival products found.
          </p>
        )}
      </div>
    </div>
  );
}
