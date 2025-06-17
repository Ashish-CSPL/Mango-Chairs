"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import fetchSecondary from "@/api/fetchSecondary";

interface Category {
  id: number;
  name: string;
  image: string | null;
  productCount?: number; // optional, can be mocked
}

const bgColors = [
  "bg-pink-600",
  "bg-yellow-400",
  "bg-green-600",
  "bg-red-600",
  "bg-blue-500",
];

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchSecondary<Category[]>(
          "/product/categories",
          "GET"
        );
        // Mock productCount for demo
        const enriched = data.map((cat, i) => ({
          ...cat,
          productCount: Math.floor(Math.random() * 20 + 1),
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
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="py-12 px-2 md:px-0">
      <div className="max-w-7xl mx-auto">
        <Slider {...settings}>
          {categories.map((category, index) => (
            <div key={category.id} className="px-3">
              <div
                className={`flex justify-between items-center rounded-xl h-40 px-6 ${
                  bgColors[index % bgColors.length]
                }`}
              >
                <div className="text-white flex flex-col justify-center">
                  <h3 className="text-lg md:text-xl font-bold uppercase">
                    {category.name}
                  </h3>
                  <p className="text-sm md:text-base">
                    {category.productCount} products
                  </p>
                </div>

                <div className="relative w-24 h-24 md:w-30 md:h-30">
                  <Image
                    src={
                      category.image ||
                      "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                    }
                    alt={category.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
