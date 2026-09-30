import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-card, #131317)',
          border: '1px solid var(--color-border-strong, rgba(255, 255, 255, 0.12))',
          color: 'var(--color-primary, #F0EDE8)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md, 8px)',
        },
        className: 'font-mono text-xs',
      }}
    />
  );
}

export { toast };
