import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#C8953A] text-black hover:bg-[#E8B04A] font-semibold',
      secondary: 'bg-transparent border border-[rgba(255,255,255,0.12)] text-[#A1A1AA] hover:text-[#F0EDE8] hover:bg-[#1A1A22]',
      ghost: 'bg-transparent text-[#71717A] hover:text-[#F0EDE8] hover:bg-[#1A1A22]',
      danger: 'bg-transparent border border-[#F87171]/30 text-[#F87171] hover:bg-[#F87171]/10',
      icon: 'bg-transparent text-[#71717A] hover:text-[#F0EDE8] hover:bg-[#1A1A22] p-0 aspect-square'
    };

    const sizes = {
      sm: 'h-7 px-2.5 text-xs',
      default: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-9 w-9'
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        disabled={disabled || loading}
        className={cn(
          'rounded-sm transition-colors duration-150 inline-flex items-center justify-center gap-2 font-medium focus-visible:ring-2 focus-visible:ring-[#C8953A]/50 focus-visible:outline-none',
          variants[variant],
          variant !== 'icon' && sizes[size],
          variant === 'icon' && sizes.icon,
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
