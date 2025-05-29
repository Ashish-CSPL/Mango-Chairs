// components/Client-side-server/Authentication/AuthForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/Redux/Store/store";
import {
  registerUser,
  resetAuthStatus,
  resetEmailVerification,
  sendOtp,
  verifyOtp,
  loginUser,
  forgotPassword,
  verifyResetPasswordOtp,
  resetPassword,
  resetPasswordResetStatus,
} from "@/app/Redux/Store/authSlice";

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // NEW: State for Forgot Password functionality
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState(""); // For password validation feedback

  // Local states for form inputs (all existing fields included)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasswordForSignUp, setConfirmPasswordForSignUp] = useState(""); // Renamed to avoid conflict

  const [otpDigits, setOtpDigits] = useState<string[]>(new Array(6).fill(""));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redux hooks for dispatching actions and selecting state
  const dispatch = useDispatch<AppDispatch>();
  const {
    otpSent,
    isEmailVerified,
    loading,
    error,
    registrationSuccess,
    token,
    resetPasswordOTPSent,
    resetPasswordOTPVerified,
    passwordResetSuccess,
  } = useSelector((state: RootState) => state.auth);

  // --- DEBUGGING: Log current state to console ---
  useEffect(() => {
    console.log(
      "AuthForm State - otpSent:",
      otpSent,
      "isEmailVerified:",
      isEmailVerified,
      "loading:",
      loading,
      "error:",
      error,
      "token:",
      token,
      "resetPasswordOTPSent:",
      resetPasswordOTPSent,
      "resetPasswordOTPVerified:",
      resetPasswordOTPVerified,
      "passwordResetSuccess:",
      passwordResetSuccess
    );
  }, [
    otpSent,
    isEmailVerified,
    loading,
    error,
    token,
    resetPasswordOTPSent,
    resetPasswordOTPVerified,
    passwordResetSuccess,
  ]);
  // --- END DEBUGGING ---

  // Effect to reset form and auth status when switching between sign-in/sign-up/forgot password
  useEffect(() => {
    dispatch(resetAuthStatus()); // Resets all auth-related states, including password reset ones
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCountryCode("+91");
    setProfilePicture(null);
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setPincode("");
    setEmail("");
    setPassword("");
    setConfirmPasswordForSignUp("");
    setOtpDigits(new Array(6).fill(""));
    setResetPasswordEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
    setNewPasswordError(""); // Clear password error on form switch
  }, [isSignIn, isForgotPassword, dispatch]);

  // Effect to handle successful registration
  useEffect(() => {
    if (registrationSuccess) {
      alert("Registration successful! Please sign in.");
      setIsSignIn(true); // Automatically switch to sign-in form
      dispatch(resetAuthStatus()); // Reset auth status including registrationSuccess
    }
  }, [registrationSuccess, dispatch]);

  // NEW: Effect to handle successful password reset
  useEffect(() => {
    if (passwordResetSuccess) {
      alert(
        "Password has been reset successfully! Please sign in with your new password."
      );
      setIsSignIn(true); // Switch to sign-in form
      setIsForgotPassword(false); // Exit forgot password mode
      dispatch(resetPasswordResetStatus()); // Reset password reset specific states
    }
  }, [passwordResetSuccess, dispatch]);

  // NEW: Password validation logic
  const validateNewPassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return "Password must contain at least one special character.";
    }
    return ""; // No error
  };

  // --- Handlers for Form Actions ---

  // Handles click on "Send OTP" button (for registration)
  const handleSendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    dispatch(sendOtp(email));
  };

  // Handles input changes for OTP fields
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value) || value.length > 1) {
      return;
    }

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    if (value && index < otpDigits.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handles key down events for OTP fields (e.g., backspace to previous field)
  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handles click on "Verify OTP" button (for registration)
  const handleVerifyOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (!email || fullOtp.length !== otpDigits.length) {
      alert("Please enter your email and a complete OTP.");
      return;
    }
    dispatch(verifyOtp({ email, otp: fullOtp }));
  };

  // Handles the final "Register" form submission to include OTP
  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fullOtp = otpDigits.join(""); // Get the OTP from state

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !countryCode ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !email ||
      !password ||
      !confirmPasswordForSignUp
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isEmailVerified) {
      alert("Please verify your email with OTP before registering.");
      return;
    }

    // Ensure OTP is present and valid if email is verified
    if (isEmailVerified && fullOtp.length !== 6) {
      alert("Please enter the complete OTP for registration.");
      return;
    }

    if (password !== confirmPasswordForSignUp) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    const registrationData = {
      firstName,
      lastName,
      phoneNumber,
      countryCode,
      profilePicture,
      address,
      city,
      state,
      country,
      pincode,
      email,
      password,
      otp: fullOtp, // Include the OTP here
    };
    dispatch(registerUser(registrationData));
  };

  // Handles the "Sign In" form submission
  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  // NEW: Handler to initiate Forgot Password flow
  const handleForgotPasswordClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsSignIn(false);
    setIsForgotPassword(true);
    dispatch(resetAuthStatus());
    setEmail("");
    setOtpDigits(new Array(6).fill(""));
    setResetPasswordEmail("");
    setNewPassword("");
    setConfirmNewPassword("");
    setNewPasswordError(""); // Clear password error
  };

  // NEW: Handler for sending OTP for password reset
  const handleSendOtpForResetPassword = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (!resetPasswordEmail) {
      alert("Please enter your email to reset password.");
      return;
    }
    dispatch(forgotPassword({ email: resetPasswordEmail }));
  };

  // NEW: Handler for verifying OTP for password reset
  const handleVerifyOtpForResetPassword = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    // --- DEBUGGING: Log OTP before sending ---
    console.log("OTP for verifyResetPasswordOtp:", fullOtp);
    // --- END DEBUGGING ---
    if (!resetPasswordEmail || fullOtp.length !== otpDigits.length) {
      alert("Please enter your email and a complete OTP.");
      return;
    }
    dispatch(
      verifyResetPasswordOtp({ email: resetPasswordEmail, otp: fullOtp })
    );
  };

  // NEW: Handler for final password reset
  const handleFinalResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordValidationError = validateNewPassword(newPassword);
    if (passwordValidationError) {
      setNewPasswordError(passwordValidationError);
      return;
    }
    setNewPasswordError(""); // Clear error if validation passes

    if (!newPassword || !confirmNewPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("New password and Confirm New Password do not match."); // Client-side check
      return;
    }
    if (!resetPasswordOTPVerified) {
      alert("Please verify OTP before resetting your password.");
      return;
    }

    // --- DEBUGGING: Log the payload before dispatching ---
    const payloadForReset = {
      email: resetPasswordEmail,
      otp: otpDigits.join(""), // Ensure OTP is correctly joined here
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword,
    };
    console.log("Dispatching resetPassword with payload:", payloadForReset);
    // --- END DEBUGGING ---

    dispatch(resetPassword(payloadForReset));
  };

  // Determine the current form title
  const getFormTitle = () => {
    if (isForgotPassword) {
      if (!resetPasswordOTPSent) {
        return "Forgot Password";
      } else if (resetPasswordOTPSent && !resetPasswordOTPVerified) {
        return "Verify OTP";
      } else {
        return "Set New Password";
      }
    }
    return isSignIn ? "Sign in to Account" : "Create Account";
  };

  // Determine the current form submission handler
  const getFormSubmissionHandler = () => {
    if (isForgotPassword) {
      return handleFinalResetPassword;
    }
    return isSignIn ? handleSignIn : handleRegister;
  };

  // Determine the current form layout class
  const getFormWidthClass = () => {
    if (isForgotPassword) {
      return "max-w-[280px]"; // Forgot password will have a similar width to sign-in
    }
    return isSignIn ? "max-w-[280px]" : "max-w-lg";
  };

  // --- Component Render ---
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      {/* Main Container - Fixed Height */}
      <div className="w-[900px] h-[400px] bg-white rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Panel (Sign In / Sign Up / Forgot Password Form) */}
        <motion.div
          key={
            isForgotPassword ? "forgotpassword" : isSignIn ? "signin" : "signup"
          }
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4 }}
          className={`px-6 pt-3 pb-4 flex flex-col justify-start items-center text-center overflow-hidden
                         ${isSignIn || isForgotPassword ? "w-1/2" : "w-2/3"}`}
        >
          {/* Logo */}
          <div className="my-1 flex-shrink-0">
            <Image src="/MangoLogo.webp" alt="Logo" width={90} height={50} />
          </div>

          {/* Heading with underline */}
          <div className="mb-2 text-center flex-shrink-0">
            <h2 className="text-xl font-bold text-green-600 inline-block">
              {getFormTitle()}
            </h2>
            <div
              className="h-[2px] bg-orange-500 mt-1 mx-auto"
              style={{ width: "100%", maxWidth: "180px" }}
            ></div>
          </div>

          {/* Social Icons (Hidden for Forgot Password flow) */}
          {!isForgotPassword && (
            <>
              <div className="flex items-center gap-3 mb-2 flex-shrink-0">
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

              <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
                or use your email account
              </p>
            </>
          )}

          {/* Form Fields Container */}
          <form
            className={`space-y-1 w-full text-left flex-grow-0 flex-shrink-0
                          ${getFormWidthClass()}`}
            onSubmit={getFormSubmissionHandler()}
          >
            {/* Forgot Password Fields */}
            {isForgotPassword && (
              <>
                {!resetPasswordOTPSent && (
                  <div className="relative w-full mb-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      value={resetPasswordEmail}
                      onChange={(e) => setResetPasswordEmail(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                  </div>
                )}

                {resetPasswordOTPSent && !resetPasswordOTPVerified && (
                  <>
                    <p className="text-xs text-gray-500 text-center mb-2">
                      Please enter the 6-digit OTP sent to your email.
                    </p>
                    <div className="flex justify-center gap-1 mb-1">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          className="w-8 h-8 text-center text-md border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          disabled={loading === "pending"}
                        />
                      ))}
                    </div>
                  </>
                )}

                {resetPasswordOTPVerified && (
                  <>
                    <div className="relative w-full mb-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-10"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setNewPasswordError(
                            validateNewPassword(e.target.value)
                          );
                        }}
                        disabled={loading === "pending"}
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
                    {newPasswordError && (
                      <p className="text-red-500 text-xs text-left -mt-1 mb-1">
                        {newPasswordError}
                      </p>
                    )}
                    <div className="relative w-full mb-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-10"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={loading === "pending"}
                        required
                      />
                      <Image
                        src={
                          showConfirmPassword
                            ? "/eye-open.svg"
                            : "/eye-closed.svg"
                        }
                        alt="Toggle password visibility"
                        width={18}
                        height={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Sign Up Fields (conditionally rendered) */}
            {!isSignIn && !isForgotPassword && (
              <>
                {/* Email Field and OTP related info */}
                <div className="relative w-full mb-1">
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
                    disabled={
                      loading === "pending" || isEmailVerified || otpSent
                    }
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

                {/* OTP Input Fields - Only visible if OTP has been sent and not yet verified */}
                {otpSent && !isEmailVerified && (
                  <div className="flex justify-center gap-1 mb-1">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        className="w-8 h-8 text-center text-md border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        disabled={loading === "pending"}
                      />
                    ))}
                  </div>
                )}

                {/* Additional Registration Fields - Only visible if email is verified */}
                {isEmailVerified && (
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                    {/* Row 1: First Name, Last Name, Phone Number */}
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                    {/* Phone Number (Country Code + Number) as one logical unit */}
                    <div className="flex gap-1">
                      <select
                        className="w-1/3 px-1 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={loading === "pending"}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        {/* Add more country codes as needed */}
                      </select>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        className="w-2/3 px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={loading === "pending"}
                        required
                      />
                    </div>

                    {/* Row 2: Profile Picture, Address */}
                    <div className="col-span-1">
                      <label className="block text-xs text-gray-500 text-left pt-1">
                        Profile Picture:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                        onChange={(e) =>
                          setProfilePicture(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                        disabled={loading === "pending"}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs col-span-2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />

                    {/* Row 3: City, State, Country */}
                    <input
                      type="text"
                      placeholder="City"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />

                    {/* Row 4: Pincode, Password, Confirm Password */}
                    <input
                      type="text"
                      placeholder="Pincode"
                      className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      disabled={loading === "pending"}
                      required
                    />
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs pr-8"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading === "pending"}
                        required
                      />
                      <Image
                        src={showPassword ? "/eye-open.svg" : "/eye-closed.svg"}
                        alt="Toggle password visibility"
                        width={14}
                        height={14}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </div>
                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="w-full px-2 py-0.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs pr-8"
                        value={confirmPasswordForSignUp}
                        onChange={(e) =>
                          setConfirmPasswordForSignUp(e.target.value)
                        }
                        disabled={loading === "pending"}
                        required
                      />
                      <Image
                        src={
                          showConfirmPassword
                            ? "/eye-open.svg"
                            : "/eye-closed.svg"
                        }
                        alt="Toggle password visibility"
                        width={14}
                        height={14}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Sign In Fields (conditionally rendered) */}
            {isSignIn && !isForgotPassword && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading === "pending"}
                  required
                />
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading === "pending"}
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
                    <input type="checkbox" disabled={loading === "pending"} />{" "}
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="text-green-600 hover:underline"
                    onClick={handleForgotPasswordClick} // Updated to call new handler
                  >
                    Forgot Password?
                  </a>
                </div>
              </>
            )}

            {/* Display error messages */}
            {error && (
              <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
            )}
            {registrationSuccess && !isSignIn && !isForgotPassword && (
              <p className="text-green-600 text-xs mt-1 text-center">
                Registration successful! Redirecting...
              </p>
            )}
            {passwordResetSuccess && isForgotPassword && (
              <p className="text-green-600 text-xs mt-1 text-center">
                Password reset successful! Redirecting to sign in...
              </p>
            )}

            {/* Action Buttons based on current state */}
            {isForgotPassword ? (
              <>
                {!resetPasswordOTPSent && (
                  <button
                    type="button"
                    onClick={handleSendOtpForResetPassword}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending" || !resetPasswordEmail}
                  >
                    {loading === "pending" ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
                {resetPasswordOTPSent && !resetPasswordOTPVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtpForResetPassword}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={
                      loading === "pending" || otpDigits.join("").length !== 6
                    }
                  >
                    {loading === "pending" ? "Verifying OTP..." : "Verify OTP"}
                  </button>
                )}
                {resetPasswordOTPVerified && (
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending" || newPasswordError !== ""}
                  >
                    {loading === "pending" ? "Resetting..." : "Reset Password"}
                  </button>
                )}
                <button
                  type="button"
                  className="text-green-600 text-xs mt-2 w-full hover:underline"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignIn(true);
                  }}
                >
                  Back to Sign In
                </button>
              </>
            ) : isSignIn ? (
              <button
                type="submit"
                className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                disabled={loading === "pending"}
              >
                {loading === "pending" ? "Signing In..." : "Sign In"}
              </button>
            ) : (
              // Sign Up flow buttons
              <>
                {!otpSent && !isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={loading === "pending" || !email}
                  >
                    {loading === "pending" ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}

                {otpSent && !isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm"
                    disabled={
                      loading === "pending" || otpDigits.join("").length !== 6
                    }
                  >
                    {loading === "pending" ? "Verifying OTP..." : "Verify OTP"}
                  </button>
                )}

                {isEmailVerified && (
                  <button
                    type="submit"
                    className="bg-green-600 text-white py-1.5 mt-2 rounded-full w-full hover:bg-green-700 transition text-sm col-span-3"
                    disabled={loading === "pending"}
                  >
                    {loading === "pending" ? "Registering..." : "Register"}
                  </button>
                )}
              </>
            )}
          </form>

          {/* Switch Form Link */}
          <div className="mt-2 text-xs flex-shrink-0">
            {isSignIn && !isForgotPassword ? (
              <>
                Don't have an account?{" "}
                <span
                  className="cursor-pointer text-green-600 hover:underline"
                  onClick={() => setIsSignIn(false)}
                >
                  Create Account
                </span>
              </>
            ) : !isSignIn && !isForgotPassword ? (
              <>
                Already have an account?{" "}
                <span
                  className="cursor-pointer text-green-600 hover:underline"
                  onClick={() => setIsSignIn(true)}
                >
                  Sign In
                </span>
              </>
            ) : (
              // In forgot password mode, provide a back to sign in option
              <>
                Remember your password?{" "}
                <span
                  className="cursor-pointer text-green-600 hover:underline"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignIn(true);
                  }}
                >
                  Sign In
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Right Panel (Promotional/Switch View) */}
        <motion.div
          key={
            isForgotPassword
              ? "right-forgotpassword"
              : isSignIn
              ? "right-signin"
              : "right-signup"
          }
          initial={{ opacity: 0, x: isSignIn ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignIn ? -50 : 50 }}
          transition={{ duration: 0.4 }}
          className={`bg-[#52BA8C] text-white flex flex-col justify-center items-center p-6 relative
                         ${isSignIn || isForgotPassword ? "w-1/2" : "w-1/3"}`}
        >
          {isSignIn || isForgotPassword ? ( // Adjusted to show "Hello, Friend!" for sign-in and forgot password
            <>
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <div
                className="h-[2px] bg-white mt-1 mx-auto mb-4"
                style={{ width: "60px" }}
              ></div>
              <p className="text-sm text-center max-w-xs mb-8">
                {isForgotPassword
                  ? "Enter your email to receive a password reset OTP."
                  : "Fill up personal information and start journey with us."}
              </p>
              {!isForgotPassword && (
                <button
                  className="border-2 border-white text-white py-2 px-8 rounded-full hover:bg-white hover:text-[#52BA8C] transition-colors duration-300"
                  onClick={() => {
                    setIsSignIn(false);
                    setIsForgotPassword(false);
                  }}
                >
                  Sign Up
                </button>
              )}
              {isForgotPassword && (
                <button
                  className="border-2 border-white text-white py-2 px-8 rounded-full hover:bg-white hover:text-[#52BA8C] transition-colors duration-300"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignIn(true);
                  }}
                >
                  Back to Sign In
                </button>
              )}
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
