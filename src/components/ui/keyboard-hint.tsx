import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Kbd } from './kbd';

interface KeyboardHintProps {
  onOpenCommandPalette: () => void;
}

export function KeyboardHint({ onOpenCommandPalette }: KeyboardHintProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside 
      aria-label="Keyboard shortcuts helper"
      className="fixed bottom-4 right-4 z-40 hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-card/90 border border-border-strong shadow-lg backdrop-blur-md text-xs text-tertiary select-none animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <Sparkles size={12} className="text-accent shrink-0" />
      <span className="text-[11px] text-secondary flex items-center gap-1">
        <span>Tip: Press</span>
        <Kbd keys={["J", "/", "K"]} />
        <span>to move leads ·</span>
        <button onClick={onOpenCommandPalette} className="inline-flex mx-0.5 focus:outline-none" aria-label="Open command palette">
          <Kbd keys={["⌘", "K"]} />
        </button>
        <span>to jump anywhere</span>
      </span>
      <button 
        onClick={() => setDismissed(true)}
        className="text-tertiary hover:text-primary transition-colors p-0.5 rounded-full ml-1"
        aria-label="Dismiss shortcut hint"
      >
        <X size={12} />
      </button>
    </aside>
  );
}
