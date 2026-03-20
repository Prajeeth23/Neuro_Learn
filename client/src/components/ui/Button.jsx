import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "uiverse-btn",
    secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_15px_rgba(0,150,255,0.4)]",
    outline: "uiverse-btn-outline",
    ghost: "bg-transparent text-white hover:bg-white/10"
  };
  
  const sizes = {
    default: "h-12",
    sm: "h-8 px-3 text-sm",
    lg: "h-14 px-10 text-lg"
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
