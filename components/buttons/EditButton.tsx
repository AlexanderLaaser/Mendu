// components/buttons/EditButton.tsx
import React from "react";

interface EditButtonProps {
  onClick: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <button
      className="absolute top-2 right-2 text-black hover:text-gray-500"
      onClick={onClick}
      aria-label="Bearbeiten"
    >
      {/* Verwende ein Edit-Symbol, z. B. ein Stiftsymbol */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        />
      </svg>
    </button>
  );
};

export default EditButton;
