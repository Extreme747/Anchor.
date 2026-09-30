import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'new' | 'blue' | 'contacted' | 'purple' | 'qualified' | 'success' | 'won' | 'danger' | 'lost' | 'warning';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white/10 border-white/20 text-[#A1A1AA]',
      gold: 'bg-[#C8953A]/10 border-[#C8953A]/20 text-[#C8953A]',
      new: 'bg-[#C8953A]/10 border-[#C8953A]/20 text-[#C8953A]',
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      contacted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      qualified: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      success: 'bg-[#34D399]/10 border-[#34D399]/20 text-[#34D399]',
      won: 'bg-[#34D399]/10 border-[#34D399]/20 text-[#34D399]',
      danger: 'bg-[#F87171]/10 border-[#F87171]/20 text-[#F87171]',
      lost: 'bg-[#F87171]/10 border-[#F87171]/20 text-[#F87171]',
      warning: 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
