import { notFound } from "next/navigation";
import fetchData from "@/api/fetchdata";
import SingleProduct from "@/components/Client-side-server/single-product-page/SingleProduct"
import { Product } from "@/types/Products";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = params;

  try {
    const product: Product = await fetchData("frontend/product_info/", {
      slug,
    });

    if (!product) return notFound();

      return <SingleProduct product={product} />;
      
  } catch (error) {
    return notFound();
  }
}
