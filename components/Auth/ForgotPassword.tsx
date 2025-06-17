"use client";
import React, { useState, useEffect } from "react"; // Import useEffect
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store"; 
import {
  setEmail,
  setOtp,
  setNewPasswordStage,
  setLoading,
  setError,
  resetForgotPasswordState,
} from "@/app/Redux/Slices/forgotPasswordSlice";
import {
  sendOtpForResetPassword,
  verifyOtpForResetPassword,
  resetCustomerPassword,
} from "@/app/API_Calls/auth";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { email, otp, newPasswordStage, loading, error } = useSelector(
    (state: RootState) => state.forgotPassword
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // IMPORTANT: Reset state when the component mounts (on initial load or refresh)
  useEffect(() => {
    dispatch(resetForgotPasswordState());
  }, [dispatch]); // Ensure this effect runs only once on mount

  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await sendOtpForResetPassword(email);
      toast.success("OTP sent to your email!");
      dispatch(setNewPasswordStage("otpVerification"));
    } catch (err: any) {
      console.error("Error sending OTP:", err.message);
      dispatch(setError(err.message || "Failed to send OTP."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await verifyOtpForResetPassword(email, otp);
      toast.success(
        "OTP verified successfully! You can now reset your password."
      );
      dispatch(setNewPasswordStage("passwordResetForm"));
    } catch (err: any) {
      console.error("Error verifying OTP:", err.message);
      dispatch(setError(err.message || "OTP verification failed."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null));

    if (newPassword !== confirmNewPassword) {
      dispatch(setError("New password and confirm password do not match."));
      dispatch(setLoading(false));
      return;
    }

    try {
      await resetCustomerPassword({
        email,
        password: newPassword,
        otp: 0,
        confirm_password: "",
      });
      toast.success("Password reset successfully!");
      dispatch(setNewPasswordStage("success"));
      router.push("/login"); // Redirect to login page after successful reset
      // No need to call resetForgotPasswordState here explicitly after router.push,
      // as the component will unmount/remount on a new route, triggering the useEffect
      // but it's fine if you want to keep it for clarity before navigation.
      // dispatch(resetForgotPasswordState());
    } catch (err: any) {
      console.error("Error resetting password:", err.message);
      dispatch(setError(err.message || "Failed to reset password."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-900">
          Forgot Password
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {newPasswordStage === "emailInput" && (
          <form onSubmit={handleSendOtpSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Enter your Email
            </h2>
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
                name="email"
                value={email}
                onChange={(e) => dispatch(setEmail(e.target.value))}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <p className="mt-4 text-center text-gray-600">
              Remembered your password?{" "}
              <Link
                href="/auth"
                className="text-blue-500 hover:underline font-medium"
              >
                Back to Login
              </Link>
            </p>
          </form>
        )}

        {newPasswordStage === "otpVerification" && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Verify OTP
            </h2>
            <p className="text-sm text-gray-600">
              An OTP has been sent to{" "}
              <span className="font-medium">{email}</span>.
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
                onChange={(e) => dispatch(setOtp(e.target.value))}
                required
                maxLength={6}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder="XXXXXX"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => dispatch(setNewPasswordStage("emailInput"))}
              className="w-full mt-2 text-blue-500 hover:underline text-sm"
            >
              Change Email / Resend OTP
            </button>
          </form>
        )}

        {newPasswordStage === "passwordResetForm" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Set New Password
            </h2>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                name="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-new-password"
                name="confirm_password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={8}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-base text-black"
                placeholder="Confirm new password"
              />
              {newPassword &&
                confirmNewPassword &&
                newPassword !== confirmNewPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    Passwords do not match!
                  </p>
                )}
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={loading || newPassword !== confirmNewPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <p className="mt-4 text-center text-gray-600">
              Remembered your password?{" "}
              <Link
                href="/auth"
                className="text-blue-500 hover:underline font-medium"
              >
                Back to Login
              </Link>
            </p>
          </form>
        )}

        {newPasswordStage === "success" && (
          <div className="text-center space-y-4">
            <p className="text-green-600 text-lg font-semibold">
              Your password has been successfully reset!
            </p>
            <Link
              href="/auth"
              className="text-blue-500 hover:underline font-medium"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
