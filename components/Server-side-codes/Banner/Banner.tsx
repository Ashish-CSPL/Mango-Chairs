"use client";

import React from "react";
import Image from "next/image";
import { BannerData } from "@/types/Banner_datatypes";
import { ChevronsDown } from "lucide-react";

interface BannerProps {
  bannerEndpoint: { banners?: BannerData[] };
}

const Banner: React.FC<BannerProps> = ({ bannerEndpoint }) => {
  const bannerDataArray = Array.isArray(bannerEndpoint?.banners)
    ? bannerEndpoint.banners
    : [];

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.6, behavior: "smooth" });
  };

  return (
    <section className="w-full relative">
      {bannerDataArray.map((banner, index) => (
        <div
          key={index}
          className="relative w-full h-[50vh] sm:h-[60vh] md:h-[55vh] lg:h-[90vh]"
        >
          {/* Optimized Banner Image */}
          {banner.image && process.env.NEXT_PUBLIC_API_BASE_URL && (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${banner.image}`}
              alt={banner.heading || `Banner ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 z-0" />

          {/* Text Content */}
          <div
            className="
              absolute inset-0 z-10
              flex flex-col justify-center items-center text-center
              px-4 sm:px-8 md:px-12
              lg:items-start lg:text-left lg:px-20
            "
          >
            {banner.heading && (
              <p className="text-white font-semibold mb-2 sm:mb-4 text-base sm:text-lg md:text-base lg:text-2xl">
                {banner.heading}
              </p>
            )}
            {banner.description && (
              <p className="text-white font-light max-w-3xl text-xl sm:text-2xl md:text-2xl lg:text-4xl xl:text-5xl leading-snug sm:leading-snug">
                {banner.description}
              </p>
            )}
          </div>

          {/* Scroll Down Button */}
          <button
            onClick={handleScrollDown}
            className="hidden sm:flex absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce text-white z-20 items-center"
            aria-label="Scroll Down"
          >
            <p className="text-sm sm:text-base md:text-lg mr-2">Scroll Down</p>
            <ChevronsDown size={24} />
          </button>
        </div>
      ))}
    </section>
  );
};

export default Banner;
