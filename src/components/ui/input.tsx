import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="text-xs font-medium text-[#A1A1AA] mb-1.5 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex w-full bg-[#0D0D10] border border-[rgba(255,255,255,0.06)] rounded-sm px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#3F3F46]',
              'focus:border-[rgba(200,149,58,0.5)] focus:ring-1 focus:ring-[rgba(200,149,58,0.25)] focus:outline-none',
              error && 'border-[#F87171]/50',
              icon && 'pl-9',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[#F87171] text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
