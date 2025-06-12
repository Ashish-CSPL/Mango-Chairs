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
import { toast } from "react-hot-toast";

interface LoginFormProps {
  onSuccess: () => void; // Callback after successful login
  onSwitchToRegister: () => void; // Callback to switch to registration form
}

// Assuming these interfaces exist or you define them in app/types/auth.ts or app/API_Calls/auth.ts
// If they don't exist, create them:
/*
interface LoginCredentials {
  email: string; // Key change: from username to email
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // ... other user properties
}

interface AuthResponse {
  user: User;
  token: string;
}
*/

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState(""); // Changed from username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      // Pass 'email' and 'password' as per the LoginCredentials type
      const response = await loginCustomer({ email, password });

      // Ensure the response contains user and token as expected
      if (!response || !response.user || !response.token) {
        throw new Error(
          "Login API did not return expected user data or token."
        );
      }

      const { user, token } = response;

      // 1. Dispatch success action to update Redux state immediately
      dispatch(setAuthSuccess({ user, token }));

      // 2. Persist user data and token to localStorage for re-hydration on refresh
      if (typeof window !== "undefined") {
        localStorage.setItem("userToken", token);
        localStorage.setItem("userData", JSON.stringify(user));
        console.log("LoginForm: User data and token saved to localStorage.");
      }

      toast.success("Login successful!");
      onSuccess(); // Execute callback (e.g., close modal, redirect client-side)
    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";

      // Check for custom error properties from fetchSecondary
      if (
        error.responseBody &&
        typeof error.responseBody.message === "string"
      ) {
        errorMessage = error.responseBody.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
      dispatch(setAuthError(errorMessage));
      console.error("LoginForm Error:", error);
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
            htmlFor="loginEmail" // Changed from loginUsername
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email" // Changed type to email for better validation
            id="loginEmail" // Changed from loginUsername
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            value={email} // Using email state
            onChange={(e) => setEmail(e.target.value)} // Updating email state
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
