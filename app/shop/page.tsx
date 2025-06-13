// app/shop/page.tsx
import { Product } from "@/types/Products";
import fetchSecondary from "@/api/fetchSecondary";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";

export default async function ShopPage() {
  let products: Product[] = [];

  try {
    const data = await fetchSecondary<{ items: Product[] }>("/product", "GET");
    products = data.items;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Shop All Products</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products found.</p>
      )}
    </div>
  );
}
