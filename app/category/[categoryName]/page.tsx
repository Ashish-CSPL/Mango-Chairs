"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";
import fetchSecondary from "@/api/fetchSecondary";
import { Product } from "@/types/productTypes";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const endpoint = `/product/category?category=${encodeURIComponent(
          categoryName as string
        )}`;

        const data = await fetchSecondary<Product[] | { items?: Product[] }>(
          endpoint,
          "GET"
        );
        const productsData = Array.isArray(data) ? data : data.items || [];
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-20 bg-[#FFF9F4]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#F58721] capitalize">
          {decodeURIComponent(categoryName as string)} Products
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-4 animate-pulse"
            >
              <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-10 text-lg">
          No products found in this category.
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
