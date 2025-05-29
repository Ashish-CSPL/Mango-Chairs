// app/shop/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import fetchData from "@/api/fetchdata";
import ProductCard from "@/components/Common-Components/ProductCard";
// Removed useDebounce import as it's now internal to PriceFilter
import PriceFilter from "@/components/Common-Components/PriceFilter";
import { Product } from "@/types/singleProduct";

// Define interfaces for API response data and product structure
interface ApiResponseData {
  min_value: string;
  max_value: string;
  total_pages: number;
  current_page: number;
  page_size: number;
  products: Product[];
}

// Define type for sorting order
type SortOrder = "none" | "price_asc" | "price_desc";

// Helper function to generate pagination numbers with ellipsis
const generatePageNumbers = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const pageNumbers: (number | string)[] = [];
  const pagesBefore = 2;
  const pagesAfter = 3;

  if (totalPages === 0) {
    return [];
  }

  pageNumbers.push(1);

  let windowStart = currentPage - pagesBefore;
  let windowEnd = currentPage + pagesAfter;

  if (windowStart <= 1) {
    windowStart = 2;
    windowEnd = Math.min(totalPages - 1, 1 + pagesBefore + pagesAfter);
  }
  if (windowEnd >= totalPages) {
    windowEnd = totalPages - 1;
    windowStart = Math.max(2, totalPages - (pagesBefore + pagesAfter));
  }

  if (windowStart > 2) {
    pageNumbers.push("...");
  }

  for (let i = windowStart; i <= windowEnd; i++) {
    if (i > 1 && i < totalPages) {
      pageNumbers.push(i);
    }
  }

  if (windowEnd < totalPages - 1) {
    pageNumbers.push("...");
  }

  if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
    pageNumbers.push(totalPages);
  }

  return Array.from(new Set(pageNumbers)).sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }
    if (a === "...") return 1;
    if (b === "...") return -1;
    return 0;
  });
};

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // State for the overall min/max bounds of the slider (from API)
  // These will be passed to PriceFilter. They should be initialized to a wide range.
  const [apiMinPriceBound, setApiMinPriceBound] = useState<number>(0);
  const [apiMaxPriceBound, setApiMaxPriceBound] = useState<number>(10000);

  // State for the CURRENTLY ACTIVE filter range (updated by PriceFilter's debounced output)
  // These are the values actually used for API calls
  const [activeFilterMinPrice, setActiveFilterMinPrice] = useState<number>(0);
  const [activeFilterMaxPrice, setActiveFilterMaxPrice] =
    useState<number>(10000);

  const productsPerPage = 20;

  const getProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params: Record<string, any> = {
      page: currentPage,
      limit: productsPerPage,
    };

    if (sortOrder === "price_asc") {
      params.order_by = "selling_price";
    } else if (sortOrder === "price_desc") {
      params.order_by = "-selling_price";
    }

    // Use the activeFilter prices for API calls
    params.min_price = activeFilterMinPrice.toFixed(2);
    params.max_price = activeFilterMaxPrice.toFixed(2);

    try {
      const response: ApiResponseData = await fetchData(
        "frontend/products/",
        params
      );

      if (Array.isArray(response.products)) {
        setProducts(response.products);
        setTotalPages(
          response.total_pages ? Math.max(1, response.total_pages) : 1
        );

        // On the first successful load, update the API bounds for the slider
        // This ensures the slider's full range accurately reflects available product prices
        if (
          apiMinPriceBound === 0 &&
          apiMaxPriceBound === 10000 &&
          response.min_value &&
          response.max_value
        ) {
          const apiMin = parseFloat(response.min_value);
          const apiMax = parseFloat(response.max_value);

          const finalApiMin = isNaN(apiMin) ? 0 : apiMin;
          const finalApiMax = isNaN(apiMax) ? 10000 : apiMax;

          if (finalApiMin <= finalApiMax) {
            setApiMinPriceBound(finalApiMin);
            setApiMaxPriceBound(finalApiMax);
            // Also initialize active filter range to the full API range
            setActiveFilterMinPrice(finalApiMin);
            setActiveFilterMaxPrice(finalApiMax);
          } else {
            console.warn(
              "API returned invalid min/max price range. Using default slider bounds."
            );
          }
        }
      } else {
        setProducts([]);
        setTotalPages(1);
        setError(
          "API response did not contain a 'products' array or had an unexpected structure."
        );
      }
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(
        err.message || "Failed to load products due to a network error."
      );
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    sortOrder,
    activeFilterMinPrice, // Dependency for API call
    activeFilterMaxPrice, // Dependency for API call
    productsPerPage,
    apiMinPriceBound, // Dependency for initial bounds setting
    apiMaxPriceBound, // Dependency for initial bounds setting
  ]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Callback from PriceFilter component when its debounced range changes
  const handleDebouncedPriceRangeChange = useCallback(
    ([min, max]: [number, number]) => {
      console.log(`ShopPage received debounced price range: [${min}, ${max}]`);
      setActiveFilterMinPrice(min);
      setActiveFilterMaxPrice(max);
      setCurrentPage(1); // Reset to first page on filter change
    },
    []
  ); // useCallback to prevent unnecessary re-renders of PriceFilter

  const pagesToDisplay = generatePageNumbers(currentPage, totalPages);

  return (
    <div
      className="flex min-h-screen bg-gray-100 p-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Left Sidebar for Filters */}
      <div className="w-1/4 p-4 pr-6 bg-white shadow-md rounded-lg mr-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>

        {/* Render the PriceFilter component, passing the API bounds and the callback */}
        <PriceFilter
          initialMin={apiMinPriceBound}
          initialMax={apiMaxPriceBound}
          onDebouncedChange={handleDebouncedPriceRangeChange}
        />

        {/* Add more filter categories here if needed */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Sort By Dropdown */}
        <div className="flex justify-end mb-4 pr-4">
          <label
            htmlFor="sort-by"
            className="text-gray-700 font-medium mr-2"
            style={{ lineHeight: "38px" }}
          >
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortOrder}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
            style={{ minWidth: "150px" }}
          >
            <option value="none">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Loading, Error, No Products States */}
        {loading && (
          <div className="text-center text-gray-600 py-20">
            Loading products...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 py-20 font-bold">
            Error: {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-600 py-20">
            No products available with the current filters.
          </div>
        )}

        {/* Product Grid and Pagination (visible when products are loaded) */}
        {!loading && !error && products.length > 0 && (
          <>
            {/* Product Grid Container */}
            <div
              className="grid gap-4 justify-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                maxWidth: "calc(100% - 20px)",
                margin: "0 auto",
              }}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="flex justify-center items-center mt-8 space-x-2"
                style={{ marginBottom: "20px" }}
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className={`px-3 py-1 rounded-md transition-colors duration-200 text-sm
                    ${
                      currentPage === 1 || loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  Previous
                </button>

                {pagesToDisplay.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-1 text-gray-700">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageClick(page as number)}
                        className={`px-3 py-1 rounded-md transition-colors duration-200 text-sm
                          ${
                            (page as number) === currentPage
                              ? "bg-blue-600 text-white font-bold"
                              : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                          }`}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className={`px-3 py-1 rounded-md transition-colors duration-200 text-sm
                    ${
                      currentPage === totalPages || loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
