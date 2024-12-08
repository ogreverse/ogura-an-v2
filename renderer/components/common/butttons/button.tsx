import React from "react";

interface ButtonProps {
  id?: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  color?: "black" | "white" | null;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  id,
  onClick,
  children,
  className = "",
  type = "button",
  color = "black",
  disabled = false,
}) => {
  let defaultClassName = "text-xs px-2 py-1 rounded-md";

  if (className) {
    defaultClassName = `${defaultClassName} ${className}`;
  }

  if (disabled) {
    defaultClassName = `${defaultClassName} opacity-50 cursor-not-allowed`;
  }

  if (color === "black") {
    defaultClassName = `${defaultClassName} text-white bg-gray-800 hover:bg-gray-600`;
  } else if (color === "white") {
    defaultClassName = `${defaultClassName} text-black bg-white hover:bg-gray-200 border border-gray-300`;
  }

  return (
    <button
      id={id}
      onClick={onClick}
      type={type}
      className={defaultClassName}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
