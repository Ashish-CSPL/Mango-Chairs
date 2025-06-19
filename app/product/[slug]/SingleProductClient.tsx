"use client";

import { useState, useEffect } from "react";
import { Product, Variant, VariantImage, Category } from "@/types/productTypes";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import toast from "react-hot-toast";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/Server-side-codes/ProductSecondarySection/ProductCard";

interface Props {
  product: Product;
}

const SingleProductClient = ({ product }: Props) => {
  const dispatch = useDispatch();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const initialImage =
    selectedVariant &&
    selectedVariant.images &&
    selectedVariant.images.length > 0
      ? typeof selectedVariant.images[0] === "string"
        ? (selectedVariant.images[0] as string)
        : (selectedVariant.images[0] as VariantImage).url
      : product.image || "/default.png";

  const [mainImage, setMainImage] = useState<string>(initialImage);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [errorRelated, setErrorRelated] = useState<string | null>(null);

  const formatImageUrl = (url?: string) => {
    if (!url) return "/default.png";
    return url;
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoadingRelated(true);
      setErrorRelated(null);

      let categoryName = "";
      if (product.categories && product.categories.length > 0) {
        categoryName = product.categories[0].name;
      }

      if (!categoryName) {
        setRelatedProducts([]);
        setLoadingRelated(false);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_SECONDARY_API;

        if (!baseUrl) {
          setErrorRelated("API base URL is not configured.");
          setRelatedProducts([]);
          setLoadingRelated(false);
          return;
        }

        const apiUrl = `${baseUrl}/product/category?category=${encodeURIComponent(
          categoryName
        )}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch related products: ${response.status} - ${errorText}`
          );
        }

        const data: Product[] = await response.json();
        const filteredData = data.filter((p) => p.id !== product.id);

        setRelatedProducts(filteredData);
      } catch (error: any) {
        setErrorRelated(
          `Failed to load related products: ${error.message || "Unknown error"}`
        );
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.categories, product.image]);

  const handleAddToCart = () => {
    const variant = selectedVariant || {
      description: "Default",
      price: product.price ?? 0,
    };

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        image: formatImageUrl(mainImage),
        price: variant.Price ?? variant.price ?? product.price ?? 0,
        variant: variant.description ?? "Default",
        quantity,
      })
    );

    toast.success(`${product.name} added to cart!`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < rating ? "orange" : "none"}
          stroke={i < rating ? "orange" : "gray"}
        />
      );
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-28 mb-12 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-3/5 h-[70vh] flex flex-col md:flex-row gap-4">
          <div className="flex flex-row md:flex-col gap-3 max-h-[500px] overflow-x-auto md:overflow-y-auto pr-2 pb-2 md:pb-0">
            {product.variants?.map((variant) =>
              (variant.images || []).map((img, index) => {
                const imageUrl =
                  typeof img === "string"
                    ? img
                    : (img as VariantImage)?.url ||
                      product.image ||
                      "/default.png";

                const imageId =
                  typeof img === "string"
                    ? `${variant.id}-${index}`
                    : (img as VariantImage)?.id?.toString() ||
                      `${variant.id}-${index}`;

                return (
                  <div
                    key={imageId}
                    className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      formatImageUrl(imageUrl) === mainImage
                        ? "border-2 border-orange-500 shadow-md"
                        : "border border-gray-200 hover:border-orange-300"
                    }`}
                    onClick={() => {
                      setMainImage(imageUrl);
                      setSelectedVariant(variant);
                    }}
                  >
                    <Image
                      src={formatImageUrl(imageUrl)}
                      alt={`Variant thumbnail ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                );
              })
            )}
          </div>
          <div className="flex-1 flex items-center p-4 min-h-[350px] md:min-h-[450px] lg:min-h-[300px] rounded-lg border border-gray-200 overflow-hidden">
            <Image
              src={formatImageUrl(mainImage)}
              alt={product.name}
              width={800}
              height={400}
              className="object-cover h-full"
            />
          </div>
        </div>

        <div className="w-full lg:w-2/5 lg:mt-10 space-y-10">
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-gray-800">Category:</span>{" "}
            {product.categories && product.categories.length > 0
              ? product.categories[0].name
              : "Uncategorized"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mb-4 text-gray-600 mt-5">
            <div className="flex">{renderStars(product.rating || 4)}</div>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4 text-sm">
            {product.short_description ||
              (product.description
                ? product.description
                : "View great tasting Tropicana Orange Juice and Juice Drink Products. Featuring Tropicana Orange Juice")}
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            ₹
            {(
              selectedVariant?.Price ??
              selectedVariant?.price ??
              product.price ??
              0
            ).toFixed(2)}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-md p-1">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center border-x border-gray-300 outline-none text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-[#F6BE00] text-white px-8 py-3 rounded-md hover:bg-yellow-600 transition-colors duration-200 font-semibold w-full sm:w-auto"
            >
              <ShoppingCart size={20} />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`text-sm font-semibold px-4 py-2 ${
              activeTab === "description"
                ? "text-black border-b-2 border-orange-500"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`text-sm font-semibold px-4 py-2 ${
              activeTab === "reviews"
                ? "text-black border-b-2 border-orange-500"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews (2)
          </button>
        </div>

        {activeTab === "description" && product.description && (
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
            {product.description}
          </p>
        )}
        {activeTab === "reviews" && (
          <p className="text-gray-600 text-sm">No reviews yet.</p>
        )}
      </div>

      <div className="mt-16 md:mt-15">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8">
          RELATED PRODUCTS
        </h2>
        {loadingRelated ? (
          <p className="text-center text-gray-600">
            Loading related products...
          </p>
        ) : errorRelated ? (
          <p className="text-center text-red-500">Error: {errorRelated}</p>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="my-4">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No related products found for this category.
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleProductClient;
