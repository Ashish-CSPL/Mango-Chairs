"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import fetchSecondary from "@/api/fetchSecondary";

interface Category {
  id: number;
  name: string;
  image: string | null;
  productCount?: number;
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchSecondary<Category[]>(
          "/product/categories",
          "GET"
        );
        const enriched = data.map((cat) => ({
          ...cat,
          productCount: Math.floor(Math.random() * 40 + 1),
        }));
        setCategories(enriched);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="py-5 my-4 px-4 bg-zinc-100">
      <div className="max-w-7xl mx-auto">
        <Slider {...settings}>
          {categories.map((category) => (
            <div key={category.id} className="px-3">
              <div className="flex flex-col items-center text-center space-y-3">
                {/* Perfectly filled round image */}
                <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-full bg-gray-100 overflow-hidden">
                  <Image
                    src={
                      category.image ||
                      "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                    }
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Category Name */}
                <h3 className="text-sm md:text-base font-semibold text-black">
                  {category.name}
                </h3>

                {/* Product Count */}
                <p className="text-xs md:text-sm text-gray-500">
                  {category.productCount} products
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
