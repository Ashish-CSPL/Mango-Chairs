"use client";

export default function RegisterForm() {
  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <h2 className="text-2xl font-semibold text-green-600 mb-2">
        Create Account
      </h2>
      <p className="mb-4 text-gray-600">Use your email for registration</p>
      <input type="text" placeholder="Name" className="input" />
      <input type="email" placeholder="Email" className="input" />
      <input type="password" placeholder="Password" className="input" />
      <button className="btn-primary mt-4">Sign Up</button>
    </div>
  );
}
