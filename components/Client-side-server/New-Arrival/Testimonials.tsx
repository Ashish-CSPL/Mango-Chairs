"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  designation: string;
  profile_picture: string;
  testimonial: string;
}

interface Props {
  testimonials: Testimonial[];
}

export default function CustomTestimonialSlider({ testimonials }: Props) {
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  console.log(testimonials);

  const handlePrev = () => {
    swiperInstance?.slidePrev();
  };

  const handleNext = () => {
    swiperInstance?.slideNext();
  };

  const currentSlide = swiperInstance?.realIndex || 0;
  const maxSlideIndex = (testimonials?.length || 0) - 1;

  return (
    <div
      className="mb-3 pb-10  bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('Vector.png')" }}
    >
      <h2
        className="text-2xl md:text-[48px] mb-10 text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        WHAT OUR USERS ARE SAYING
      </h2>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 py-5">
        <Swiper
          modules={[Navigation]}
          loop={true}
          centeredSlides={true}
          spaceBetween={10}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          navigation={false}
          breakpoints={{
            0: {
              slidesPerView: 1,
              centeredSlides: false,
              spaceBetween: 10,
            },
            431: {
              slidesPerView: 2,
              centeredSlides: true,
              spaceBetween: 20,
            },
            721: {
              slidesPerView: 3,
              centeredSlides: true,
              spaceBetween: 30,
            },
          }}
          className=""
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              {({ isActive }) => (
                <div
                  className={`bg-white rounded-xl p-6 text-center shadow-lg transition-transform duration-300
                    ${isActive ? "scale-105 z-30 shadow-xl" : "scale-90  z-10"}
                  `}
                  style={{ height: "320px" }}
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-400">
                      <Image
                        src={`https://nxadmin.consociate.co.in${t.profile_picture}`}
                        alt={t.name}
                        width={80}
                        height={80}
                        className="object-cover"
                        loading="lazy" // explicitly lazy load
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-base sm:text-lg">
                        {t.name}
                      </p>
                      <div className="text-yellow-500 text-sm sm:text-base whitespace-nowrap">
                        ★★★★<span className="text-gray-300">★</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                    "{t.testimonial}"
                  </p>
                  <p className="text-orange-500 text-sm">{t.designation}</p>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="flex justify-center items-center gap-3  mt-3">
        <div className="h-px flex-1 bg-gray-300" />
        <button
          onClick={handlePrev}
          disabled={!swiperInstance}
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
          onClick={handleNext}
          disabled={!swiperInstance}
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
    </div>
  );
}
