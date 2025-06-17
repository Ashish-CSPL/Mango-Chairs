import Head from "next/head";
import Banner from "@/components/Server-side-codes/Banner/Banner";
import fetchData from "../api/fetchdata";
import Category from "@/components/Server-side-codes/Category/Category";
import Speciality from "@/components/Server-side-codes/What-Make-Us-Special/Speciality";
import WhyChooseUsSection, {
  getWhyChooseUsData,
} from "@/components/Server-side-codes/Why-Choose-Us/WhyChooseUS";
import Stories from "@/components/Server-side-codes/Stories/Stories";
import TestimonialSliderClient from "@/components/Client-side-server/New-Arrival/Testimonials";
import { getTestimonials } from "./API_Calls/Function";
// import YouTubePlayer from "@/components/Server-side-codes/VideoPlayer/YouTubePlayer";
import ProductList from "@/components/Server-side-codes/ProductSecondarySection/ProductList";

import { BannerData } from "@/types/Banner_datatypes";
import { Category as CategoryType } from "@/components/Server-side-codes/Category/Category";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CategoryCarousel from "@/components/Client-side-server/CategorySection/CategoryCarousel";

// 👇 Define the expected API response types
type BannerResponse = {
  banners?: BannerData[];
};

type CategoryResponse = {
  product_categories: CategoryType[];
};

const Home = async () => {
  // 👇 Explicitly cast the fetched data
  const [bannerData, categoryData, testimonials, whyChooseUsData] =
    await Promise.all([
      fetchData("frontend/banners", "GET") as Promise<BannerResponse>,
      fetchData("frontend/categories", "GET") as Promise<CategoryResponse>,
      getTestimonials(),
      getWhyChooseUsData(),
    ]);

  const categories = categoryData.product_categories || [];

  const firstBannerImage = bannerData?.banners?.[0]?.image;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <>
      {/* Preload banner image for LCP */}
      <Head>
        {firstBannerImage && baseUrl && (
          <link
            rel="preload"
            as="image"
            href={`${baseUrl}${firstBannerImage}`}
          />
        )}
      </Head>

      <Banner bannerEndpoint={bannerData} />

      <h1
        className="text-2xl md:text-[48px] mt-6 text-center font-playfair"
        style={{ color: "#3E3E3E" }}
      >
        BROWSE THROUGH OUR CATEGORY
      </h1>

      {/* <Category categories={categories} /> */}
      <CategoryCarousel />
      <Speciality />
      <WhyChooseUsSection whyChooseUsData={whyChooseUsData} />
      <ProductList />
      {/* <YouTubePlayer /> */}
      <Stories />
      <TestimonialSliderClient testimonials={testimonials} />
    </>
  );
};

export default Home;
