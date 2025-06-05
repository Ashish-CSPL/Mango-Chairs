// app/login/page.tsx (No changes to this file based on your request)

"use client";
import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sendOtpForVerification,
  verifyOtp,
  registerCustomer,
  loginCustomer,
} from "@/app/API_Calls/auth";

import { RegistrationData } from "@/types/Auth";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);

  // --- Login Form State ---
  // FIX: Renamed loginEmail to loginUsername
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      // FIX: Changed 'email' to 'username' when calling loginCustomer
      const data = await loginCustomer({
        username: loginUsername, // Pass the state variable that holds the email as 'username'
        password: loginPassword,
      });
      console.log("Login successful response data:", data);

      if (data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data));
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
  const [registrationStage, setRegistrationStage] = useState<
    "emailVerification" | "otpVerification" | "registrationForm"
  >("emailVerification");
  const [registerEmail, setRegisterEmail] = useState(""); // This is fine for the registration flow's email field
  const [otp, setOtp] = useState("");

  // States for all registration form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setIsSendingOtp(true);
    try {
      const data = await sendOtpForVerification(registerEmail);
      console.log("OTP sent successfully:", data);
      alert("OTP sent to your email!");
      setRegistrationStage("otpVerification");
    } catch (error: any) {
      console.error("Error sending OTP:", error.message);
      setRegisterError(
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setIsVerifyingOtp(true);
    try {
      const data = await verifyOtp(registerEmail, otp);
      console.log("OTP verified successfully:", data);
      alert("Email verified successfully!");
      setRegistrationStage("registrationForm");
    } catch (error: any) {
      console.error("Error verifying OTP:", error.message);
      setRegisterError(
        error.message || "OTP verification failed. Please check the OTP."
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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

    if (registerPassword !== confirmPassword) {
      setRegisterError("Password and Confirm Password do not match.");
      return;
    }

    setIsRegistering(true);
    try {
      const registrationData: RegistrationData = {
        email: registerEmail, // Keep as 'email' for registration if your backend API expects it for registration
        otp: otp,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country_code_for_phone_number: countryCode,
        profile_picture: profilePicture || undefined,
        address: address,
        locality: locality,
        city: city,
        state: state,
        country: country,
        zipcode: zipcode,
        password: registerPassword,
        confirm_password: confirmPassword,
      };
      const data = await registerCustomer(registrationData);
      console.log("Registration successful:", data);
      alert("Registration successful! You can now log in.");

      setIsLoginView(true);
      // FIX: Pre-fill loginUsername with the registered email
      setLoginUsername(registerEmail);
      setRegistrationStage("emailVerification");

      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setCountryCode("+91");
      setProfilePicture(null);
      setAddress("");
      setLocality("");
      setCity("");
      setState("");
      setCountry("");
      setZipcode("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRegisterEmail("");
      setOtp("");
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
              setRegistrationStage("emailVerification");
              setRegisterError(null);
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
              {/* FIX: htmlFor and id for login email input */}
              <label
                htmlFor="login-username" // Changed from login-email
                className="block text-sm font-medium text-gray-700"
              >
                Email/Username
              </label>
              <input
                type="text" // Can be type="text" now as it's 'username'
                id="login-username" // Changed from login-email
                name="username" // Changed name to 'username'
                value={loginUsername} // Bind to loginUsername state
                onChange={(e) => setLoginUsername(e.target.value)} // Update loginUsername state
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
          // Registration Flow (multi-stage) - No changes here, assuming registration still uses 'email' field
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Create Account
            </h2>
            {registerError && (
              <p className="text-red-500 text-sm">{registerError}</p>
            )}

            {/* Stage 1: Email Verification */}
            {registrationStage === "emailVerification" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="register-email-otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email for Verification
                  </label>
                  <input
                    type="email"
                    id="register-email-otp"
                    name="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="yourname@example.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* Stage 2: OTP Verification */}
            {registrationStage === "otpVerification" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-gray-600">
                  OTP sent to:{" "}
                  <span className="font-medium">{registerEmail}</span>
                </p>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder=""
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setRegistrationStage("emailVerification")}
                  className="w-full mt-2 text-blue-500 hover:underline text-sm"
                >
                  Change Email / Resend OTP
                </button>
              </form>
            )}

            {/* Stage 3: Full Registration Form (only visible after OTP verified) */}
            {registrationStage === "registrationForm" && (
              <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                <p className="text-green-600 text-sm font-medium">
                  Email verified! Please complete your registration.
                </p>

                {/* First Name */}
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="Doe"
                  />
                </div>

                {/* Phone Number with Country Code */}
                <div>
                  <label
                    htmlFor="phone-number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      id="country-code"
                      name="country_code_for_phone_number"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA/Canada)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                    <input
                      type="tel"
                      id="phone-number"
                      name="phone_number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="flex-1 block w-full px-4 py-2 border border-gray-300 rounded-r-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                {/* PROFILE PICTURE INPUT FIELD */}
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

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="123 Main St"
                  />
                </div>

                {/* Locality */}
                <div>
                  <label
                    htmlFor="locality"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Locality
                  </label>
                  <input
                    type="text"
                    id="locality"
                    name="locality"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="Downtown"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="Pune"
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="Maharashtra"
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="India"
                  />
                </div>

                {/* Zipcode */}
                <div>
                  <label
                    htmlFor="zipcode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Zipcode
                  </label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="411001"
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-base text-black"
                    placeholder="Confirm your password"
                  />
                  {registerPassword &&
                    confirmPassword &&
                    registerPassword !== confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        Passwords do not match!
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
                  disabled={
                    isRegistering || registerPassword !== confirmPassword
                  }
                >
                  {isRegistering ? "Registering..." : "Complete Registration"}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-gray-600">
          {isLoginView ? (
            <>
              New to Mango?{" "}
              <button
                onClick={() => {
                  setIsLoginView(false);
                  setRegistrationStage("emailVerification");
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
