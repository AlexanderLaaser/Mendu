import React from "react";

interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  type = "button",
  onClick,
  children,
}: ButtonProps) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
