"use client";
import Image from "next/image";
import Link from "next/link";

const DeliveryBanner = () => {
  return (
    <section className="bg-[#FCF6EA] py-12 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
          {/* Left: Pizza Image */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <Image
              src="/pizza-ban4.webp"
              alt="Pizza"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>

          {/* Center: Text & Button */}
          <div className="w-full lg:w-1/3 text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/Make-your-own-Pizza.webp"
                alt="Make Your Own Pizza"
                width={220}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black">
              30 MINUTES DELIVERY!
            </h2>
            <Link href="/shop">
              <button className="mt-4 bg-[#F6BE00] hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-[20px] shadow-md transition-all duration-200">
                Start order
              </button>
            </Link>
          </div>

          {/* Right: Delivery Man */}
          <div className="w-full lg:w-1/3 flex justify-center">
            <Image
              src="/shippper.webp"
              alt="Delivery Man"
              width={400}
              height={400}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryBanner;
