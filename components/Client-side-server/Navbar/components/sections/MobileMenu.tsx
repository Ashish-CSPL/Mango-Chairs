import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, CircleUserRound } from "lucide-react";
import SearchInput from "../searchInput";


import { RefObject } from "react"; // Import RefObject
import { User } from "@/types/user";

interface NavItem {
  pk: number;
  name: string;
  link: string;
}

interface Category {
  id: number;
  title: string;
  image: string;
}

interface CartItem {
  image: string;
  name: string;
  quantity: number;
  price: number;
}

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  handleCloseMenu: () => void;
  navData: NavItem[];
  categories: Category[];
  showMobileDropdown: boolean;
  setShowMobileDropdown: (show: boolean) => void;
  user: User | null;
  showLogoutDropdown: boolean; // Passed down from NavbarClient
  setShowLogoutDropdown: (show: boolean) => void; // Passed down from NavbarClient
  handleLogout: () => void;
  cartCount: number;
  cartItems: CartItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userIconRef: RefObject<HTMLDivElement>; // Pass ref for click outside logic
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  handleCloseMenu,
  navData,
  categories,
  showMobileDropdown,
  setShowMobileDropdown,
  user,
  showLogoutDropdown,
  setShowLogoutDropdown,
  handleLogout,
  cartCount,
  cartItems,
  searchTerm,
  setSearchTerm,
  userIconRef, // Receive the ref
}) => {
  const getCategoryImageUrl = (path: string) => {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://nxadmin.consociate.co.in";
    return path.startsWith("/") ? `${BASE_URL}${path}` : path;
  };

  return (
    <>
      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleCloseMenu}
      />

      {/* Mobile Menu Content */}
      <div
        className={`mobile-menu fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-6 flex flex-col space-y-6
        ${isMobileMenuOpen ? "open" : ""}`}
        style={{ top: 64 }}
      >
        <ul className="flex flex-col space-y-6">
          {navData?.map((navItem, index) =>
            index === 1 ? (
              <li key={navItem.pk}>
                <button
                  className="flex items-center justify-between w-full font-semibold text-black hover:text-orange-500"
                  onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                  aria-expanded={showMobileDropdown}
                >
                  {navItem.name}
                  <svg
                    className={`transform transition-transform ${
                      showMobileDropdown ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`mobile-category-dropdown pl-4 mt-3 border-l border-gray-300 ${
                    showMobileDropdown ? "open" : ""
                  }`}
                >
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      className="flex items-center gap-3 py-2 text-black hover:text-orange-500"
                      onClick={handleCloseMenu}
                    >
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={getCategoryImageUrl(cat.image)}
                          alt={cat.title}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <span className="font-semibold">{cat.title}</span>
                    </Link>
                  ))}
                </div>
              </li>
            ) : (
              <li key={navItem.pk}>
                <Link
                  href={navItem.link}
                  className="font-semibold text-black hover:text-orange-500"
                  onClick={handleCloseMenu}
                >
                  {navItem.name}
                </Link>
              </li>
            )
          )}
        </ul>

        <div className="flex items-center space-x-4">
          {/* Search Input for Mobile Menu */}
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            className="bg-gray-100" // Specific background for mobile search
            maxWidth="max-w-none" // Allow it to take full available width
          />

          {/* User Icon Section for Mobile Menu (reusing component) */}
          {/* Note: userIconRef is passed from NavbarClient for global click outside */}
          {/* <UserIconSection
            user={user}
            showLogoutDropdown={showLogoutDropdown}
            setShowLogoutDropdown={setShowLogoutDropdown}
            handleLogout={handleLogout}
            dynamicTextColor="text-black" // Always black in mobile menu
            iconColor="black" // Always black in mobile menu
            userIconRef={userIconRef}
          /> */}

          {/* Cart Icon for Mobile Menu */}
          <Link href="/cart" className="relative">
            <ShoppingBag size={24} color="black" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
