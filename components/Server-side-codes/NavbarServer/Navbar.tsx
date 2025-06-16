// components/Navbar/Navbar.server.tsx
import React from "react";
import NavbarClient from "@/components/Client-side-server/Navbar/components/NavbarClient";
import fetchData from "@/api/fetchdata"; // Make sure this path is correct
import CouponBanner from "@/components/Server-side-codes/CouponBanner/CouponBanner";

interface NavbarProps {
  headerEndpoint: string;
  categoryEndpoint: string;
}

const Navbar = async ({ headerEndpoint, categoryEndpoint }: NavbarProps) => {
  const headerResponse: any = await fetchData(headerEndpoint);
  const navData = (headerResponse as any)?.headers || [];

  const categoryResponse: any = await fetchData(categoryEndpoint);
  const categories = (categoryResponse as any)?.product_categories || [];

  return (
    <>
      <CouponBanner />
      <NavbarClient navData={navData} categories={categories} />
    </>
  );
};

export default Navbar;
