"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/app/Redux/Store/store";
import { RootState } from "@/app/Redux/Store/store";
import {
  registerUser,
  resetAuthStatus,
  resetEmailVerification,
  sendOtp,
  verifyOtp,
} from "@/app/Redux/Store/authSlice";

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Local states for form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(new Array(6).fill("")); // Assuming a 6-digit OTP
  // Corrected type for otpInputRefs to be an array of HTMLInputElement or null
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]); // Ref for each OTP input box

  // Redux states
  const dispatch = useDispatch<AppDispatch>();
  const { otpSent, isEmailVerified, loading, error, registrationSuccess } =
    useSelector((state: RootState) => state.auth);

  // Reset auth status & local states when switching between sign-in/sign-up
  useEffect(() => {
    dispatch(resetAuthStatus());
    setFullName("");
    setEmail("");
    setPassword("");
    setOtpDigits(new Array(6).fill("")); // Reset OTP digits
  }, [isSignIn, dispatch]);

  // Handle Send OTP button click
  const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    dispatch(sendOtp(email));
  };

  // Handle OTP input changes
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    // Allow only one digit and ensure it's a number
    if (!/^\d*$/.test(value) || value.length > 1) {
      return;
    }

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Auto-focus to the next input if a digit was entered
    if (value && index < otpDigits.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP input key down (for backspace)
  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      // If current input is empty and backspace is pressed, move to previous input
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP button click
  const handleVerifyOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fullOtp = otpDigits.join(""); // Combine digits to form full OTP
    if (!email || fullOtp.length !== otpDigits.length) {
      // Check if all digits are entered
      alert("Please enter your email and a complete OTP.");
      return;
    }
    dispatch(verifyOtp({ email, otp: fullOtp }));
  };

  // Handle final registration submission
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName || !email || !password || !isEmailVerified) {
      alert("Please fill in all fields and verify your email.");
      return;
    }
    // Reverted payload to only fullName, email, and password
    dispatch(registerUser({ fullName, email, password }));
  };

  // After successful registration, switch to sign-in page and reset status
  useEffect(() => {
    if (registrationSuccess) {
      alert("Registration successful! Please sign in.");
      setIsSignIn(true);
      dispatch(resetAuthStatus());
    }
  }, [registrationSuccess, dispatch]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[900px] h-[400px] bg-white rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Panel */}
        <motion.div
          key={isSignIn ? "signin" : "signup"}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4 }}
          className="w-1/2 p-6 flex flex-col justify-center items-center text-center"
        >
          {/* Logo */}
          <div className="my-3">
            <Image src="/MangoLogo.webp" alt="Logo" width={90} height={50} />
          </div>

          {/* Heading with underline */}
          <div className="mb-3 text-center">
            <h2 className="text-xl font-bold text-green-600 inline-block">
              {isSignIn ? "Sign in to Account" : "Create Account"}
            </h2>
            <div
              className="h-[2px] bg-orange-500 mt-1 mx-auto"
              style={{ width: "100%", maxWidth: "180px" }}
            ></div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/facebook.svg"
              alt="Facebook"
              width={25}
              height={25}
              className="cursor-pointer"
            />
            <Image
              src="/linkedin.svg"
              alt="LinkedIn"
              width={25}
              height={25}
              className="cursor-pointer"
            />
            <Image
              src="/google.svg"
              alt="Google"
              width={25}
              height={25}
              className="cursor-pointer"
            />
          </div>

          <p className="text-xs text-gray-500 mb-3">
            or use your email account
          </p>

          {/* Form Fields */}
          <form
            className="space-y-3 w-full max-w-[280px] text-left"
            onSubmit={isSignIn ? undefined : handleRegister}
          >
            {!isSignIn && (
              <>
                {/* Email Field - Always visible during Sign Up */}
                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (otpSent || isEmailVerified) {
                        dispatch(resetEmailVerification());
                      }
                    }}
                    disabled={isEmailVerified || otpSent} // Disable email input once OTP is sent
                    required
                  />
                  {isEmailVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs">
                      Verified!
                    </span>
                  )}
                  {otpSent && !isEmailVerified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs">
                      OTP Sent!
                    </span>
                  )}
                </div>

                {/* OTP Fields - Only visible if OTP has been sent and email is not yet verified */}
                {otpSent && !isEmailVerified && (
                  <div className="flex justify-center gap-2">
                    {" "}
                    {/* Flex container for OTP boxes */}
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-10 h-10 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        // FIX: Changed to a block statement for ref assignment to satisfy TypeScript
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        disabled={loading === "pending"}
                      />
                    ))}
                  </div>
                )}

                {/* Full Name and Password fields - Only visible if email is verified */}
                {isEmailVerified && (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Image
                        src={showPassword ? "/eye-open.svg" : "/eye-closed.svg"}
                        alt="Toggle password visibility"
                        width={18}
                        height={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {isSignIn && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Image
                    src={showPassword ? "/eye-open.svg" : "/eye-closed.svg"}
                    alt="Toggle password visibility"
                    width={18}
                    height={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className="text-green-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </>
            )}

            {/* Display error messages */}
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            {registrationSuccess && !isSignIn && (
              <p className="text-green-600 text-xs mt-2">
                Registration successful!
              </p>
            )}

            {/* Main Action Button Area */}
            {isSignIn ? (
              <button
                type="submit"
                className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                disabled={loading === "pending"}
              >
                {loading === "pending" ? "Signing In..." : "Sign In"}
              </button>
            ) : (
              // Signup flow buttons
              <>
                {!otpSent && !isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending"}
                  >
                    {loading === "pending" ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}

                {otpSent && !isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending"}
                  >
                    {loading === "pending" ? "Verifying OTP..." : "Verify OTP"}
                  </button>
                )}

                {isEmailVerified && (
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending"}
                  >
                    {loading === "pending" ? "Registering..." : "Register"}
                  </button>
                )}
              </>
            )}
          </form>

          {/* Switch Form Link */}
          <div className="mt-4 text-xs">
            {isSignIn ? (
              <>
                Don't have an account?{" "}
                <span
                  className="cursor-pointer text-green-600 hover:underline"
                  onClick={() => setIsSignIn(false)}
                >
                  Create Account
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="cursor-pointer text-green-600 hover:underline"
                  onClick={() => setIsSignIn(true)}
                >
                  Sign In
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          key={isSignIn ? "right-signin" : "right-signup"}
          initial={{ opacity: 0, x: isSignIn ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignIn ? -50 : 50 }}
          transition={{ duration: 0.4 }}
          className="w-1/2 bg-[#52BA8C] text-white flex flex-col justify-center items-center p-6 relative"
        >
          {isSignIn ? (
            <>
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <div
                className="h-[2px] bg-white mt-1 mx-auto mb-4"
                style={{ width: "60px" }}
              ></div>
              <p className="text-sm text-center max-w-xs mb-8">
                Fill up personal information and start journey with us.
              </p>
              <button
                className="border-2 border-white text-white py-2 px-8 rounded-full hover:bg-white hover:text-[#52BA8C] transition-colors duration-300"
                onClick={() => setIsSignIn(false)}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <div
                className="h-[2px] bg-white mt-1 mx-auto mb-4"
                style={{ width: "60px" }}
              ></div>
              <p className="text-sm text-center max-w-xs mb-8">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="border-2 border-white text-white py-2 px-8 rounded-full hover:bg-white hover:text-[#52BA8C] transition-colors duration-300"
                onClick={() => setIsSignIn(true)}
              >
                Sign In
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
