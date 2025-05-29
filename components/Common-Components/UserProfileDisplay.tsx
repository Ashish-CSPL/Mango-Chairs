// components/UserProfileDisplay.tsx
"use client"; // This component must be a Client Component

import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store"; // Adjust path if your store.ts is elsewhere
import Image from "next/image";

export default function UserProfileDisplay() {
  const user = useSelector((state: RootState) => state.auth.user);

  // --- IMPORTANT: Define your backend's base URL ---
  const BASE_URL = "https://nxadmin.consociate.co.in"; // Replace with your actual backend base URL if different

  // Construct the full profile image URL, with a fallback to a default image
  const profileImageUrl = user?.profile_picture
    ? `${BASE_URL}${user.profile_picture}` // Combine base URL with the relative path from backend
    : "/default-profile-placeholder.png"; // Path to a default image in your /public folder

  // --- For Debugging: Check console for these logs after login ---
  console.log("UserProfileDisplay: User data from Redux:", user);
  console.log(
    "UserProfileDisplay: Constructed Profile Image URL:",
    profileImageUrl
  );
  // --- End Debugging ---

  // Render nothing or a login prompt if user is not available
  if (!user) {
    return (
      <div className="p-4 text-gray-700 text-center">
        Please log in to view your profile information.
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto my-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500 flex-shrink-0">
        <Image
          src={profileImageUrl}
          alt={user.first_name || "User Profile"} // Alt text for accessibility
          layout="fill" // Image will fill its parent container
          objectFit="cover" // Image will cover the area, cropping if necessary
          className="rounded-full" // Apply border-radius to the image itself for a circular shape
          onError={(e) => {
            // Fallback if the dynamic image fails to load
            console.error("Error loading profile image:", e);
            e.currentTarget.src = "/default-profile-placeholder.png"; // Set fallback image directly
          }}
        />
      </div>
      <div className="text-left">
        <h2 className="text-xl font-bold text-gray-900">
          {user.first_name || "Unknown"}
        </h2>
        <p className="text-sm text-gray-600">{user.email}</p>
      </div>
    </div>
  );
}
