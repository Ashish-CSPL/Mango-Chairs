"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  image: string | null;
}

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white rounded-xl shadow-lg border border-yellow-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative w-full h-40 bg-yellow-50">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-yellow-600 capitalize">
          {category.name}
        </h3>
      </div>
    </motion.div>
  );
}
