import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  title: string;
  image: string;
}

interface CategoryDropdownProps {
  categories: Category[];
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ categories }) => {
  const getImageUrl = (path: string) => {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://nxadmin.consociate.co.in";
    return path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${BASE_URL}${path}`;
  };

  return (
    <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 z-50 w-[50vw] max-w-2xl bg-white/30 backdrop-blur-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl">
      {categories?.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          className="flex items-center gap-3 hover:text-orange-500"
        >
          <div className="w-26 h-26 relative">
            <Image
              src={getImageUrl(cat.image)}
              alt={cat.title}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <p className="text-sm font-semibold">{cat.title}</p>
        </Link>
      ))}
    </div>
  );
};

export default CategoryDropdown;
