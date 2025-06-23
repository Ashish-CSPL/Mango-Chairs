"use client";

import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { Product, Variant } from "@/types/productTypes";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import { useState, useEffect } from "react";
import Slider from "react-slick";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [mainImage, setMainImage] = useState<string>(
    product.image || "/default.png"
  );

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);

      const defaultImg =
        firstVariant?.images?.[0] &&
        (typeof firstVariant.images[0] === "string"
          ? firstVariant.images[0]
          : typeof firstVariant.images[0] === "object" &&
            "url" in firstVariant.images[0]
          ? (firstVariant.images[0] as { url: string }).url
          : null);

      if (defaultImg) setMainImage(defaultImg);
    } else {
      setSelectedVariant(null);
      setMainImage(product.image || "/default.png");
    }
  }, [product]);

  const handleVariantImageClick = (img: string) => {
    setMainImage(img);
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      title: selectedVariant?.description || product.name,
      image: mainImage,
      price: selectedVariant?.Price || product.price,
      quantity: 1,
      isRare: false,
      regularPrice: product.price,
      isOnSale: selectedVariant?.Price
        ? selectedVariant.Price < product.price
        : false,
      selectedVariantId: selectedVariant?.id,
      stock: selectedVariant?.stock || 0,
      variant: selectedVariant?.description || "",
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  const VegIcon = () => (
    <svg viewBox="0 0 30 30" width="20" height="20" fill="none">
      <rect
        x="0"
        y="0"
        width="30"
        height="30"
        fill="none"
        stroke="#008000"
        strokeWidth="2"
      />
      <circle cx="15" cy="15" r="7" fill="#008000" />
    </svg>
  );

  const NonVegIcon = () => (
    <svg viewBox="0 0 30 30" width="20" height="20" fill="none">
      <rect
        x="0"
        y="0"
        width="30"
        height="30"
        fill="none"
        stroke="#FF0000"
        strokeWidth="2"
      />
      <circle cx="15" cy="15" r="7" fill="#FF0000" />
    </svg>
  );

  const variantImages: string[] = [
    ...new Set(
      product.variants?.flatMap((variant) =>
        (variant.images || []).map((img) => {
          if (typeof img === "string") return img;
          if (typeof img === "object" && "url" in img) return img.url;
          return "/default.png";
        })
      ) || []
    ),
  ];

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full my-4 max-w-sm mx-auto hover:shadow-2xl transition duration-300 ease-in-out box-border">
      <Link href={`/product/${product.slug}`}>
        <div className="relative w-full h-56 rounded-t-2xl overflow-hidden group">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-md z-20 flex items-center justify-center">
            {product.type === "veg" ? <VegIcon /> : <NonVegIcon />}
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-2 box-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            {[...Array(4)].map((_, i) => (
              <span key={i}>★</span>
            ))}
            <span className="text-gray-300">★</span>
          </div>

          {variantImages.length > 0 && (
            <div className="max-w-[120px] overflow-hidden">
              {variantImages.length > 2 ? (
                <Slider {...sliderSettings}>
                  {variantImages.map((imageUrl, idx) => (
                    <div key={idx} className="px-1">
                      <button
                        type="button"
                        onClick={() => handleVariantImageClick(imageUrl)}
                        className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full border-2 ${
                          mainImage === imageUrl
                            ? "border-orange-500"
                            : "border-gray-200"
                        } overflow-hidden flex-shrink-0`}
                      >
                        <Image
                          src={imageUrl}
                          alt={`variant-img-${idx}`}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="flex gap-2">
                  {variantImages.map((imageUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVariantImageClick(imageUrl)}
                      className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full border-2 ${
                        mainImage === imageUrl
                          ? "border-orange-500"
                          : "border-gray-200"
                      } overflow-hidden flex-shrink-0`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`variant-img-${idx}`}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-800 truncate">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description ||
            "Tasty, hot and fresh straight from our kitchen!"}
        </p>

        <div className="flex items-center justify-between pt-3">
          <div className="text-lg font-bold text-orange-600">
            ₹
            {typeof selectedVariant?.Price === "number"
              ? selectedVariant.Price.toFixed(2)
              : typeof product.price === "number"
              ? product.price.toFixed(2)
              : "0.00"}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
