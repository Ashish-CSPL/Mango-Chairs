// "use client";

// import React, { useEffect, useState } from "react";
// import Slider from "react-slick";
// import Image from "next/image";
// import fetchSecondary from "@/api/fetchSecondary";

// interface Category {
//   id: number;
//   name: string;
//   image: string | null;
//   productCount?: number;
// }

// export default function CategoryCarousel() {
//   const [categories, setCategories] = useState<Category[]>([]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const data = await fetchSecondary<Category[]>(
//           "/product/categories",
//           "GET"
//         );
//         const enriched = data.map((cat) => ({
//           ...cat,
//           productCount: Math.floor(Math.random() * 40 + 1),
//         }));
//         setCategories(enriched);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const settings = {
//     infinite: true,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     speed: 600,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     arrows: false,
//     responsive: [
//       { breakpoint: 1280, settings: { slidesToShow: 5 } },
//       { breakpoint: 1024, settings: { slidesToShow: 4 } },
//       { breakpoint: 768, settings: { slidesToShow: 3 } },
//       { breakpoint: 480, settings: { slidesToShow: 2 } },
//     ],
//   };

//   return (
//     <div className="py-5 my-4 px-4 bg-zinc-100">
//       <div className="max-w-7xl mx-auto">
//         <Slider {...settings}>
//           {categories.map((category) => (
//             <div key={category.id} className="px-3">
//               <div className="flex flex-col items-center text-center space-y-3">
//                 {/* Perfectly filled round image */}
//                 <div className="relative w-28 h-28 md:w-44 md:h-44 rounded-full bg-gray-100 overflow-hidden">
//                   <Image
//                     src={
//                       category.image ||
//                       "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
//                     }
//                     alt={category.name}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>

//                 {/* Category Name */}
//                 <h3 className="text-sm md:text-base font-semibold text-black">
//                   {category.name}
//                 </h3>

//                 {/* Product Count */}
//                 <p className="text-xs md:text-sm text-gray-500">
//                   {category.productCount} products
//                 </p>
//               </div>
//             </div>
//           ))}
//         </Slider>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import fetchSecondary from "@/api/fetchSecondary";

interface Category {
  id: number;
  name: string;
  image: string | null;
  productCount?: number;
}

export default function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchSecondary<Category[]>(
          "/product/categories",
          "GET"
        );
        const enriched = data.map((cat) => ({
          ...cat,
          productCount: Math.floor(Math.random() * 40 + 1),
        }));
        setCategories(enriched);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5 } },
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="py-8 px-4 bg-gradient-to-b from-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-orange-600">
          Explore Our Food Categories
        </h2>

        <Slider {...settings}>
          {categories.map((category) => (
            <div key={category.id} className="px-3">
              <div className="group flex flex-col items-center text-center space-y-3 transition-all duration-300 transform hover:scale-105 my-3">
                {/* Round Category Image with ring and hover scale */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border-4 border-orange-200 overflow-hidden shadow-lg group-hover:shadow-xl">
                  <Image
                    src={
                      category.image ||
                      "https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                    }
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Category Name */}
                <h3 className="text-sm md:text-lg font-semibold text-orange-800 group-hover:text-orange-600">
                  {category.name}
                </h3>

                {/* Product Count */}
                <p className="text-xs md:text-sm text-gray-500">
                  {category.productCount} items available
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
