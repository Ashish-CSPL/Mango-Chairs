"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import { Product } from "@/types/productTypes";
import fetchSecondary from "@/api/fetchSecondary";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function NewArrival() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNewArrivalProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchSecondary<{ items: Product[] }>(
        "/product",
        "GET"
      );

      const filteredProducts = data?.items?.filter(
        (item) => item.is_new_arrival === true
      );

      setProducts(filteredProducts || []);
    } catch (error) {
      console.error("Error fetching new arrival products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewArrivalProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="px-4 md:px-10 mt-10 bg-[#FFF9F4] py-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">
        New Arrival Products
      </h2>

      <div className="max-w-screen-xl mx-auto">
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
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center text-gray-500 mt-10 text-lg">
            No new arrival products found.
          </p>
        )}
      </div>
    </div>
  );
}
