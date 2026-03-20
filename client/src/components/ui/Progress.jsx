import React from 'react';
import { cn } from '../../lib/utils';

export const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-black/40", className)}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-secondary to-primary transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin="0"
      aria-valuemax="100"
    />
  </div>
));
Progress.displayName = "Progress";
