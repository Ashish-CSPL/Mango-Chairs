// app/login/page.tsx

"use client";
import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer, loginCustomer } from "@/app/API_Calls/auth";

import { RegistrationData } from "@/types/Auth"; // Ensure this import is correct
import { useDispatch } from "react-redux";
import { setAuthSuccess } from "../Redux/Slices/authSlice";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);

  // --- Login Form State ---
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const dispatch = useDispatch();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const data = await loginCustomer({
        email: loginUsername, // Sends loginUsername as 'email' which maps to 'username' in backend
        password: loginPassword,
      });
      console.log("Login successful response data:", data);

      if (data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data));
        dispatch(setAuthSuccess(data))
        
        alert("Login successful!");
        router.push("/");
      } else {
        throw new Error("Login successful but no token received.");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      setLoginError(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- Registration Form States ---
  const [registerEmail, setRegisterEmail] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [registerPassword, setRegisterPassword] = useState("");

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    } else {
      setProfilePicture(null);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    setIsRegistering(true);
    try {
      const registrationData: RegistrationData = {
        email: registerEmail,
        name: name,
        profile: profilePicture || undefined, // Use 'profile' as per your type
        password: registerPassword,
      };
      const data = await registerCustomer(registrationData);
      console.log("Registration successful:", data);
      alert("Registration successful! You can now log in.");

      setIsLoginView(true);
      setLoginUsername(registerEmail);

      // Clear registration form fields
      setRegisterEmail("");
      setName("");
      setProfilePicture(null);
      setRegisterPassword("");
    } catch (error: any) {
      console.error("Error during registration:", error.message);
      setRegisterError(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
          {isLoginView ? "Welcome Back!" : "Join Us!"}
        </h1>

        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            onClick={() => setIsLoginView(true)}
            className={`py-3 px-6 text-lg font-semibold transition-colors duration-200 ${
              isLoginView
                ? "border-b-2 border-orange-500 text-orange-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLoginView(false);
              setRegisterError(null); // Clear any previous registration errors
            }}
            className={`py-3 px-6 text-lg font-semibold transition-colors duration-200 ${
              !isLoginView
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Register
          </button>
        </div>

        {isLoginView ? (
          // Login Form
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Sign In
            </h2>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-gray-700"
              >
                Email/Username
              </label>
              <input
                type="text"
                id="login-username"
                name="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder=""
              />
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-orange-600 hover:underline block text-right"
            >
              Forgot Password?
            </Link>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </button>
          </form>
        ) : (
          // Registration Form (direct)
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Create Account
            </h2>
            {registerError && (
              <p className="text-red-500 text-sm">{registerError}</p>
            )}

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input Field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="register-email"
                name="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                placeholder="yourname@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="register-password"
                name="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                placeholder="Minimum 8 characters"
              />
            </div>

            {/* Profile Picture Input Field */}
            <div>
              <label
                htmlFor="profile-picture"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Picture (Optional)
              </label>
              <input
                type="file"
                id="profile-picture"
                name="profile_picture"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {profilePicture && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected: {profilePicture.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={isRegistering}
            >
              {isRegistering ? "Registering..." : "Complete Registration"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-600">
          {isLoginView ? (
            <>
              New to Mango?{" "}
              <button
                onClick={() => {
                  setIsLoginView(false);
                  setRegisterError(null);
                }}
                className="text-blue-500 hover:underline font-medium"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsLoginView(true);
                  setLoginError(null);
                }}
                className="text-orange-500 hover:underline font-medium"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
