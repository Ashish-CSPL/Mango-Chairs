import React, { RefObject } from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import { User } from "@/app/Redux/Store/authSlice"; // Assuming User type is exported

interface UserIconSectionProps {
  user: User | null;
  showLogoutDropdown: boolean;
  setShowLogoutDropdown: (show: boolean) => void;
  handleLogout: () => void;
  dynamicTextColor: string;
  iconColor: string;
  userIconRef: RefObject<HTMLDivElement>; // Pass the ref from parent
}

const UserIconSection: React.FC<UserIconSectionProps> = ({
  user,
  showLogoutDropdown,
  setShowLogoutDropdown,
  handleLogout,
  dynamicTextColor,
  iconColor,
  userIconRef, // Receive the ref here
}) => {
  const getProfileImageUrl = (path: string | undefined | null) => {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://nxadmin.consociate.co.in";
    if (!path) {
      return "/default-profile-placeholder.png";
    }
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${BASE_URL}${path}`;
  };

  return (
    <div ref={userIconRef} className="relative cursor-pointer">
      {user ? (
        <div
          className="flex flex-col items-center justify-center space-y-1" // Added space-y-1
          onClick={(event) => {
            event.stopPropagation();
            console.log("CLICK_TEST: User icon clicked! (Section)");
            setShowLogoutDropdown(!showLogoutDropdown);
            console.log(
              "NAVBAR_USER_ICON_CLICKED (Section): Toggling logout dropdown. New state:",
              !showLogoutDropdown
            );
          }}
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300">
            {" "}
            {/* w-7 h-7 for image */}
            <Image
              src={getProfileImageUrl(user.profile_picture)}
              alt={`${user.first_name || ""} ${user.last_name || ""} Profile`}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/default-profile-placeholder.png";
              }}
            />
          </div>
          <span
            className={`text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] text-center ${dynamicTextColor}`} // text-xs and max-w-[60px] for name
          >
            {user.first_name}
          </span>
        </div>
      ) : (
        <Link href="/Login" className="flex items-center gap-1">
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
      )}
      {showLogoutDropdown && user && (
        <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md overflow-hidden z-50">
          <button
            onClick={(event) => {
              event.stopPropagation();
              console.log(
                "NAVBAR_LOGOUT_BUTTON_CLICKED (Section): Logout button was clicked!"
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
  );
};

export default UserIconSection;
