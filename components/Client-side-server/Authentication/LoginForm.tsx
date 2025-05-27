"use client";
import { FacebookIcon, GoogleIcon, LinkedInIcon } from "./SVGIcons";

export default function LoginForm() {
  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <h2 className="text-2xl font-semibold text-green-600 mb-2">
        Sign in to Account
      </h2>
      <div className="flex space-x-4 mb-4">
        <FacebookIcon />
        <LinkedInIcon />
        <GoogleIcon />
      </div>
      <p className="mb-4 text-gray-600">or use your email account</p>
      <input type="email" placeholder="Email" className="input" />
      <input type="password" placeholder="Password" className="input" />
      <div className="flex justify-between w-full text-sm text-gray-500 mt-2">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="hover:underline">
          Forgot Password?
        </a>
      </div>
      <button className="btn-primary mt-4">Sign In</button>
    </div>
  );
}
