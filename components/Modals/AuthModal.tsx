// app/components/Modals/AuthModal.tsx
"use client";

import React, { useState } from "react";
import RegisterForm from "../Auth/RegisterForm";
import LoginForm from "../Auth/LoginForm";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/Redux/Store/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const authError = useSelector((state: RootState) => state.auth.error);

  if (!isOpen) return null;

  const handleAuthSuccess = () => {
    onClose(); // Close the modal on successful auth
    // Optionally, redirect the user or show a success message
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl relative w-full max-w-md mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6">
            <span className="block sm:inline">{authError}</span>
          </div>
        )}

        {mode === "login" ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
