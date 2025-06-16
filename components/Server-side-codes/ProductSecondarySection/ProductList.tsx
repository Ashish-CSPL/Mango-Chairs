// app/components/Server-side-codes/ProductSectionSecondary/ProductList.tsx

import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "./ProductCard";
import { ProductsApiResponse, Product } from "@/types/productTypes";

const ProductList = async () => {
  const data: ProductsApiResponse = await fetchSecondary("/product", "GET");

  return (
    <div className="px-4 md:px-10 mt-10">
      <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-800">
        Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
