import fetchSecondary from "@/api/fetchSecondary";
import { notFound } from "next/navigation";
import SingleProductClient from "./SingleProductClient";
import { Product } from "@/types/productTypes";

interface ProductPageProps {
  params: { slug: string };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const product: Product = await fetchSecondary(
    `/product/product_info/${params.slug}`,
    "GET"
  );

  if (!product) return notFound();

  return <SingleProductClient product={product} />;
};

export default ProductPage;
