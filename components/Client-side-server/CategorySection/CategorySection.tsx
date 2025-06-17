"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  image: string | null;
  parentId: number | null;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollX, setScrollX] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SECONDARY_API}/product/categories`
      );
      const data: Category[] = await res.json();
      const parentCategories = data.filter((cat) => cat.parentId === null);
      setCategories(parentCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const scrollLeft = () => {
    const newX = scrollX - 300;
    setScrollX(newX < 0 ? 0 : newX);
  };

  const scrollRight = () => {
    const newX = scrollX + 300;
    setScrollX(newX);
  };

  return (
    <div className="py-12 px-4 md:px-10 bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-200">
      <h2 className="text-3xl font-bold text-center text-orange-600 mb-8 tracking-wide">
        Explore Delicious Categories
      </h2>

      {loading ? (
        <div className="text-center text-orange-500 text-lg font-medium">
          Loading categories...
        </div>
      ) : (
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-orange-100"
            onClick={scrollLeft}
          >
            <ChevronLeft className="text-orange-600 w-6 h-6" />
          </button>

          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-10"
            style={{
              scrollBehavior: "smooth",
              transform: `translateX(-${scrollX}px)`,
            }}
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                className="min-w-[180px] max-w-[180px] flex-shrink-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-200 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative w-full h-32 bg-orange-50">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="text-md font-semibold text-orange-600 capitalize">
                    {category.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-orange-100"
            onClick={scrollRight}
          >
            <ChevronRight className="text-orange-600 w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
