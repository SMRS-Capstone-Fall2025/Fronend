import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  className,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full py-3 rounded-lg font-medium transition ${className}`}
    >
      {children}
    </button>
  );
}
