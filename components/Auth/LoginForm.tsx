// app/components/Auth/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  setAuthLoading,
  setAuthError,
  setAuthSuccess,
} from "@/app/Redux/Slices/authSlice";
import { loginCustomer } from "@/app/API_Calls/auth"; // Adjust path as needed
import { toast } from "react-hot-toast"; // Assuming you have react-hot-toast installed

interface LoginFormProps {
  onSuccess: () => void; // Callback after successful login
  onSwitchToRegister: () => void; // Callback to switch to registration form
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      const response = await loginCustomer({ email, password });
      // Assuming your login API returns user data and a token
      dispatch(setAuthSuccess({ user: response.user, token: response.token }));
      toast.success("Login successful!");
      onSuccess(); // Close modal or redirect
    } catch (error: any) {
      toast.error(
        error.message || "Login failed. Please check your credentials."
      );
      dispatch(setAuthError(error.message || "Login failed."));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="loginEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="loginEmail"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="loginPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="loginPassword"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-orange-600 hover:text-orange-500"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
