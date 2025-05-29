// components/Auth/components/FormInput.tsx
import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string; // Unique ID for input and label association
  name: string; // Name for form state management
  error?: string; // Error message to display
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  name,
  error,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        name={name} // Crucial for handleChange in useAuthForm
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className} ${
          error ? "border-red-500" : ""
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
