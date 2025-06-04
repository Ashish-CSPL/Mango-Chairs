// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      <p className="ml-3 text-gray-700">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
