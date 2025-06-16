// app/product/[slug]/page.tsx

import { notFound } from "next/navigation";
import fetchSecondary from "@/api/fetchSecondary";
import SingleProductClient from "./SingleProductClient";
import { Product } from "@/types/productTypes";
import { JSX } from "react/jsx-runtime";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({
  params,
}: Props): Promise<JSX.Element> {
  const { slug } = await params;

  // Fetch product data
  const product: Product | null = await fetchSecondary(
    `/product/product_info/${slug}`,
    "GET"
  );

  if (!product) {
    return notFound();
  }

  return <SingleProductClient product={product} />;
}
