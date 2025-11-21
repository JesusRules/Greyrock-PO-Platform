// components/ShippingInput.tsx
import React from "react";

interface ShippingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ShippingInput: React.FC<ShippingInputProps> = ({
  className = "",
  ...props
}) => {
  return (
    <input
      {...props}
      className={
        "flex h-9 w-full rounded-md border border-gray-500 bg-transparent px-3 py-1 " +
        "text-base shadow-sm transition-colors placeholder:text-muted-foreground " +
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring " +
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm " +
        className
      }
    />
  );
};
