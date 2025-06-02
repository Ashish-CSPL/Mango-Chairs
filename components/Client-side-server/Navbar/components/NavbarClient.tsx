// components/Navbar/Navbar.client.tsx
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
} from "lucide-react";
import { useRouter } from "next/navigation";
// REMOVED: import { NEXT_PUBLIC_API_BASE_URL } from "@/api/fetchdata"; // THIS LINE IS INCORRECT AND REMOVED

// --- REDUX IMPORTS ---
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store"; // Adjust path if necessary
import { CartItem } from "@/app/Redux/Store/cartSlice"; // Import CartItem for stronger typing

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

// Define a type for the stored user data structure
interface UserData {
  first_name?: string; // Made optional as it might be missing or null
  last_name?: string;
  profile_picture?: string; // URL string for the profile picture (could be relative or absolute)
  email: string; // Including email just in case needed for display or debugging
  // Add other fields you might store, e.g., id, phone_number
}

// --- REDUX SELECTOR FUNCTION ---
// This function takes the RootState and calculates the total quantity of items in the cart
const selectCartCount = (state: RootState): number => {
  return state.cart.cartItems.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  );
};

const NavbarClient: React.FC<NavbarClientProps> = ({
  navData = [],
  categories = [],
}) => {
  const router = useRouter();

  // --- Authentication State Management ---
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Effect to load user data from localStorage on component mount
  useEffect(() => {
    // Ensure this runs only in the browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("userToken");
      const storedUserData = localStorage.getItem("userData");
      if (token && storedUserData) {
        setUserToken(token);
        try {
          // Attempt to parse the stored user data JSON
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          console.log(
            "Navbar: Loaded userData from localStorage:",
            parsedUserData
          ); // Debugging log
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          // If parsing fails, clear invalid data to prevent persistent errors
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
          setUserToken(null);
          setUserData(null);
        }
      }
    }
  }, []); // Empty dependency array means this effect runs once after the initial render

  // Handles user logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userToken"); // Remove token from storage
      localStorage.removeItem("userData"); // Remove user data from storage
    }
    setUserToken(null); // Clear token state
    setUserData(null); // Clear user data state
    router.push("/login"); // Redirect to the login page
  };

  // --- REDUX CART STATE INTEGRATION ---
  // Use useSelector to get the actual cart count from the Redux store
  const cartCount = useSelector(selectCartCount);
  // Use useSelector to get the actual cart items array from the Redux store
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  // --- Existing Navbar States & Handlers ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Effect to handle scroll-based styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Closes mobile menu and dropdowns
  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
    setShowMobileDropdown(false);
  };

  // Determine icon and text color based on scroll state and login status
  // This logic ensures icons are visible against varying background colors
  const iconColor =
    !isScrolled && !isMobileMenuOpen && !userToken ? "white" : "black";
  const dynamicTextColor =
    isScrolled || isMobileMenuOpen ? "text-black" : "text-white";

  // Renders the desktop category dropdown
  const renderCategoryDropdown = () => (
    <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 z-50 w-[50vw] max-w-2xl bg-white/30 backdrop-blur-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl">
      {categories?.map((cat) => {
        // Construct correct image URL: if relative, append to base domain
        const imageSrc = cat.image.startsWith("http")
          ? cat.image
          : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "")}${
              cat.image
            }`;
        // Corrected: Use process.env.NEXT_PUBLIC_API_BASE_URL directly here
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

  // Renders the mini cart dropdown
  const renderMiniCart = () => (
    <div
      onMouseLeave={() => setShowMiniCart(false)}
      className="absolute right-0 top-full mt-2 w-80 max-w-full bg-white shadow-lg rounded-lg p-4 z-50"
      style={{ minWidth: "320px" }}
    >
      <h3 className="font-semibold text-lg mb-3 border-b pb-2">Cart Items</h3>
      {cartItems && cartItems.length > 0 ? (
        <ul className="max-h-64 overflow-y-auto">
          {cartItems.map(
            (
              item: CartItem,
              index: number // Use CartItem type here
            ) => (
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
                  {/* Ensure price is formatted */}
                </p>
              </li>
            )
          )}
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

  // Helper function to get the full profile image URL
  const getProfileImageUrl = (path?: string) => {
    if (!path) {
      console.log("Navbar: No profile picture path provided."); // Debugging log
      return "/images/default-profile.png"; // Fallback if no path is provided
    }

    // If the path is already an absolute URL, use it directly
    if (path.startsWith("http://") || path.startsWith("https://")) {
      console.log("Navbar: Absolute profile image URL:", path); // Debugging log
      return path;
    }

    // Construct the full URL for relative paths:
    // Remove '/api/v1' from the base URL to get the domain root, then append the path.
    // Example: https://nxadmin.consociate.co.in/api/v1 becomes https://nxadmin.consociate.co.in
    // Then append /media/profiles/image.jpg
    // Corrected: Use process.env.NEXT_PUBLIC_API_BASE_URL directly here
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      console.error(
        "Navbar Error: NEXT_PUBLIC_API_BASE_URL is not defined for image URL construction."
      );
      return "/images/default-profile.png"; // Fallback if URL is missing
    }

    const baseUrlParts = baseUrl.split("/api/v1");
    const imageUrl = `${baseUrlParts[0]}${
      path.startsWith("/") ? path : `/${path}`
    }`; // Ensure leading slash for path
    console.log("Navbar: Constructed relative profile image URL:", imageUrl); // Debugging log
    return imageUrl;
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
        sm:top-[10px] sm:mt-[10px]
        md:top-[14px] md:mt-[8px]
        lg:top-[30px] lg:mt-[0px]
        `}
        style={{
          // Adjust top/marginTop for a sticky effect without initial offset
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
                  priority // Prioritize loading for LCP
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden lg:flex items-center space-x-8 group relative">
              {navData?.map((navItem, index) =>
                index === 1 ? ( // Assuming second item is 'Shop By Category'
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

            {/* Desktop Right Section: Search, User, Cart */}
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
              {userToken && userData ? (
                // If user is logged in
                <div className="relative flex items-center gap-2 group">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white cursor-pointer">
                    <Image
                      src={getProfileImageUrl(userData.profile_picture)}
                      alt={userData.first_name || "User"}
                      fill
                      className="object-cover"
                      unoptimized // Use unoptimized for external images to avoid Next.js Image component optimization issues
                    />
                  </div>
                  {/* DISPLAY USER NAME HERE */}
                  <span className={`text-sm font-semibold ${dynamicTextColor}`}>
                    Hi, {userData.first_name || "User"}{" "}
                    {/* Fallback to 'User' if first_name is missing */}
                  </span>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`ml-2 flex items-center gap-1 font-semibold hover:text-red-500 ${dynamicTextColor}`}
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                // If user is not logged in
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

              {/* Shopping Cart Icon */}
              <div
                onMouseEnter={() => setShowMiniCart(true)}
                onMouseLeave={() => setShowMiniCart(false)}
                className="relative cursor-pointer"
              >
                <Link href="/cart">
                  <ShoppingBag size={24} color={iconColor} />
                  {/* Now cartCount is correctly typed as number */}
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {showMiniCart && renderMiniCart()}
              </div>
            </div>

            {/* Mobile/Tablet Icons (Search, User, Cart, Menu Toggle) */}
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
              {userToken && userData ? (
                <div className="relative flex items-center gap-2 group text-black">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-black cursor-pointer">
                    <Image
                      src={getProfileImageUrl(userData.profile_picture)}
                      alt={userData.first_name || "User"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {/* DISPLAY USER NAME HERE */}
                  <span className={`text-sm font-semibold`}>
                    Hi, {userData.first_name || "User"}{" "}
                    {/* Fallback to 'User' */}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`ml-2 flex items-center gap-1 font-semibold hover:text-red-500 text-black`}
                  >
                    <LogOut size={20} />
                  </button>
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
              className="md:hidden text-white" // Default color for mobile button when not scrolled
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
          onClick={handleCloseMenu} // Close menu when clicking outside
        />

        {/* Mobile Menu Content */}
        <div
          className={`mobile-menu fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-6 flex flex-col space-y-6
          ${isMobileMenuOpen ? "open" : ""}`}
          style={{ top: 64 }} // Position below the main nav bar
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
                      // Corrected: Use process.env.NEXT_PUBLIC_API_BASE_URL directly here
                      return (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.id}`}
                          className="flex items-center gap-3 py-2 text-black hover:text-orange-500"
                          onClick={handleCloseMenu} // Close menu when category is clicked
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
                    onClick={handleCloseMenu} // Close menu when link is clicked
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
            {userToken && userData ? (
              <div className="relative flex items-center gap-2 group text-black">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-black cursor-pointer">
                  <Image
                    src={getProfileImageUrl(userData.profile_picture)}
                    alt={userData.first_name || "User"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                {/* DISPLAY USER NAME HERE */}
                <span className={`text-sm font-semibold`}>
                  Hi, {userData.first_name || "User"} {/* Fallback to 'User' */}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    handleCloseMenu();
                  }} // Also close mobile menu on logout
                  className={`ml-2 flex items-center gap-1 font-semibold hover:text-red-500`}
                >
                  <LogOut size={20} />
                </button>
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
