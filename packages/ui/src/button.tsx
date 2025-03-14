"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export const Button = ({
  onClick,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon,
  className = "",
}: ButtonProps) => {
  // Style maps for variants
  const variantStyles = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-transparent shadow-md hover:shadow-lg",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200",
    outline: "bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-transparent"
  };

  // Size maps
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-lg",
    md: "text-sm px-5 py-2.5 rounded-lg",
    lg: "text-base px-6 py-3 rounded-xl"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      type="button"
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${fullWidth ? "w-full" : ""} 
        font-medium border transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${variant === "primary" ? "focus:ring-purple-400" : "focus:ring-gray-300"}
        inline-flex items-center justify-center
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};