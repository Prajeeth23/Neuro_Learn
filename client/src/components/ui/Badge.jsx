import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ children, className, variant = 'default', ...props }) {
  const baseStyles = "inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-colors border";
  
  const variants = {
    default: "bg-black text-white border-black",
    secondary: "bg-gray-100 text-black border-gray-200",
    outline: "bg-white text-black border-gray-100 hover:border-black",
    destructive: "bg-white text-black border-black/10",
    glass: "bg-black/5 text-black border-black/5 backdrop-blur-sm"
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
