import { notFound } from "next/navigation";
import fetchData from "@/api/fetchdata";
import SingleProduct from "@/components/Client-side-server/single-product-page/SingleProduct";
import { Product } from "@/types/Products";

interface Props {
  params: {
    slug: string;
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = params;

  try {
    const product: Product = await fetchData("frontend/product_info", "GET", {
      slug,
    });

    if (!product) return notFound();

    return <SingleProduct product={product} />;
  } catch (error) {
    return notFound();
  }
}
