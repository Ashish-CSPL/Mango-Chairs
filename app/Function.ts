// Assuming this file is located at, for example, lib/api.ts or services/data.ts

// Import Product from your unified product types file
import { Product } from "@/types/Products";
// Import Testimonial from its dedicated file
import { Testimonial } from "@/types/testimonials";

// No Category import is needed here unless you're using it in these functions
// If you do, it would be: import { Category } from "@/types/category";

export async function fetchNewArrivals(): Promise<Product[]> {
  try {
    const res = await fetch(
      `https://nxadmin.consociate.co.in/frontend/products/?new_arrival=true`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch new arrival products");
    }

    const data = await res.json();
    return data.products || []; // Adjust according to your actual API response
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

// All products

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `https://nxadmin.consociate.co.in/frontend/products/?page=1&page_size=1000`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch All products Data`);
    }
    const data = await res.json();
    return data.products || []; // Adjust according to your actual API response
  } catch (error) {
    console.error("Error fetching All Products data", error);
    return [];
  }
}

// Testimonial

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("https://nxadmin.consociate.co.in/frontend/testimonials/", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  const data = await res.json();
  return data.testimonials;
}