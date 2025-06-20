// components/Navbar/Navbar.server.tsx
import React from "react";
// Ensure this path is correct for your NavbarClient component
import NavbarClient from "@/components/Client-side-server/Navbar/components/NavbarClient";
import CouponBanner from "@/components/Server-side-codes/CouponBanner/CouponBanner";

interface NavbarProps {
  // REMOVED: headerEndpoint is no longer needed as navData is hardcoded in client.
  // headerEndpoint: string;
  // REMOVED: categoryEndpoint is no longer needed as categories are not fetched from API
  // categoryEndpoint: string;
}

// REMOVED: fetchCategoriesFromApi function is no longer needed
// async function fetchCategoriesFromApi(endpoint: string) {
//   try {
//     const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
//     if (!baseUrl) {
//       console.error(
//         "NEXT_PUBLIC_API_BASE_URL is not defined in environment variables."
//       );
//       return [];
//     }

//     const apiUrl = `${baseUrl}${endpoint}`;
//     console.log("Fetching categories from:", apiUrl); // Log the URL for debugging

//     const res = await fetch(apiUrl, {
//       next: { revalidate: 3600 }, // Example: Revalidate data every hour
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error(
//         `Failed to fetch categories: ${res.status} ${res.statusText}`,
//         errorText
//       );
//       return []; // Return empty array on error
//     }

//     const data = await res.json();
//     console.log("Categories fetched successfully:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return []; // Return empty array on network/parsing error
//   }
// }

const Navbar = async (/* REMOVED: { categoryEndpoint }: NavbarProps */) => {
  // REMOVED: navData is no longer fetched here. It's now hardcoded in NavbarClient.
  // const headerResponse: any = await fetchData(headerEndpoint);
  // const navData = (headerResponse as any)?.headers || [];

  // REMOVED: Categories are no longer fetched from API
  // const categories = await fetchCategoriesFromApi(categoryEndpoint);

  return (
    <>
      <CouponBanner />
      {/* Categories prop is no longer passed as it's not fetched */}
      <NavbarClient /* categories={categories} */ />
    </>
  );
};

export default Navbar;
