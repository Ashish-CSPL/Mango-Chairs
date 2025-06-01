// app/components/Auth/RegisterForm.tsx
"use client";

import React, { useState, ChangeEvent } from "react"; // Import ChangeEvent for file input
import { useDispatch } from "react-redux";
import {
  setAuthLoading,
  setAuthError,
  setAuthSuccess,
} from "@/app/Redux/Slices/authSlice";
import {
  sendOtpForVerification,
  verifyOtp,
  registerCustomer,
} from "@/app/API_Calls/auth"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Assuming you have react-hot-toast installed

interface RegisterFormProps {
  onSuccess: () => void; // Callback after successful registration
  onSwitchToLogin: () => void; // Callback to switch to login form
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Added: Country Code state
  const [profilePicture, setProfilePicture] = useState<File | null>(null); // Added: Profile Picture File state
  const [address, setAddress] = useState(""); // Added: Address state
  const [locality, setLocality] = useState(""); // Added: Locality state
  const [city, setCity] = useState(""); // Added: City state
  const [state, setState] = useState(""); // Added: State state
  const [country, setCountry] = useState(""); // Added: Country state
  const [zipcode, setZipcode] = useState(""); // Added: Zipcode state

  const [step, setStep] = useState(1); // 1: Email for OTP, 2: OTP verification, 3: Registration details
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      await sendOtpForVerification(email);
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP.");
      dispatch(setAuthError(error.message || "Failed to send OTP."));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      await verifyOtp(email, otp);
      toast.success("OTP verified successfully!");
      setStep(3); // Move to full registration form
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed.");
      dispatch(setAuthError(error.message || "OTP verification failed."));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  // Handler for file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    } else {
      setProfilePicture(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      dispatch(setAuthError("Passwords do not match."));
      return;
    }

    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      // Create the registrationData object with ALL required fields as per RegisterCustomerPayload
      const registrationData = {
        email,
        otp, // OTP is required here based on the payload type
        password,
        confirm_password: confirmPassword, // Confirm password is also required
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        country_code_for_phone_number: countryCode,
        profile_picture: profilePicture || undefined, // Send File object or undefined
        address,
        locality,
        city,
        state,
        country,
        zipcode,
      };

      const response = await registerCustomer(registrationData);
      dispatch(setAuthSuccess({ user: response.user, token: response.token }));
      toast.success("Registration successful!");
      onSuccess(); // Callback to parent component (e.g., close modal or redirect)
    } catch (error: any) {
      console.error("Registration error:", error); // Log full error for debugging
      toast.error(error.message || "Registration failed.");
      dispatch(setAuthError(error.message || "Registration failed."));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              Login
            </button>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-gray-600">
            An OTP has been sent to{" "}
            <span className="font-semibold">{email}</span>.
          </p>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 mt-2"
            disabled={loading}
          >
            Change Email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-green-600 text-sm font-medium">
            Email verified! Please complete your registration.
          </p>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <select
                id="countryCode"
                name="country_code_for_phone_number"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                disabled={loading}
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA/Canada)</option>
                <option value="+44">+44 (UK)</option>
                {/* Add more country codes as needed */}
              </select>
              <input
                type="tel"
                id="phoneNumber"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., 9876543210"
              />
            </div>
          </div>

          {/* Profile Picture Input */}
          <div>
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-gray-700"
            >
              Profile Picture (Optional)
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
            {profilePicture && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {profilePicture.name}
              </p>
            )}
          </div>

          {/* Address Fields */}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
              placeholder="House No., Street Name"
            />
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              required
              disabled={loading}
              placeholder="Area, Colony"
            />
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Pune"
            />
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Maharashtra"
            />
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., India"
            />
          </div>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., 411001"
            />
          </div>

          {/* Password Fields */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8} // Example: enforce minimum length
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={loading || password !== confirmPassword} // Disable if passwords don't match
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;
