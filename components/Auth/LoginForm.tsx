"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  setAuthLoading,
  setAuthError,
  setAuthSuccess,
} from "@/app/Redux/Slices/authSlice";
import { loginCustomer } from "@/app/API_Calls/auth";
import { toast } from "react-hot-toast";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
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

    // ✅ Only dispatch without argument
    dispatch(setAuthLoading());

    try {
      const response = await loginCustomer({ email, password });

      if (!response || !response.user || !response.token) {
        throw new Error(
          "Login API did not return expected user data or token."
        );
      }

      const { user, token } = response;

      dispatch(setAuthSuccess({ user, token }));

      if (typeof window !== "undefined") {
        localStorage.setItem("userToken", token);
        localStorage.setItem("userData", JSON.stringify(user));
        console.log("LoginForm: User data and token saved to localStorage.");
      }

      toast.success("Login successful!");
      onSuccess();
    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";

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
      dispatch(setAuthLoading()); // ✅ Again, without boolean
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
