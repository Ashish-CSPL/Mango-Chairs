// components/ui/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Optional title for the modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Close modal when clicking outside content
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 relative max-w-lg w-full m-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside content from closing modal
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-semibold"
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
        )}
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
