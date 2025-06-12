// app/components/Server-side-codes/ProductSectionSecondary/ProductList.tsx
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "./ProductCard";

interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

interface Variant {
  id: number;
  description: string;
  specification: {
    type: string;
  };
  Price: number;
  stock: number;
  productId: number;
  images: VariantImage[];
}

interface Product {
  id: number;
  name: string;
  slug: string; // ✅ Add this line
  price: number;
  image: string;
  description: string;
  variants: Variant[];
}

interface APIResponse {
  page: number;
  totalPages: number;
  totalItems: number;
  items: Product[];
}

const ProductList = async () => {
  const data: APIResponse = await fetchSecondary("/product", "GET");

  return (
    <div className="px-4 md:px-10 mt-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">
        Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
