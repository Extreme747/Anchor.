import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
        }
      `}} />
      <div
        className={cn("bg-surface-hover rounded-md animate-shimmer", className)}
        {...props}
      />
    </>
  );
}
