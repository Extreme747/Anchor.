import React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys?: string[];
}

export const Kbd = React.forwardRef<HTMLSpanElement, KbdProps>(
  ({ className, keys, children, ...props }, ref) => {
    const renderKey = (key: string, index: number) => (
      <kbd
        key={index}
        className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-medium rounded border bg-surface-hover text-tertiary border-border border-b-[rgba(0,0,0,0.4)] border-t-[rgba(255,255,255,0.1)] shadow-sm"
      >
        {key}
      </kbd>
    );

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-0.5", className)}
        {...props}
      >
        {keys ? keys.map(renderKey) : (
          typeof children === 'string' 
            ? children.split('').map(renderKey)
            : <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-medium rounded border bg-surface-hover text-tertiary border-border border-b-[rgba(0,0,0,0.4)] border-t-[rgba(255,255,255,0.1)] shadow-sm">{children}</kbd>
        )}
      </span>
    );
  }
);
Kbd.displayName = "Kbd";
