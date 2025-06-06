// app/shop/page.tsx

"use client"; // This directive makes this a client component.

import React from "react";
import fetchData from "@/api/fetchdata";
import Link from "next/link";
import { Product, ProductsApiResponse } from "@/types/Products";
import ProductCard from "@/components/Common-Components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";

// Import RangeSlider and its CSS
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css"; // Ensure you import the CSS

interface ShopPageProps {
  searchParams: {
    page?: string;
    page_size?: string;
    sort?: string;
    min_price?: string; // Add min_price to searchParams type
    max_price?: string; // Add max_price to searchParams type
  };
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const currentPage = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.page_size || "10", 10);
  const currentSort = searchParams.sort || "";

  // State for price range, initialized from URL search params or defaults
  const initialMinPrice = parseFloat(searchParams.min_price || "0");
  const initialMaxPrice = parseFloat(searchParams.max_price || "10000"); // Assuming a max price of 10000 for demonstration

  const [products, setProducts] = React.useState<Product[]>([]);
  const [totalPages, setTotalPages] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    initialMinPrice,
    initialMaxPrice,
  ]);

  // Use a ref to prevent immediate API calls on slider drag
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct query parameters including price range
        const queryParams: Record<string, string | number> = {
          page: currentPage,
          page_size: pageSize,
        };

        if (currentSort) {
          queryParams.sort = currentSort;
        }

        // Add min_price and max_price if they are not the initial default values
        // This prevents sending redundant params when slider is at its min/max
        if (priceRange[0] !== 0) {
          queryParams.min_price = priceRange[0];
        }
        if (priceRange[1] !== 10000) {
          // Compare with the max value set for the slider
          queryParams.max_price = priceRange[1];
        }

        console.log("Fetching products with queryParams:", queryParams);

        const data: ProductsApiResponse = await fetchData(
          "/frontend/products/", // Base endpoint
          "GET",
          {
            queryParams: queryParams,
            cache: "no-store",
          }
        );

        console.log("ShopPage: Fetched raw data from API:", data);

        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalPages(data.total_pages);
        } else {
          console.error(
            "ShopPage: API response for products is not in expected format:",
            data
          );
          setError(
            "API response for products is not in expected format. Check backend endpoint."
          );
        }
      } catch (err: any) {
        console.error("ShopPage: Failed to fetch products:", err);
        setError(
          err.message || "Failed to load products. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout to fetch products after a delay (e.g., 500ms)
    // This prevents excessive API calls while the user is dragging the slider
    debounceTimeoutRef.current = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce time in milliseconds
  }, [currentPage, pageSize, currentSort, priceRange]); // Dependencies: re-run effect if these change

  // Function to handle sort change from the dropdown
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = event.target.value;
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());
    if (newSort) {
      newSearchParams.set("sort", newSort);
    } else {
      newSearchParams.delete("sort");
    }
    // Ensure existing price filters are maintained when sorting
    if (priceRange[0] !== 0) {
      newSearchParams.set("min_price", priceRange[0].toString());
    }
    if (priceRange[1] !== 10000) {
      newSearchParams.set("max_price", priceRange[1].toString());
    }
    router.push(`/shop?${newSearchParams.toString()}`);
  };

  // Function to handle price range changes from the slider
  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRange(values);
    // Update URL search parameters immediately on change
    const newSearchParams = new URLSearchParams(currentSearchParams.toString());

    // Only set if not default values
    if (values[0] !== 0) {
      newSearchParams.set("min_price", values[0].toFixed(2)); // Format to 2 decimal places
    } else {
      newSearchParams.delete("min_price");
    }

    if (values[1] !== 10000) {
      newSearchParams.set("max_price", values[1].toFixed(2)); // Format to 2 decimal places
    } else {
      newSearchParams.delete("max_price");
    }

    // Keep other parameters like page, page_size, sort
    if (currentPage !== 1) {
      newSearchParams.set("page", currentPage.toString());
    }
    if (pageSize !== 10) {
      newSearchParams.set("page_size", pageSize.toString());
    }
    if (currentSort) {
      newSearchParams.set("sort", currentSort);
    }

    // This will trigger the useEffect to refetch products
    router.replace(`/shop?${newSearchParams.toString()}`);
  };

  // --- Pagination Logic (remains consistent) ---
  const getPaginationItems = (
    currentPage: number,
    totalPages: number,
    range: number = 2
  ) => {
    const items: (number | string)[] = [];
    const showEllipses = totalPages > 7;

    if (!showEllipses) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
      return items;
    }

    items.push(1);
    let start = Math.max(2, currentPage - range);
    let end = Math.min(totalPages - 1, currentPage + range);

    if (currentPage <= range + 1) {
      end = 2 * range + 1;
    } else if (currentPage >= totalPages - range) {
      start = totalPages - 2 * range;
    }

    if (start > 2) {
      items.push("...");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        items.push(i);
      }
    }

    if (end < totalPages - 1) {
      items.push("...");
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items.filter((value, index, self) => self.indexOf(value) === index);
  };

  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Our Products
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar for Filters */}
        <aside className="w-full md:w-1/4 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Filters</h2>

          {/* Price Range Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Price</h3>
            <div className="flex justify-between items-center mb-3 text-gray-600">
              <span>Min: ${priceRange[0].toFixed(2)}</span>
              <span>Max: ${priceRange[1].toFixed(2)}</span>
            </div>
            <RangeSlider
              min={0} // Minimum possible price
              max={10000} // Maximum possible price (adjust based on your product data)
              step={10} // Increment step for the slider
              value={priceRange}
              onInput={handlePriceRangeChange} // Use onInput for continuous updates
            />
          </div>

          {/* Other filters can go here */}
          {/* Example: Category Filter */}
          {/* <div className="mb-8">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Category</h3>
            <ul className="space-y-2">
              <li><Link href="/shop?category=electronics" className="text-blue-600 hover:underline">Electronics</Link></li>
              <li><Link href="/shop?category=apparel" className="text-blue-600 hover:underline">Apparel</Link></li>
            </ul>
          </div> */}
        </aside>

        {/* Right Section for Products and Sort/Pagination */}
        <main className="w-full md:w-3/4">
          {/* Sort Controls */}
          <div className="mb-6 flex justify-end items-center">
            <label htmlFor="sort-by" className="mr-2 text-gray-700">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={currentSort}
              onChange={handleSortChange}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh] text-xl text-gray-600">
              Loading products...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[50vh] text-center text-red-600 text-xl p-4 bg-red-50 rounded-lg">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="flex flex-col justify-center items-center min-h-[50vh] text-center text-gray-600 text-xl p-4 bg-gray-50 rounded-lg">
                  <p>No products found.</p>
                  <p className="mt-2 text-lg text-gray-500">
                    Your backend API might not be returning any products, or
                    there are no products matching filters.
                  </p>
                  <p className="mt-1 text-base text-gray-400">
                    Please check your backend server logs and database.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12 space-x-2 sm:space-x-4">
                  {/* Previous Button */}
                  <Link
                    href={{
                      pathname: "/shop",
                      query: {
                        page: currentPage - 1,
                        page_size: pageSize,
                        ...(currentSort && { sort: currentSort }),
                        ...(priceRange[0] !== 0 && {
                          min_price: priceRange[0].toFixed(2),
                        }),
                        ...(priceRange[1] !== 10000 && {
                          max_price: priceRange[1].toFixed(2),
                        }),
                      },
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
                          query: {
                            page: item,
                            page_size: pageSize,
                            ...(currentSort && { sort: currentSort }),
                            ...(priceRange[0] !== 0 && {
                              min_price: priceRange[0].toFixed(2),
                            }),
                            ...(priceRange[1] !== 10000 && {
                              max_price: priceRange[1].toFixed(2),
                            }),
                          },
                        }}
                        className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
                          item === currentPage
                            ? "bg-orange-500 text-white"
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
                      query: {
                        page: currentPage + 1,
                        page_size: pageSize,
                        ...(currentSort && { sort: currentSort }),
                        ...(priceRange[0] !== 0 && {
                          min_price: priceRange[0].toFixed(2),
                        }),
                        ...(priceRange[1] !== 10000 && {
                          max_price: priceRange[1].toFixed(2),
                        }),
                      },
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
        </main>
      </div>
    </div>
  );
}
