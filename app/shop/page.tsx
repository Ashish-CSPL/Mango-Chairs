// app/shop/page.tsx

import React from "react";
import fetchData from "@/api/fetchdata";
import Link from "next/link";
import { Product, ProductsApiResponse } from "@/types/Products";
import ProductCard from "@/components/Common-Components/ProductCard";

export const metadata = {
  title: "Our Shop - NextGen Store",
  description:
    "Browse our collection of high-quality products and find what you need.",
};

interface ShopPageProps {
  searchParams: {
    page?: string;
    page_size?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.page_size || "10", 10);

  let products: Product[] = [];
  let totalPages = 0;
  let error: string | null = null;

  try {
    console.log(
      `ShopPage: Attempting to fetch products for page ${currentPage}, page_size ${pageSize}`
    );

    const data: ProductsApiResponse = await fetchData(
      "frontend/products/",
      "GET",
      {
        // FIX IS HERE: Changed 'params' to 'queryParams'
        queryParams: {
          page: currentPage,
          page_size: pageSize,
        },
        // Ensure cache control is appropriate for dynamic data
        cache: "no-store",
      }
    );

    console.log("ShopPage: Fetched raw data from API:", data);

    if (data && Array.isArray(data.products)) {
      products = data.products;
      totalPages = data.total_pages; // Get total_pages directly from API
    } else {
      console.error(
        "ShopPage: API response for products is not in expected format:",
        data
      );
      error =
        "API response for products is not in expected format. Check backend endpoint.";
    }

    console.log(
      "ShopPage: Extracted products for rendering:",
      products.length,
      "items found."
    );
  } catch (err: any) {
    console.error("ShopPage: Failed to fetch products:", err);
    error = err.message || "Failed to load products. Please try again later.";
  }

  // --- New Pagination Logic ---
  const getPaginationItems = (
    currentPage: number,
    totalPages: number,
    range: number = 2 // Number of pages to show around the current page
  ) => {
    const items: (number | string)[] = [];
    const showEllipses = totalPages > 7; // Adjust this threshold as needed

    if (!showEllipses) {
      // If few pages, show all
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
      return items;
    }

    // Always show first page
    items.push(1);

    // Calculate start and end for the main range
    let start = Math.max(2, currentPage - range);
    let end = Math.min(totalPages - 1, currentPage + range);

    // Adjust start and end if current page is near boundaries
    if (currentPage <= range + 1) {
      end = 2 * range + 1; // Show more pages at the beginning
    } else if (currentPage >= totalPages - range) {
      start = totalPages - 2 * range; // Show more pages at the end
    }

    // Add first ellipsis if needed
    if (start > 2) {
      items.push("...");
    }

    // Add pages in the main range
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        // Ensure not to duplicate first/last page
        items.push(i);
      }
    }

    // Add second ellipsis if needed
    if (end < totalPages - 1) {
      items.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      // Only add if there's more than 1 page
      items.push(totalPages);
    }

    // Filter out duplicates (e.g., if totalPages is small and ellipses calculation overlaps)
    // This simple filter ensures uniqueness and maintains order.
    return items.filter((value, index, self) => self.indexOf(value) === index);
  };

  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Our Products
      </h1>

      {error ? (
        <div className="flex justify-center items-center min-h-[50vh] text-center text-red-600 text-xl p-4 bg-red-50 rounded-lg">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="flex flex-col justify-center items-center min-h-[50vh] text-center text-gray-600 text-xl p-4 bg-gray-50 rounded-lg">
              <p>No products found.</p>
              <p className="mt-2 text-lg text-gray-500">
                Your backend API might not be returning any products, or there
                are no products matching filters.
              </p>
              <p className="mt-1 text-base text-gray-400">
                Please check your backend server logs and database.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls - UPDATED */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2 sm:space-x-4">
              {/* Previous Button */}
              <Link
                href={{
                  pathname: "/shop",
                  query: { page: currentPage - 1, page_size: pageSize },
                }}
                className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-gray-800"
                }`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
              >
                &lt;
              </Link>

              {/* Page Number and Ellipses */}
              {paginationItems.map((item, index) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 text-lg font-semibold text-gray-700 bg-gray-100 rounded-lg"
                  >
                    ...
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={{
                      pathname: "/shop",
                      query: { page: item, page_size: pageSize },
                    }}
                    className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
                      item === currentPage
                        ? "bg-orange-500 text-white" // Highlight current page
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}

              {/* Next Button */}
              <Link
                href={{
                  pathname: "/shop",
                  query: { page: currentPage + 1, page_size: pageSize },
                }}
                className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-gray-800"
                }`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : undefined}
              >
                &gt;
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
