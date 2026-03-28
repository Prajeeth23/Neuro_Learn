import React from 'react';
import { cn } from '../../lib/utils';

export function Progress({ value = 0, className, ...props }) {
  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-50 border border-gray-100",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-black transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}
