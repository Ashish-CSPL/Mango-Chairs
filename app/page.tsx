// app/page.tsx
import Head from "next/head";
import Banner from "@/components/Server-side-codes/Banner/Banner";
import fetchData from "../api/fetchdata"; // Assuming fetchData uses your primary API
import Category from "@/components/Server-side-codes/Category/Category";
import Speciality from "@/components/Server-side-codes/What-Make-Us-Special/Speciality";
import WhyChooseUsSection, {
  getWhyChooseUsData,
} from "@/components/Server-side-codes/Why-Choose-Us/WhyChooseUS";
import Stories from "@/components/Server-side-codes/Stories/Stories";
import TestimonialSliderClient from "@/components/Client-side-server/New-Arrival/Testimonials";
import { getTestimonials } from "./API_Calls/Function"; // Assuming these are in app/Function.ts
import YouTubePlayer from "@/components/Server-side-codes/VideoPlayer/YouTubePlayer";
// import ProductsDisplay from "@/components/Server-side-codes/Products/ProductDisplay";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductList from "@/components/Server-side-codes/ProductSecondarySection/ProductList";

const Home = async () => {
  // Fetch all data in parallel
  const [bannerData, categoryData, testimonials, whyChooseUsData] =
    await Promise.all([
      fetchData("frontend/banners", "GET"),
      fetchData("frontend/categories", "GET"),
      getTestimonials(),
      getWhyChooseUsData(),
    ]);
  // console.log(getTestimonials(),"fa")
  const categories = categoryData.product_categories || [];

  // Get the first banner image for LCP preload
  const firstBannerImage = bannerData?.banners?.[0]?.image;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  return (
    <>
      {/* Preload the first banner image to improve LCP */}
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

      <Category categories={categories} />
      <Speciality />
      <WhyChooseUsSection whyChooseUsData={whyChooseUsData} />
      <ProductList />
      {/* NEW: Display all products */}

      <YouTubePlayer />
      <Stories />
      <TestimonialSliderClient testimonials={testimonials} />
    </>
  );
};

export default Home;
