// // app/shop/page.tsx

// "use client";

// import React from "react";
// // import fetchData from "@/api/fetchdata"; // fetchData is not used here, can be removed if not used elsewhere
// import Link from "next/link";
// import { Product, ProductsApiResponse } from "@/types/Products"; // Ensure Product and ProductsApiResponse are imported
// import { useSearchParams, useRouter } from "next/navigation";

// import RangeSlider from "react-range-slider-input";
// import "react-range-slider-input/dist/style.css";
// import fetchSecondary from "@/api/fetchSecondary";

// interface ShopPageProps {
//   searchParams: {
//     page?: string;
//     page_size?: string;
//     sort?: string;
//     min_price?: string;
//     max_price?: string;
//   };
// }

// export default function ShopPage({ searchParams }: ShopPageProps) {
//   const router = useRouter();
//   const currentSearchParams = useSearchParams();

//   const currentPage = parseInt(searchParams.page || "1", 10);
//   const pageSize = parseInt(searchParams.page_size || "10", 10);
//   const currentSort = searchParams.sort || "";

//   const initialMinPrice = parseFloat(searchParams.min_price || "0");
//   const initialMaxPrice = parseFloat(searchParams.max_price || "10000");

//   const [products, setProducts] = React.useState<Product[]>([]);
//   const [totalPages, setTotalPages] = React.useState(0);
//   const [error, setError] = React.useState<string | null>(null);
//   const [loading, setLoading] = React.useState(true);
//   const [priceRange, setPriceRange] = React.useState<[number, number]>([
//     initialMinPrice,
//     initialMaxPrice,
//   ]);

//   const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

//   React.useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const queryParams: Record<string, string | number> = {
//           page: currentPage,
//           page_size: pageSize,
//         };

//         if (currentSort) {
//           queryParams.sort = currentSort;
//         }

//         if (priceRange[0] !== 0) {
//           queryParams.min_price = priceRange[0];
//         }
//         if (priceRange[1] !== 10000) {
//           queryParams.max_price = priceRange[1];
//         }

//         console.log("Fetching products with queryParams:", queryParams);

//         const data: ProductsApiResponse = await fetchSecondary(
//           "product", // Use "product" as per your API response, not "products/"
//           "GET",
//           {
//             queryParams: queryParams,
//             cache: "no-store",
//           }
//         );

//         console.log("ShopPage: Fetched raw data from API:", data);

//         // --- CORRECTED LINES HERE ---
//         if (data && Array.isArray(data.items)) {
//           // Changed from data.products to data.items
//           setProducts(data.items); // Changed from data.products to data.items
//           setTotalPages(data.totalPages); // Changed from data.total_pages to data.totalPages
//         } else {
//           console.error(
//             "ShopPage: API response for products is not in expected format (missing 'items' array or 'totalPages'):",
//             data
//           );
//           setError(
//             "API response for products is not in expected format. Check backend endpoint."
//           );
//         }
//         // --- END CORRECTED LINES ---
//       } catch (err: any) {
//         console.error("ShopPage: Failed to fetch products:", err);
//         setError(
//           err.message || "Failed to load products. Please try again later."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (debounceTimeoutRef.current) {
//       clearTimeout(debounceTimeoutRef.current);
//     }

//     debounceTimeoutRef.current = setTimeout(() => {
//       fetchProducts();
//     }, 500);
//   }, [currentPage, pageSize, currentSort, priceRange]);

//   const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSort = event.target.value;
//     const newSearchParams = new URLSearchParams(currentSearchParams.toString());
//     if (newSort) {
//       newSearchParams.set("sort", newSort);
//     } else {
//       newSearchParams.delete("sort");
//     }
//     if (priceRange[0] !== 0) {
//       newSearchParams.set("min_price", priceRange[0].toString());
//     }
//     if (priceRange[1] !== 10000) {
//       newSearchParams.set("max_price", priceRange[1].toString());
//     }
//     router.push(`/shop?${newSearchParams.toString()}`);
//   };

//   const handlePriceRangeChange = (values: [number, number]) => {
//     setPriceRange(values);
//     const newSearchParams = new URLSearchParams(currentSearchParams.toString());

//     if (values[0] !== 0) {
//       newSearchParams.set("min_price", values[0].toFixed(2));
//     } else {
//       newSearchParams.delete("min_price");
//     }

//     if (values[1] !== 10000) {
//       newSearchParams.set("max_price", values[1].toFixed(2));
//     } else {
//       newSearchParams.delete("max_price");
//     }

//     if (currentPage !== 1) {
//       newSearchParams.set("page", currentPage.toString());
//     }
//     if (pageSize !== 10) {
//       newSearchParams.set("page_size", pageSize.toString());
//     }
//     if (currentSort) {
//       newSearchParams.set("sort", currentSort);
//     }

//     router.replace(`/shop?${newSearchParams.toString()}`);
//   };

//   const getPaginationItems = (
//     currentPage: number,
//     totalPages: number,
//     range: number = 2
//   ) => {
//     const items: (number | string)[] = [];
//     const showEllipses = totalPages > 7;

//     if (!showEllipses) {
//       for (let i = 1; i <= totalPages; i++) {
//         items.push(i);
//       }
//       return items;
//     }

//     items.push(1);
//     let start = Math.max(2, currentPage - range);
//     let end = Math.min(totalPages - 1, currentPage + range);

//     if (currentPage <= range + 1) {
//       end = 2 * range + 1;
//     } else if (currentPage >= totalPages - range) {
//       start = totalPages - 2 * range;
//     }

//     if (start > 2) {
//       items.push("...");
//     }

//     for (let i = start; i <= end; i++) {
//       if (i > 1 && i < totalPages) {
//         items.push(i);
//       }
//     }

//     if (end < totalPages - 1) {
//       items.push("...");
//     }

//     if (totalPages > 1) {
//       items.push(totalPages);
//     }

//     return items.filter((value, index, self) => self.indexOf(value) === index);
//   };

//   const paginationItems = getPaginationItems(currentPage, totalPages);

//   return (
//     <div className="container mx-auto p-8 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
//         Our Products
//       </h1>

//       <div className="flex flex-col md:flex-row gap-8">
//         <aside className="w-full md:w-1/4 bg-gray-50 p-6 rounded-lg shadow-md">
//           <h2 className="text-2xl font-semibold mb-6 text-gray-800">Filters</h2>

//           <div className="mb-8">
//             <h3 className="text-lg font-medium mb-3 text-gray-700">Price</h3>
//             <div className="flex justify-between items-center mb-3 text-gray-600">
//               <span>Min: ₹{priceRange[0].toFixed(2)}</span>
//               <span>Max: ₹{priceRange[1].toFixed(2)}</span>
//             </div>
//             <RangeSlider
//               min={0}
//               max={10000}
//               step={10}
//               value={priceRange}
//               onInput={handlePriceRangeChange}
//             />
//           </div>
//         </aside>

//         <main className="w-full md:w-3/4">
//           <div className="mb-6 flex justify-end items-center">
//             <label htmlFor="sort-by" className="mr-2 text-gray-700">
//               Sort by:
//             </label>
//             <select
//               id="sort-by"
//               value={currentSort}
//               onChange={handleSortChange}
//               className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//             >
//               <option value="">Relevance</option>
//               <option value="price_asc">Price: Low to High</option>
//               <option value="price_desc">Price: High to Low</option>
//             </select>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center min-h-[50vh] text-xl text-gray-600">
//               Loading products...
//             </div>
//           ) : error ? (
//             <div className="flex justify-center items-center min-h-[50vh] text-center text-red-600 text-xl p-4 bg-red-50 rounded-lg">
//               <p>{error}</p>
//             </div>
//           ) : (
//             <>
//               {products.length === 0 ? (
//                 <div className="flex flex-col justify-center items-center min-h-[50vh] text-center text-gray-600 text-xl p-4 bg-gray-50 rounded-lg">
//                   <p>No products found.</p>
//                   <p className="mt-2 text-lg text-gray-500">
//                     Your backend API might not be returning any products, or
//                     there are no products matching filters.
//                   </p>
//                   <p className="mt-1 text-base text-gray-400">
//                     Please check your backend server logs and database.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                   {products.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))}
//                 </div>
//               )}

//               {totalPages > 1 && (
//                 <div className="flex justify-center mt-12 space-x-2 sm:space-x-4">
//                   <Link
//                     href={{
//                       pathname: "/shop",
//                       query: {
//                         page: currentPage - 1,
//                         page_size: pageSize,
//                         ...(currentSort && { sort: currentSort }),
//                         ...(priceRange[0] !== 0 && {
//                           min_price: priceRange[0].toFixed(2),
//                         }),
//                         ...(priceRange[1] !== 10000 && {
//                           max_price: priceRange[1].toFixed(2),
//                         }),
//                       },
//                     }}
//                     className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
//                       currentPage === 1
//                         ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                         : "bg-gray-700 text-white hover:bg-gray-800"
//                     }`}
//                     aria-disabled={currentPage === 1}
//                     tabIndex={currentPage === 1 ? -1 : undefined}
//                   >
//                     &lt;
//                   </Link>

//                   {paginationItems.map((item, index) =>
//                     item === "..." ? (
//                       <span
//                         key={`ellipsis-${index}`}
//                         className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 text-lg font-semibold text-gray-700 bg-gray-100 rounded-lg"
//                       >
//                         ...
//                       </span>
//                     ) : (
//                       <Link
//                         key={item}
//                         href={{
//                           pathname: "/shop",
//                           query: {
//                             page: item,
//                             page_size: pageSize,
//                             ...(currentSort && { sort: currentSort }),
//                             ...(priceRange[0] !== 0 && {
//                               min_price: priceRange[0].toFixed(2),
//                             }),
//                             ...(priceRange[1] !== 10000 && {
//                               max_price: priceRange[1].toFixed(2),
//                             }),
//                           },
//                         }}
//                         className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
//                           item === currentPage
//                             ? "bg-orange-500 text-white"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {item}
//                       </Link>
//                     )
//                   )}

//                   <Link
//                     href={{
//                       pathname: "/shop",
//                       query: {
//                         page: currentPage + 1,
//                         page_size: pageSize,
//                         ...(currentSort && { sort: currentSort }),
//                         ...(priceRange[0] !== 0 && {
//                           min_price: priceRange[0].toFixed(2),
//                         }),
//                         ...(priceRange[1] !== 10000 && {
//                           max_price: priceRange[1].toFixed(2),
//                         }),
//                       },
//                     }}
//                     className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-lg font-medium transition-colors duration-200 shadow-md ${
//                       currentPage === totalPages
//                         ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                         : "bg-gray-700 text-white hover:bg-gray-800"
//                     }`}
//                     aria-disabled={currentPage === totalPages}
//                     tabIndex={currentPage === totalPages ? -1 : undefined}
//                   >
//                     &gt;
//                   </Link>
//                 </div>
//               )}
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
