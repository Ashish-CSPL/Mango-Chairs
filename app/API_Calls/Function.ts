// app/Function.ts (or wherever your data fetching functions are)
import { Product, ProductsApiResponse } from "@/types/Products";
import { Testimonial } from "@/types/testimonials"; // Assuming you have this type defined
import fetchSecondary from "../../api/fetchSecondary"; // Correct import path for fetchSecondary




// Testimonial
export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("https://nxadmin.consociate.co.in/frontend/testimonials/", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  const data = await res.json();
  console.log(data)
  return data.testimonials;

}