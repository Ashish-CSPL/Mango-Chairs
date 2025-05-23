"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleUserRound, ShoppingBag, Menu, X, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";

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

interface NavbarClientProps {
  navData: NavItem[];
  categories: Category[];
}

const NavbarClient: React.FC<NavbarClientProps> = ({
  navData = [],
  categories = [],
}) => {
  const cartCount = useSelector((state: RootState) => state.cart.cartCount);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems); // Assuming you have cartItems in store for mini cart display

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
    setShowMobileDropdown(false);
  };

  const iconColor = !isScrolled && !isMobileMenuOpen ? "white" : "black";
  const dynamicTextColor =
    isScrolled || isMobileMenuOpen ? "text-black" : "text-white";

  const renderCategoryDropdown = () => (
    <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 z-50 w-[50vw] max-w-2xl bg-white/30 backdrop-blur-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl">
      {categories?.map((cat) => {
        const imageSrc = cat.image.startsWith("/")
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${cat.image}`
          : cat.image;
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="flex items-center gap-3 hover:text-orange-500"
          >
            <div className="w-26 h-26 relative">
              <Image
                src={imageSrc}
                alt={cat.title}
                fill
                className="rounded-md object-cover"
              />
            </div>
            <p className="text-sm font-semibold">{cat.title}</p>
          </Link>
        );
      })}
    </div>
  );

  // Mini cart content shown on hover
  const renderMiniCart = () => (
    <div
      onMouseLeave={() => setShowMiniCart(false)}
      className="absolute right-0 top-full mt-2 w-80 max-w-full bg-white shadow-lg rounded-lg p-4 z-50"
      style={{ minWidth: "320px" }}
    >
      <h3 className="font-semibold text-lg mb-3 border-b pb-2">Cart Items</h3>
      {cartItems && cartItems.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto">
          {cartItems.map((item: any, index: number) => (
            <li
              key={index}
              className="flex items-center gap-3 mb-3 border-b pb-2 last:border-none"
            >
              <div className="w-12 h-12 relative flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name || "Product"}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">
                ₹{item.price * item.quantity}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      )}
      <Link
        href="/cart"
        onClick={() => setShowMiniCart(false)}
        className="block mt-4 text-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
      >
        View Cart & Checkout
      </Link>
    </div>
  );

  return (
    <>
      <style>{`
        /* Mobile menu fade + slide */
        .mobile-menu {
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }
        .mobile-menu.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* Mobile category dropdown fade + slide */
        .mobile-category-dropdown {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }
        .mobile-category-dropdown.open {
          max-height: 1000px; /* big enough to show all */
          opacity: 1;
        }

        /* Search input placeholder black */
        input::placeholder {
          color: black;
          opacity: 1;
        }
      `}</style>

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300
      bg-white/10 backdrop-blur-md
      ${isScrolled || isMobileMenuOpen ? "shadow-md" : "shadow-none"}

      /* Mobile View */
      sm:top-[10px] sm:mt-[10px]

      /* Tablet View */
      md:top-[14px] md:mt-[8px]

      /* Laptop/Desktop View */
      lg:top-[30px] lg:mt-[0px]
    `}
        style={{
          top: isScrolled || isMobileMenuOpen ? 0 : undefined,
          marginTop: isScrolled || isMobileMenuOpen ? 0 : undefined,
        }}
      >
        {/* Main Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Logo */}
            <Link href="/">
              <div className="relative w-40 h-16 lg:w-52 lg:h-20 ml-[-8px] sm:ml-0 lg:ml-[-40px]">
                <Image
                  src="/MangoLogo.webp"
                  alt="Mango Logo"
                  fill
                  className="object-contain"
                  priority
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center space-x-8 group relative">
              {navData?.map((navItem, index) =>
                index === 1 ? (
                  <li
                    key={navItem.pk}
                    className="relative group"
                    onMouseEnter={() => setShowDesktopDropdown(true)}
                    onMouseLeave={() => setShowDesktopDropdown(false)}
                  >
                    <Link
                      href={navItem.link}
                      className={`cursor-pointer font-semibold hover:text-orange-500 ${dynamicTextColor}`}
                    >
                      {navItem.name}
                    </Link>
                    {showDesktopDropdown && renderCategoryDropdown()}
                  </li>
                ) : (
                  <li key={navItem.pk}>
                    <Link
                      href={navItem.link}
                      className={`font-semibold hover:text-orange-500 ${dynamicTextColor}`}
                    >
                      {navItem.name}
                    </Link>
                  </li>
                )
              )}
            </ul>

            {/* Desktop Search + Icons (Laptop View Only) - NO Hamburger on lg */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Search */}
              <div className="flex items-center border border-transparent bg-white px-2 py-1 max-w-[280px] flex-shrink-0">
                <Search color="black" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="outline-none border-none text-sm bg-white text-black placeholder-black w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: 0 }}
                />
              </div>

              {/* Icons */}
              <div className="flex items-center space-x-4 relative">
                <CircleUserRound
                  className="cursor-pointer"
                  size={24}
                  color={iconColor}
                />
                {/* ShoppingBag with hover mini cart */}
                <div
                  onMouseEnter={() => setShowMiniCart(true)}
                  onMouseLeave={() => setShowMiniCart(false)}
                  className="relative cursor-pointer"
                >
                  <Link href="/cart">
                    <ShoppingBag size={24} color={iconColor} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {showMiniCart && renderMiniCart()}
                </div>
              </div>
            </div>

            {/* Tablet View: Search + Icons + Hamburger */}
            <div className="hidden md:flex lg:hidden items-center space-x-4 flex-1 justify-end">
              {/* Search bar with reduced width */}
              <div className="flex items-center border border-transparent bg-white px-2 py-1 max-w-[180px] flex-shrink-0">
                <Search color="black" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="outline-none border-none text-sm bg-white text-black placeholder-black w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: 0 }}
                />
              </div>

              <CircleUserRound size={24} color="black" />

              {/* ShoppingBag Icon with cart count */}
              <div
                onMouseEnter={() => setShowMiniCart(true)}
                onMouseLeave={() => setShowMiniCart(false)}
                className="relative cursor-pointer"
              >
                <Link href="/cart">
                  <ShoppingBag size={24} color="black" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {showMiniCart && renderMiniCart()}
              </div>

              {/* Hamburger Icon */}
              <button
                className="ml-2 text-black lg:hidden"
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Mobile View Hamburger Only */}
            <button
              className="md:hidden text-white"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={handleCloseMenu}
        />

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
                    {categories?.map((cat) => {
                      const imageSrc = cat.image.startsWith("/")
                        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${cat.image}`
                        : cat.image;
                      return (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.id}`}
                          className="flex items-center gap-3 py-2 text-black hover:text-orange-500"
                          onClick={handleCloseMenu}
                        >
                          <div className="w-20 h-20 relative flex-shrink-0">
                            <Image
                              src={imageSrc}
                              alt={cat.title}
                              fill
                              className="rounded-md object-cover"
                            />
                          </div>
                          <span className="font-semibold">{cat.title}</span>
                        </Link>
                      );
                    })}
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

          {/* Mobile search + icons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-transparent bg-gray-100 px-2 py-1 flex-grow">
              <Search color="black" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="outline-none border-none text-sm bg-gray-100 text-black placeholder-black w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: 0 }}
              />
            </div>
            <CircleUserRound size={24} color="black" />
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
      </nav>
    </>
  );
};

export default NavbarClient;
