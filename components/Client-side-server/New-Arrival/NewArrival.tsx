"use client";

import { Heart } from "lucide-react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { useEffect, useState } from "react";
// Make sure this imports from your unified 'product.ts'
import { Product, Variant } from "@/types/Products";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [maxSlideIndex, setMaxSlideIndex] = useState(0);
  // Correctly type selectedVariants: key can be number or string, value is Variant or null
  const [selectedVariants, setSelectedVariants] = useState<{
    [productId: number | string]: Variant | null; // <-- CORRECTED TYPE HERE
  }>({});

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "snap",
    breakpoints: {
      "(max-width: 639px)": {
        slides: { perView: 2, spacing: 10 },
      },
      "(min-width: 640px) and (max-width: 767px)": {
        slides: { perView: 2, spacing: 12 },
      },
      "(min-width: 768px) and (max-width: 1023px)": {
        slides: { perView: 3, spacing: 16 },
      },
      "(min-width: 1024px) and (max-width: 1279px)": {
        slides: { perView: 5, spacing: 20 },
      },
    },
    slides: {
      perView: 5,
      spacing: 20,
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created(slider) {
      const visibleSlidesCount = slider.track.details.slides.filter(
        (slide) => slide.portion > 0
      ).length;

      const totalSlides = slider.track.details.slides.length;
      const max = Math.max(0, totalSlides - visibleSlidesCount);

      setMaxSlideIndex(max);
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  if (!products || products.length === 0)
    return <div>No new arrivals found.</div>;

  const handleNext = () => instanceRef.current?.next();
  const handlePrev = () => instanceRef.current?.prev();

  return (
    <div className="mb-3">
      {/* Marquee Heading */}
      <div className="relative overflow-hidden mb-4 mt-12">
        <div className="marquee-track flex gap-12 w-max">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="text-2xl sm:text-4xl md:text-[48px] bg-clip-text text-transparent whitespace-nowrap"
              style={{
                backgroundImage:
                  "linear-gradient(101deg, rgba(255, 228, 49, 1), rgba(249, 32, 32, 1) 62%)",
              }}
            >
              New Arrivals
            </span>
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={`dup-${i}`}
              className="text-2xl sm:text-4xl md:text-[48px] bg-clip-text text-transparent whitespace-nowrap"
              style={{
                backgroundImage:
                  "linear-gradient(101deg, rgba(255, 228, 49, 1), rgba(249, 32, 32, 1) 62%)",
              }}
            >
              New Arrivals
            </span>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-5 bg-orange-400">
        <div ref={sliderRef} className="keen-slider">
          {products.map((product) => {
            const selected = selectedVariants[product.id];
            const displayImage = selected?.images?.[0] || product.images?.[0];
            const displayPrice =
              selected?.selling_price || product.selling_price;
            const basePrice = product.base_price;

            return (
              <div
                key={product.id}
                className="keen-slider__slide bg-white shadow-sm flex flex-col overflow-hidden"
              >
                <div className="relative w-full h-[160px] sm:h-[200px] border-b border-gray-300">
                  <button className="absolute top-1 right-1 z-10 bg-white p-1 rounded-full shadow hover:text-red-500 h-8 w-8 flex items-center justify-center">
                    <Heart size={16} strokeWidth={1.5} />
                  </button>
                  <Image
                    src={`https://nxadmin.consociate.co.in${displayImage}`}
                    alt={product.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>

                <div className="flex gap-2 sm:gap-4 p-3 flex-col sm:flex-row items-center sm:items-center text-center sm:text-left">
                  <div className="flex flex-col w-full">
                    <p className="text-sm sm:text-base font-playfair font-semibold line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-sm text-red-500">
                      ₹{displayPrice}
                      {basePrice !== displayPrice && (
                        <span className="line-through text-xs ml-2 text-gray-500">
                          ₹{basePrice}
                        </span>
                      )}
                    </p>

                    <div className="flex gap-1 mt-2 flex-wrap justify-center sm:justify-start">
                      {(product.variant_list || [])
                        .slice(0, 3)
                        .map((variant: Variant) => (
                          <div // <-- Removed 'any' from variant type here
                            key={variant.id}
                            title={variant.specification?.colour}
                            onClick={() =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [product.id]: variant,
                              }))
                            }
                            className={`w-11 h-11 p-1 border-[1px] border-[#C5C5C5] cursor-pointer rounded-full overflow-hidden flex items-center justify-center hover:border-blue-400
                              ${
                                selected?.id === variant.id
                                  ? "ring-2 ring-orange-400"
                                  : ""
                              }
                              sm:w-11 sm:h-11 lg:w-8 lg:h-8`}
                          >
                            {variant.images?.[0] && (
                              <Image
                                src={`https://nxadmin.consociate.co.in${variant.images[0]}`}
                                alt={variant.specification?.colour || "Variant"}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="text-yellow-500 text-sm sm:text-base whitespace-nowrap mt-2 sm:mt-0 self-center">
                    ★★★★<span className="text-gray-300">★</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next Buttons */}
      <div className="flex justify-center items-center gap-3 mt-3">
        <div className="h-px flex-1 bg-gray-300" />
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
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
          onClick={handleNext}
          disabled={currentSlide >= maxSlideIndex}
          className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
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
    </div>
  );
}