// app/product/[slug]/page.tsx
// This is a Server Component

import React from "react";
import fetchData from "@/api/fetchdata"; // Path to your fetchData utility
import { Product } from "@/types/Products"; // Path to your Product types
import { notFound } from "next/navigation"; // Next.js utility for 404 pages
import SingleProduct from "@/components/Client-side-server/single-product-page/SingleProduct"; // Path to your Client Component

// Define the props for this page component
interface ProductPageProps {
  params: {
    slug: string; // Next.js will automatically provide the slug from the URL (e.g., "vanilla")
  };
}

// This is an async Server Component that fetches data before rendering
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params; // Destructure the slug from the params

  // --- Debugging logs (keep these for now, they are very helpful for backend issues) ---
  console.log(
    "DEBUG: ProductPage - Received slug:",
    slug,
    "Type:",
    typeof slug
  );

  let product: Product | null = null; // Variable to hold the fetched product data
  let apiEndpoint: string = ""; // Declare apiEndpoint here, outside the try block

  try {
    // The new endpoint for fetching product info.
    // We assume it takes 'slug' as a query parameter.
    apiEndpoint = `frontend/product_info/`; // Assign value here

    console.log(
      "DEBUG: ProductPage - API endpoint for fetchData:",
      apiEndpoint
    );
    console.log("DEBUG: ProductPage - Query parameter for fetchData:", {
      slug: slug,
    });

    // Call your fetchData utility.
    // The slug is passed as a query parameter using the `queryParams` option.
    const fetchedProduct: Product = await fetchData(
      apiEndpoint,
      "GET", // HTTP method
      {
        cache: "no-store", // Ensures fresh data on every request, useful during development
        queryParams: {
          // This is where the slug is passed
          slug: slug,
        },
      }
    );

    // If a product is successfully fetched, assign it
    if (fetchedProduct) {
      product = fetchedProduct;
    } else {
      // If no product is returned, log and show Next.js's notFound page
      console.log("ProductPage: Product not found for slug:", slug);
      return notFound();
    }
  } catch (err: any) {
    // Catch any errors during fetching (e.g., network error, 404 from API)
    console.error(
      `ProductPage: Error fetching product for slug "${slug}" from ${apiEndpoint}:`, // apiEndpoint is now accessible
      err
    );
    return notFound(); // Show Next.js's notFound page on error
  }

  // If for some reason 'product' is still null after the try-catch (shouldn't happen with notFound()),
  // render the notFound page.
  if (!product) {
    console.log("ProductPage: No product data after fetch for slug:", slug);
    return notFound();
  }

  // Render the page. The actual product details display is handled by the Client Component.
  return (
    <div className="container mx-auto p-8">
      {/* Pass the fetched product data to the Client Component */}
      <SingleProduct product={product} />
    </div>
  );
}
