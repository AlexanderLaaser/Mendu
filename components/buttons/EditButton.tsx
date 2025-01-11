// components/buttons/EditButton.tsx
import React from "react";
import { FaEdit } from "react-icons/fa";

interface EditButtonProps {
  onClick: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <button
      className="absolute top-4 right-4 text-gray-600 hover:text-blue-500 transition-colors duration-200 ease-in-out transform hover:scale-110 bg-white p-2 rounded-full shadow-md"
      onClick={onClick}
      aria-label="Bearbeiten"
    >
      <FaEdit size={20} />
    </button>
  );
};

export default EditButton;
