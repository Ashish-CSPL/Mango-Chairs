"use client";
import Image from "next/image";

const features = [
  {
    id: 1,
    title: "Best Quality",
    description:
      "We use only the best ingredients to cook the fresh food for you.",
    icon: "/burger1.webp",
  },
  {
    id: 2,
    title: "30 Minutes Delivery",
    description: "Everything you order will be quickly delivered to your door.",
    icon: "/clock.webp",
  },
  {
    id: 3,
    title: "Free Shipping",
    description: "Sign up for updates and get free shipping.",
    icon: "/human.webp",
  },
  {
    id: 4,
    title: "Variety of Dishes",
    description:
      "In our menu you’ll find a wide variety of dishes, desserts, and drinks.",
    icon: "/burgerfries.webp",
  },
];

const FeatureSection = () => {
  return (
    <div className="relative bg-[#FCF6EA] overflow-hidden">
      {/* Background image layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background.webp"
          alt="Background"
          fill
          className="object-cover opacity-10"
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
