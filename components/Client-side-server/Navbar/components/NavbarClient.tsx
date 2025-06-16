"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CircleUserRound,
  ShoppingBag,
  Menu,
  X,
  Search,
  LogOut,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- REDUX IMPORTS ---
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/Redux/Store/store";
import { CartItem } from "@/app/Redux/Store/cartSlice";
import { logout } from "@/app/Redux/Slices/authSlice";
import { fetchWishlistItems } from "@/app/Redux/Slices/wishlistSlice";

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

interface UserData {
  id?: number;
  email?: string;
  name?: string;
  profile_picture?: string;
  first_name?: string;
  last_name?: string;
}

const selectCartCount = (state: RootState): number => {
  return state.cart.cartItems.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  );
};

const selectWishlistCount = (state: RootState): number => {
  return state.wishlist.wishlistItems.length;
};

const NavbarClient: React.FC<NavbarClientProps> = ({
  navData = [],
  categories = [],
}) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    console.log("--- NavbarClient State Update ---");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("User object from Redux:", user);
    console.log("User profile_picture:", user?.profile_picture); // Confirm it exists here
    if (user?.profile_picture) {
      console.log(
        "NavbarClient: Image URL passed to getProfileImageUrl:",
        user.profile_picture
      );
      console.log(
        "NavbarClient: Final constructed image URL from function:",
        getProfileImageUrl(user.profile_picture)
      );
    } else {
      console.log("NavbarClient: user.profile_picture is not available.");
    }
    console.log("-------------------------------");
  }, [isAuthenticated, user]);

  const cartCount = useSelector(selectCartCount);
  const { cartItems } = useSelector((state: RootState) => state.cart);

  const wishlistCount = useSelector(selectWishlistCount);
  const wishlistStatus = useSelector(
    (state: RootState) => state.wishlist.status
  );

  useEffect(() => {
    if (isAuthenticated && user?.id && wishlistStatus === "idle") {
      dispatch(fetchWishlistItems(user.id.toString()));
    }
  }, [isAuthenticated, user?.id, wishlistStatus, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/Login");
  };

  const handleWishlistClick = () => {
    router.push("/wishlist");
    handleCloseMenu();
  };

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

  const iconColor =
    !isScrolled && !isMobileMenuOpen && !isAuthenticated ? "white" : "black";
  const dynamicTextColor =
    isScrolled || isMobileMenuOpen ? "text-black" : "text-white";

  const renderCategoryDropdown = () => (
    <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 z-50 w-[50vw] max-w-2xl bg-white/30 backdrop-blur-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl">
      {categories?.map((cat) => {
        const imageSrc = cat.image.startsWith("http")
          ? cat.image
          : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "")}${
              cat.image
            }`;
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
                priority
                unoptimized
              />
            </div>
            <p className="text-sm font-semibold">{cat.title}</p>
          </Link>
        );
      })}
    </div>
  );

  const renderMiniCart = () => (
    <div
      onMouseLeave={() => setShowMiniCart(false)}
      className="absolute right-0 top-full mt-2 w-80 max-w-full bg-white shadow-lg rounded-lg p-4 z-50"
      style={{ minWidth: "320px" }}
    >
      <h3 className="font-semibold text-lg mb-3 border-b pb-2">Cart Items</h3>
      {cartItems && cartItems.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto">
          {cartItems.map((item: CartItem, index: number) => (
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
                ₹{(item.price * item.quantity).toFixed(2)}{" "}
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

  // --- Crucial for image URL construction ---
  const getProfileImageUrl = (path?: string) => {
    console.log("getProfileImageUrl: Input path:", path);

    if (!path) {
      console.warn(
        "getProfileImageUrl: Path is empty/null/undefined. Returning default /profile.png"
      );
      return "/profile.png"; // Fallback to a default image in your public folder
    }

    // Case 1: Already a full URL (e.g., from Cloudinary, absolute path on other domain)
    if (path.startsWith("http://") || path.startsWith("https://")) {
      console.log(
        "getProfileImageUrl: Path is already a full URL. Returning as is:",
        path
      );
      return path;
    }

    // Case 2: Path starts with a slash, implying it's relative to the domain root
    if (path.startsWith("/")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        console.error(
          "getProfileImageUrl Error: NEXT_PUBLIC_API_BASE_URL is not defined in environment."
        );
        return "/profile.png";
      }
      // Ensure baseUrl is just the domain for absolute paths
      try {
        const urlObject = new URL(baseUrl);
        const domainOnly = `${urlObject.protocol}//${urlObject.host}`;
        const finalUrl = `${domainOnly}${path}`; // Concatenate domain with absolute path
        console.log(
          "getProfileImageUrl: Constructed URL from absolute path:",
          finalUrl
        );
        return finalUrl;
      } catch (e) {
        console.error(
          "getProfileImageUrl: Could not parse NEXT_PUBLIC_API_BASE_URL as a URL for absolute path:",
          e
        );
        return "/profile.png"; // Fallback if base URL is malformed
      }
    }

    // Case 3: Path without leading slash (e.g., media/profile_pics/image.jpg) - most common for Django media
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      console.error(
        "getProfileImageUrl Error: NEXT_PUBLIC_API_BASE_URL is not defined for relative path."
      );
      return "/profile.png";
    }

    // Attempt to extract the domain part, removing /api/v1 if present
    let domainPart: string;
    try {
      const urlObject = new URL(baseUrl);
      domainPart = `${urlObject.protocol}//${urlObject.host}`;
      console.log(
        "getProfileImageUrl: Parsed domain part from NEXT_PUBLIC_API_BASE_URL:",
        domainPart
      );
    } catch (e) {
      console.error(
        "getProfileImageUrl: Failed to parse NEXT_PUBLIC_API_BASE_URL as a full URL, assuming relative path for domain prepending.",
        e
      );
      // Fallback for cases like "localhost:8000/api/v1" or if it's just a domain
      domainPart = baseUrl.split("/api")[0]; // This might need adjustment depending on your exact ENV var format
      if (!domainPart.startsWith("http")) {
        // Ensure it still forms a valid URL
        domainPart = `http://${domainPart}`; // Default to http if missing protocol
      }
    }

    const fullUrl = `${domainPart}/${path}`;
    console.log(
      "getProfileImageUrl: Constructed full URL from path without leading slash:",
      fullUrl
    );
    return fullUrl;
  };

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
          max-height: 1000px;
          opacity: 1;
        }

        /* Search input placeholder black */
        input::placeholder {
          color: black;
          opacity: 1;
        }

        /* Tooltip styles */
        .tooltip-container {
          position: relative;
          display: inline-block;
        }
        .tooltip-text {
          visibility: hidden;
          opacity: 0;
          background-color: #333;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px 8px;
          position: absolute;
          z-index: 60;
          bottom: 125%; /* Position above the icon */
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          transition: opacity 0.3s, visibility 0.3s;
          font-size: 0.75rem; /* text-xs */
        }
        .tooltip-container:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
      `}</style>

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300
        bg-white/10 backdrop-blur-md
        ${isScrolled || isMobileMenuOpen ? "shadow-md" : "shadow-none"}
        sm:top-[10px] sm:mt-[10px]
        md:top-[14px] md:mt-[8px]
        lg:top-[30px] lg:mt-[0px]
        `}
        style={{
          top: isScrolled || isMobileMenuOpen ? 0 : undefined,
          marginTop: isScrolled || isMobileMenuOpen ? 0 : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
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

            {/* Desktop Navigation Links */}
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

            {/* Desktop Right Section: Search, User, Wishlist, Cart */}
            <div className="hidden lg:flex items-center space-x-6">
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

              {/* Conditional User Display (Logged In vs. Logged Out) */}
              {isAuthenticated && user ? (
                <div className="relative flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white cursor-pointer">
                    <Image
                      src={getProfileImageUrl(user.profile_picture)}
                      alt={user.first_name || user.name || "User Profile"}
                      fill
                      className="object-cover"
                      unoptimized={user.profile_picture?.startsWith("http")}
                      onError={(e) => {
                        console.error("Image loading error (desktop):", e);
                        e.currentTarget.src = "/profile.png"; // Fallback to a default image on error
                      }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${dynamicTextColor}`}>
                    Hi, {user.first_name || user.name || "User"}{" "}
                  </span>
                  <div className="tooltip-container ml-1">
                    <button
                      onClick={handleLogout}
                      className={`flex items-center gap-1 font-semibold hover:text-red-500 ${dynamicTextColor}`}
                      aria-label="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                    <span className="tooltip-text">
                      Do you want to log out?
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative cursor-pointer">
                  <Link href="/login" className="flex items-center gap-1">
                    <CircleUserRound
                      className="cursor-pointer"
                      size={24}
                      color={iconColor}
                    />
                    <span
                      className={`text-sm font-semibold ${dynamicTextColor} hidden sm:inline`}
                    >
                      Sign In / Sign Up
                    </span>
                  </Link>
                </div>
              )}

              {/* Wishlist Icon (Desktop) */}
              {/* <div className="relative cursor-pointer">
                <Heart
                  size={24}
                  color={iconColor}
                  onClick={handleWishlistClick}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div> */}

              {/* Shopping Cart Icon (Desktop) */}
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

            {/* Mobile/Tablet Icons (Search, User, Wishlist, Cart, Menu Toggle) */}
            <div className="hidden md:flex lg:hidden items-center space-x-4 flex-1 justify-end">
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

              {/* Conditional User Display for Mobile/Tablet */}
              {isAuthenticated && user ? (
                <div className="relative flex items-center gap-2 group text-black">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-black cursor-pointer">
                    <Image
                      src={getProfileImageUrl(user.profile_picture)}
                      alt={user.first_name || user.name || "User Profile"}
                      fill
                      className="object-cover"
                      unoptimized={user.profile_picture?.startsWith("http")}
                      onError={(e) => {
                        console.error("Image loading error (mobile):", e);
                        e.currentTarget.src = "/profile.png";
                      }}
                    />
                  </div>
                  <span className={`text-sm font-semibold`}>
                    Hi, {user.first_name || user.name || "User"}{" "}
                  </span>
                  <div className="tooltip-container ml-1">
                    <button
                      onClick={handleLogout}
                      className={`ml-2 flex items-center gap-1 font-semibold hover:text-red-500 text-black`}
                      aria-label="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                    <span className="tooltip-text">
                      Do you want to log out?
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative cursor-pointer">
                  <Link href="/login" className="flex items-center gap-1">
                    <CircleUserRound size={24} color="black" />
                    <span className="text-sm font-semibold text-black hidden sm:inline">
                      Sign In / Sign Up
                    </span>
                  </Link>
                </div>
              )}

              {/* Wishlist Icon (Tablet) */}
              {/*
               */}

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

              <button
                className="ml-2 text-black lg:hidden"
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>

            {/* Mobile-only menu toggle (small screens) */}
            <button
              className="md:hidden text-white"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

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
                    {categories?.map((cat) => {
                      const imageSrc = cat.image.startsWith("http")
                        ? cat.image
                        : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                            "/api/v1",
                            ""
                          )}${cat.image}`;
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
                              unoptimized
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
            {/* Conditional User Display for Mobile Menu */}
            {isAuthenticated && user ? (
              <div className="relative flex items-center gap-2 group text-black">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-black cursor-pointer">
                  <Image
                    src={getProfileImageUrl(user.profile_picture)}
                    alt={user.first_name || user.name || "User Profile"}
                    fill
                    className="object-cover"
                    unoptimized={user.profile_picture?.startsWith("http")}
                    onError={(e) => {
                      console.error("Image loading error (mobile menu):", e);
                      e.currentTarget.src = "/profile.png";
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold`}>
                  Hi, {user.first_name || user.name || "User"}
                </span>
                <div className="tooltip-container ml-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      handleCloseMenu();
                    }}
                    className={`ml-2 flex items-center gap-1 font-semibold hover:text-red-500`}
                    aria-label="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                  <span className="tooltip-text">Do you want to log out?</span>
                </div>
              </div>
            ) : (
              <div className="relative cursor-pointer">
                <Link href="/login" className="flex items-center gap-1">
                  <CircleUserRound size={24} color="black" />
                  <span className="text-sm font-semibold text-black hidden sm:inline">
                    Sign In / Sign Up
                  </span>
                </Link>
              </div>
            )}

            {/* Wishlist Icon (Mobile Menu) */}
            {/* <div className="relative cursor-pointer">
              <Heart size={24} color="black" onClick={handleWishlistClick} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div> */}

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
