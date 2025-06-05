// app/forgot-password/page.tsx

"use client";
import React from "react";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import { Provider } from "react-redux";
import { store } from "@/app/Redux/Store/store"; // Corrected import path for store

const ForgotPasswordPage: React.FC = () => {
  return (
    <Provider store={store}>
      <ForgotPassword />
    </Provider>
  );
};

export default ForgotPasswordPage;
