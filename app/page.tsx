import Head from "next/head";
import Banner from "@/components/Server-side-codes/Banner/Banner";
import Category from "@/components/Server-side-codes/Category/Category";
import Speciality from "@/components/Server-side-codes/What-Make-Us-Special/Speciality";
import TestimonialSliderClient from "@/components/Client-side-server/New-Arrival/Testimonials";
import { getTestimonials } from "./API_Calls/Function";
import ProductList from "@/components/Server-side-codes/ProductSecondarySection/NewArrival";

import { BannerData } from "@/types/Banner_datatypes";
import { Category as CategoryType } from "@/components/Server-side-codes/Category/Category";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategoryCarousel from "@/components/Client-side-server/CategorySection/CategoryCarousel";
import fetchSecondary from "@/api/fetchSecondary";
import CategoryProductSection from "@/components/Client-side-server/CategorySection/CategoryProductSection";
import BestSelling from "@/components/Client-side-server/BestSelling/BestSelling";
import PromoSection from "@/components/Client-side-server/PromoSection/PromoSection";
import FeatureSection from "@/components/Client-side-server/featureSection/FeatureSection";
// import SpecialComboOffer from "@/components/Client-side-server/SpecialComboOffer/SpecialComboOffer";

type BannerResponse = {
  banners?: {
    id: number;
    title: string;
    image: string;
    link: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
};

type CategoryResponse = {
  product_categories: CategoryType[];
};

const Home = async () => {
  const [rawBannerData] = await Promise.all([
    fetchSecondary("/frontend/banners", "GET") as Promise<BannerResponse>,
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 🔁 Transform raw API banner data into BannerData structure
  const mappedBanners: BannerData[] =
    rawBannerData.banners?.map((item) => ({
      id: item.id,
      heading: item.title, // 🔁 match expected prop
      description: item.link, // 🔁 match expected prop
      image: item.image,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })) || [];

  const firstBannerImage = mappedBanners?.[0]?.image;

  return (
    <>
      <Head>
        {firstBannerImage && baseUrl && (
          <link
            rel="preload"
            as="image"
            href={`${baseUrl}${firstBannerImage}`}
          />
        )}
      </Head>

      {/* ✅ No design impact — banner format matched */}
      <Banner bannerEndpoint={{ banners: mappedBanners }} />

      {/* <h1
        className="text-2xl md:text-[48px] mt-6 text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        BROWSE THROUGH OUR CATEGORY
      </h1> */}

      {/* Category Carousel, no changes */}
      <CategoryCarousel />

      <BestSelling />

      {/* <Speciality /> */}
      {/* <WhyChooseUsSection whyChooseUsData={whyChooseUsData} /> */}

      <PromoSection />
      <CategoryProductSection />
      <FeatureSection />
      <ProductList />
    </>
  );
};

export default Home;
