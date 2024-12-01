import React from "react";

interface ButtonProps {
  id?: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  id,
  onClick,
  children,
  className = "",
  type = "button",
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      type={type}
      className={`text-xs px-2 py-1 text-white bg-gray-800 rounded-md hover:bg-gray-600 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
