"use client";

import { useState, useRef } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types/Products";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/Store/cartSlice";
import toast from "react-hot-toast";

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<number, any>>(
    {}
  );
  const sliderRef = useRef<Slider>(null);
  const dispatch = useDispatch();

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    rows: 2,
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          rows: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          rows: 2,
        },
      },
    ],
  };

  const handleAddToCart = (product: Product, variant: any) => {
    const cartProduct = variant
      ? { ...variant, parentProduct: product }
      : product;

    dispatch(addToCart(cartProduct));
    toast.success("Product added successfully!");
  };

  return (
    <main className="max-w-7xl mx-auto mb-3 ">
      <h1
        className="text-2xl md:text-[48px] mb-6 text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        DISCOVER ALL PRODUCTS
      </h1>

      <div className="slider-container px-2 sm:px-3 ">
        <Slider {...settings} ref={sliderRef}>
          {products.map((product) => {
            const selected = selectedVariants[product.id];
            const displayImage = selected?.images?.[0] || product.images[0];
            const displayPrice =
              selected?.selling_price ?? product.selling_price;
            const basePrice = product.base_price;

            return (
              <div key={product.id} className="px-2">
                <div className="border-[1px] border-[#C5C5C5] hover:shadow-md transition min-h-full w-full mb-6">
                  <div
                    className="p-1 flex items-center justify-center relative"
                    style={{ borderBottom: "1px solid #C5C5C5" }}
                  >
                    <Image
                      src={`https://nxadmin.consociate.co.in${displayImage}`}
                      width={300}
                      height={300}
                      className="object-cover rounded mb-3"
                      alt={product.name}
                    />
                    <div className="absolute top-1 right-1 z-20 bg-white p-1 rounded-full shadow hover:text-red-500 h-8 w-8 flex items-center justify-center">
                      <button>
                        <Heart size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center text-center sm:text-left px-2 py-1">
                    <div className="flex flex-col p-0 sm:p-2 md:p-2">
                      <h2 className="line-clamp-1 text-sm font-semibold">
                        {product.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#f83a3a]">
                        ₹{displayPrice}
                        {basePrice !== displayPrice && (
                          <span className="line-through text-xs ml-1 text-gray-500">
                            ₹{basePrice}
                          </span>
                        )}
                      </p>

                      <div className="flex gap-1 mt-1 flex-wrap">
                        {product.variant_list
                          ?.slice(0, 3)
                          .map((variant: any) => (
                            <div
                              key={variant.id}
                              title={variant.specification.colour}
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [product.id]: variant,
                                }))
                              }
                              className={`w-8 h-8 border-[1px] border-[#C5C5C5] cursor-pointer rounded-full overflow-hidden flex items-center justify-center hover:border-blue-400 ${
                                selected?.id === variant.id
                                  ? "ring-2 ring-orange-400"
                                  : ""
                              }`}
                            >
                              {variant.images && variant.images.length > 0 && (
                                <Image
                                  src={`https://nxadmin.consociate.co.in${variant.images[0]}`}
                                  alt={
                                    variant.specification.colour || "Variant"
                                  }
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              )}
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product, selected)}
                        className="mt-2 bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
                      >
                        Add to Cart
                      </button>
                    </div>

                    <div className="text-yellow-500 text-sm sm:text-base whitespace-nowrap sm:mt-0">
                      ★★★★<span className="text-gray-300">★</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      {/* Custom Navigation */}
      <div className="flex justify-center gap-3 items-center ">
        <div className="h-px flex-1 bg-gray-300" />
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Previous Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
          aria-label="Next Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
    </main>
  );
}
