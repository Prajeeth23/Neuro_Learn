import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-black uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const variants = {
    primary: "uiverse-btn",
    secondary: "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200 shadow-sm",
    outline: "uiverse-btn-outline",
    ghost: "bg-transparent text-black hover:bg-gray-50",
    black: "bg-black text-white hover:opacity-90 shadow-lg shadow-black/5"
  };
  
  const sizes = {
    default: "h-12 px-8 text-[10px]",
    sm: "h-9 px-4 text-[9px]",
    lg: "h-14 px-12 text-[11px]",
    xl: "h-16 px-16 text-[12px]"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
