// components/Navbar/Navbar.client.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleUserRound, ShoppingBag, Menu, X, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { User, logout } from "@/app/Redux/Store/authSlice";
import { useRouter } from "next/navigation";
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
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);
  console.log("NAVBAR_INIT: User object from Redux state on render:", user);

  const cartCount = useSelector((state: RootState) => state.cart.cartCount);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false); // State to control logout dropdown visibility
  const [searchTerm, setSearchTerm] = useState("");

  // Ref to attach to the user icon div, encompassing the dropdown as well
  const userIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for handling clicks outside the user icon/logout dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the dropdown is not currently open, or the ref hasn't been set yet,
      // or if the click occurred INSIDE the userIconRef (which contains both the trigger and dropdown),
      // then we do nothing.
      if (
        !showLogoutDropdown ||
        !userIconRef.current ||
        userIconRef.current.contains(event.target as Node)
      ) {
        return;
      }

      // If the click is outside the ref AND the dropdown is open, then close it.
      console.log(
        "NAVBAR_CLICK_OUTSIDE: Clicked outside user icon, closing dropdown."
      );
      setShowLogoutDropdown(false);
    };

    // Only attach the event listener WHEN the `showLogoutDropdown` state is true.
    if (showLogoutDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function: remove the listener when the component unmounts
    // or when `showLogoutDropdown` changes to false
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutDropdown]); // This effect re-runs whenever `showLogoutDropdown` changes

  const handleCloseMenu = () => {
    setIsMobileMenuOpen(false);
    setShowMobileDropdown(false);
  };

  const iconColor = !isScrolled && !isMobileMenuOpen ? "white" : "black";
  const dynamicTextColor =
    isScrolled || isMobileMenuOpen ? "text-black" : "text-white";

  const getProfileImageUrl = (path: string | undefined | null) => {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://nxadmin.consociate.co.in";
    if (!path) {
      return "/default-profile-placeholder.png"; // Fallback to a default image if path is null/undefined
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${BASE_URL}${path}`;
  };

  const handleLogout = () => {
    console.log("NAVBAR_LOGOUT_HANDLER: handleLogout function called!");

    dispatch(logout()); // Dispatch the logout action

    // Optional: A small delay to ensure Redux state update and localStorage clear
    // before redirection, though usually not strictly necessary with Redux Persist.
    setTimeout(() => {
      console.log(
        "NAVBAR: Redux state immediately AFTER dispatch(logout()) and short delay:",
        user
      );
      setShowLogoutDropdown(false); // Close dropdown
      router.push("/Login"); // Redirect to login page
      console.log("NAVBAR: Redirected to /Login.");
    }, 50);
  };

  const renderCategoryDropdown = () => (
    <div className="absolute left-1/2 top-full transform -translate-x-1/2 mt-2 z-50 w-[50vw] max-w-2xl bg-white/30 backdrop-blur-lg shadow-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl">
      {categories?.map((cat) => {
        const imageSrc = cat.image.startsWith("/")
          ? `${
              process.env.NEXT_PUBLIC_API_BASE_URL ||
              "https://nxadmin.consociate.co.in"
            }${cat.image}`
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

              {/* User Icon and Logout Dropdown (Desktop) */}
              <div ref={userIconRef} className="relative cursor-pointer">
                {user ? ( // Conditional rendering based on `user` state
                  <div
                    // Changed -space-y-1 to space-y-1 to add space
                    className="flex flex-col items-center justify-center space-y-1"
                    onClick={(event) => {
                      event.stopPropagation(); // Prevents click from bubbling to document and closing immediately
                      console.log("CLICK_TEST: User icon clicked! (Desktop)");
                      setShowLogoutDropdown(!showLogoutDropdown); // Toggle dropdown visibility
                      console.log(
                        "NAVBAR_USER_ICON_CLICKED: Toggling logout dropdown. New state:",
                        !showLogoutDropdown
                      );
                    }}
                  >
                    {/* Reduced image size from w-8 h-8 to w-7 h-7 */}
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={getProfileImageUrl(user.profile_picture)}
                        alt={`${user.first_name || ""} ${
                          user.last_name || ""
                        } Profile`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/default-profile-placeholder.png"; // Fallback image on error
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] text-center ${dynamicTextColor}`}
                    >
                      {user.first_name} {user.last_name?.charAt(0)}.
                    </span>
                  </div>
                ) : (
                  <Link href="/Login" className="flex items-center gap-1">
                    <CircleUserRound // Show this icon when not logged in
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
                )}
                {showLogoutDropdown &&
                  user && ( // Show dropdown only if `showLogoutDropdown` is true AND `user` is logged in
                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md overflow-hidden z-50">
                      <button
                        onClick={(event) => {
                          event.stopPropagation(); // Prevents click from bubbling and triggering outside click
                          console.log(
                            "NAVBAR_LOGOUT_BUTTON_CLICKED: Logout button was clicked! (Desktop)"
                          );
                          handleLogout(); // Call the actual logout handler
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
              </div>

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

              {/* Mobile/Tablet User Icon and Logout Dropdown */}
              <div ref={userIconRef} className="relative cursor-pointer">
                {user ? ( // Conditional rendering based on `user` state
                  <div
                    // Changed -space-y-1 to space-y-1 to add space
                    className="flex flex-col items-center justify-center space-y-1"
                    onClick={(event) => {
                      event.stopPropagation();
                      console.log("CLICK_TEST: User icon clicked! (Mobile)");
                      setShowLogoutDropdown(!showLogoutDropdown);
                      console.log(
                        "NAVBAR_USER_ICON_CLICKED (Mobile): Toggling logout dropdown. New state:",
                        !showLogoutDropdown
                      );
                    }}
                  >
                    {/* Reduced image size from w-8 h-8 to w-7 h-7 */}
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                      <Image
                        src={getProfileImageUrl(user.profile_picture)}
                        alt={`${user.first_name || ""} ${
                          user.last_name || ""
                        } Profile`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/default-profile-placeholder.png";
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] text-center text-black">
                      {user.first_name} {user.last_name?.charAt(0)}.
                    </span>
                  </div>
                ) : (
                  <Link href="/Login" className="flex items-center gap-1">
                    <CircleUserRound size={24} color="black" />
                    <span className="text-sm font-semibold text-black hidden sm:inline">
                      Sign In / Sign Up
                    </span>
                  </Link>
                )}
                {showLogoutDropdown &&
                  user && ( // Show dropdown only if `showLogoutDropdown` is true AND `user` is logged in
                    <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md overflow-hidden z-50">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          console.log(
                            "NAVBAR_LOGOUT_BUTTON_CLICKED (Mobile Menu): Logout button was clicked!"
                          );
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
              </div>

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
                      const imageSrc = cat.image.startsWith("/")
                        ? `${
                            process.env.NEXT_PUBLIC_API_BASE_URL ||
                            "https://nxadmin.consociate.co.in"
                          }${cat.image}`
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
            {/* Mobile Menu User Icon and Logout Dropdown */}
            <div ref={userIconRef} className="relative cursor-pointer">
              {user ? ( // Conditional rendering based on `user` state
                <div
                  // Changed -space-y-1 to space-y-1 to add space
                  className="flex flex-col items-center justify-center space-y-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log("CLICK_TEST: User icon clicked! (Mobile Menu)");
                    setShowLogoutDropdown(!showLogoutDropdown);
                    console.log(
                      "NAVBAR_USER_ICON_CLICKED (Mobile Menu): Toggling logout dropdown. New state:",
                      !showLogoutDropdown
                    );
                  }}
                >
                  {/* Reduced image size from w-8 h-8 to w-7 h-7 */}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
                    <Image
                      src={getProfileImageUrl(user.profile_picture)}
                      alt={`${user.first_name || ""} ${
                        user.last_name || ""
                      } Profile`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/default-profile-placeholder.png";
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] text-center text-black">
                    {user.first_name} {user.last_name?.charAt(0)}.
                  </span>
                </div>
              ) : (
                <Link href="/Login" className="flex items-center gap-1">
                  <CircleUserRound size={24} color="black" />
                  <span className="text-sm font-semibold text-black hidden sm:inline">
                    Sign In / Sign Up
                  </span>
                </Link>
              )}
              {showLogoutDropdown &&
                user && ( // Show dropdown only if `showLogoutDropdown` is true AND `user` is logged in
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md overflow-hidden z-50">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        console.log(
                          "NAVBAR_LOGOUT_BUTTON_CLICKED (Mobile Menu): Logout button was clicked!"
                        );
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
            </div>
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
