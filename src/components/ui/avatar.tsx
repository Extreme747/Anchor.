import React from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'sm' | 'default' | 'lg';
export type AvatarStatus = 'online' | 'away' | 'offline';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  default: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const statusClasses: Record<AvatarStatus, string> = {
  online: 'bg-success shadow-[0_0_4px_rgba(52,211,153,0.4)]',
  away: 'bg-warning',
  offline: 'bg-tertiary',
};

const statusSizeClasses: Record<AvatarSize, string> = {
  sm: 'h-1.5 w-1.5',
  default: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
};

function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'default', status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-surface-hover shrink-0",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-gold font-mono font-medium">
            {name ? getInitials(name) : '?'}
          </span>
        )}
        
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full ring-2 ring-canvas",
              statusClasses[status],
              statusSizeClasses[size]
            )}
          />
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";
