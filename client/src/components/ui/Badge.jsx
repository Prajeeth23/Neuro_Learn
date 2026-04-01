import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-primary/20 text-primary border-primary/50",
    secondary: "bg-secondary/20 text-secondary border-secondary/50",
    accent: "bg-accent/20 text-accent border-accent/50",
    outline: "border-slate-200 text-slate-600"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";
