import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-black ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black transition-all disabled:cursor-not-allowed disabled:opacity-50 font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
