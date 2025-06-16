// // components/checkout/GuestLoginPrompt.tsx
// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { loginCustomer } from "@/app/API_Calls/auth";
// import {
//   setAuthLoading,
//   setAuthSuccess,
//   setAuthError,
// } from "@/app/Redux/Slices/authSlice";

// const GuestLoginPrompt: React.FC = () => {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const [email, setEmail] = useState(""); // For guest checkout (future: collect email for guest orders)
//   const [password, setPassword] = useState("");
//   const [loginError, setLoginError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLoginSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoginError(null);
//     setIsLoading(true);
//     dispatch(setAuthLoading(true));

//     try {
//       const data = await loginCustomer({ username: email, password });
//       if (data.token && data.user) {
//         localStorage.setItem("userToken", data.token);
//         localStorage.setItem("userData", JSON.stringify(data.user));
//         dispatch(setAuthSuccess({ user: data.user, token: data.token }));
//         // Optionally redirect or refresh page after login
//         router.refresh(); // Refresh current page to re-evaluate auth state
//       } else {
//         throw new Error("Login successful but no token or user data received.");
//       }
//     } catch (error: any) {
//       const errorMessage =
//         error.responseBody?.detail ||
//         error.message ||
//         "Login failed. Please check your credentials.";
//       setLoginError(errorMessage);
//       dispatch(setAuthError(errorMessage));
//       console.error("Login error:", error);
//     } finally {
//       setIsLoading(false);
//       dispatch(setAuthLoading(false));
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-800">
//         Already have an account?
//       </h2>
//       <p className="text-gray-600 mb-6">
//         Log in to continue with your saved addresses and faster checkout.
//       </p>

//       {loginError && (
//         <div
//           className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
//           role="alert"
//         >
//           <span className="block sm:inline">{loginError}</span>
//         </div>
//       )}

//       <form onSubmit={handleLoginSubmit} className="space-y-4">
//         <div>
//           <label
//             htmlFor="checkout-login-email"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Email / Username
//           </label>
//           <input
//             type="text"
//             id="checkout-login-email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
//             required
//             autoComplete="username"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="checkout-login-password"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Password
//           </label>
//           <input
//             type="password"
//             id="checkout-login-password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
//             required
//             autoComplete="current-password"
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
//           disabled={isLoading}
//         >
//           {isLoading ? "Logging in..." : "Log In"}
//         </button>
//       </form>

//       <div className="mt-6 text-center">
//         <p className="text-gray-600">
//           Don't have an account?{" "}
//           <Link
//             href="/login"
//             className="text-blue-500 hover:underline font-medium"
//           >
//             Register here
//           </Link>
//         </p>
//         {/* Optional: Add guest checkout form here if you want to allow it */}
//         {/* <p className="mt-4 text-gray-600">
//           Or continue as a guest:
//         </p>
//         <button
//           onClick={() => alert("Guest checkout not fully implemented yet!")}
//           className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
//         >
//           Continue as Guest
//         </button> */}
//       </div>
//     </div>
//   );
// };

// export default GuestLoginPrompt;
