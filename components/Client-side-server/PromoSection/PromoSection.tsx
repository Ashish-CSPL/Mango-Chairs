import React from "react";
import Link from "next/link";

const PromoSection = () => {
  return (
    <section className="max-w-[1300px] mx-auto px-4 py-10 mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* LEFT BLOCK - Maxican Pizza */}
      <div
        className="relative rounded-xl overflow-hidden text-white flex flex-col justify-between p-6 h-[500px] bg-cover bg-center"
        style={{ backgroundImage: "url('/redtheme.webp')" }}
      >
        <h2 className="text-6xl font-bold leading-tight">
          MAXICAN <br /> PIZZA
        </h2>

        {/* Pizza image with 50% Off badge */}
        <div className="absolute bottom-[60px] right-[-30px] w-[350px] h-[350px] z-10">
          <img
            src="/pizza.webp"
            alt="Pizza"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-[10px] left-[-35px] bg-white text-red-600 font-bold text-xl px-4 py-2 rounded-full rotate-[-15deg] shadow-md text-center leading-tight">
            50% <br /> Off
          </div>
        </div>

        <div className="mt-auto z-20">
          <Link href="/shop">
            <button className="relative overflow-hidden group px-6 py-2 font-semibold rounded-full bg-white text-black transition-colors duration-300">
              <span className="relative z-10 group-hover:text-white transition duration-300">
                MAKE AN ORDER
              </span>
              <span className="absolute inset-0 bg-black scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-in-out z-0"></span>
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN - Burger + Crab */}
      <div className="flex flex-col gap-6">
        {/* Luger Burger */}
        <div
          className="relative rounded-xl overflow-hidden text-white flex flex-col justify-between p-6 h-[240px] bg-cover bg-center"
          style={{ backgroundImage: "url('/bluetheme.webp')" }}
        >
          <h2 className="text-5xl font-bold leading-tight">
            LUGER <br /> BURGER
          </h2>

          <div className="absolute top-[10px] right-[-10px] w-[250px] z-10">
            <img
              src="/burger.webp"
              alt="Burger"
              className="w-full object-contain"
            />
            <div className="absolute top-[25px] left-[-30px] bg-white text-black px-3 py-2 rounded-full text-sm font-bold rotate-[10deg] shadow text-center">
              Best <br /> Deal
            </div>
          </div>

          <Link href="/shop">
            <button className="relative overflow-hidden group px-6 py-2 font-semibold rounded-full bg-red-600 text-white transition-colors duration-300 w-fit mt-auto z-20">
              <span className="relative z-10 group-hover:text-black transition duration-300">
                MAKE AN ORDER
              </span>
              <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-in-out z-0"></span>
            </button>
          </Link>
        </div>

        {/* Delicious Crab */}
        <div
          className="relative rounded-xl overflow-hidden text-white flex flex-col items-end justify-between p-6 h-[240px] bg-cover bg-center"
          style={{ backgroundImage: "url('/yellowtheme.webp')" }}
        >
          <h2 className="text-5xl font-bold leading-tight text-right">
            DELICIOUS <br /> CRAB
          </h2>

          <div className="absolute bottom-[-20px] left-[-10px] w-[250px] z-10">
            <img
              src="/crab.webp"
              alt="Crab"
              className="w-full object-contain"
            />
          </div>

          <Link href="/shop">
            <button className="relative overflow-hidden group px-6 py-2 font-semibold rounded-full bg-black text-white transition-colors duration-300 w-fit mt-auto z-20">
              <span className="relative z-10 group-hover:text-white transition duration-300">
                MAKE AN ORDER
              </span>
              <span className="absolute inset-0 bg-red-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-in-out z-0"></span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
