import { useEffect, useRef } from 'react';

interface ShortcutOptions {
  onNavigate: (tabId: string) => void;
  onOpenCommandPalette: () => void;
  onNewLead?: () => void;
}

export function useKeyboardShortcuts({
  onNavigate,
  onOpenCommandPalette,
  onNewLead,
}: ShortcutOptions) {
  const lastKeyRef = useRef<string | null>(null);
  const chordTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs, textareas, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+K or Ctrl+K -> Command Palette
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Cmd+N or Ctrl+N -> New Lead
      if ((e.key === 'n' || e.key === 'N') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (onNewLead) onNewLead();
        else onNavigate('leads');
        return;
      }

      // Linear-style two-key chords: 'G' then [Key]
      if (e.key === 'g' || e.key === 'G') {
        lastKeyRef.current = 'g';
        if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);
        chordTimeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        return;
      }

      if (lastKeyRef.current === 'g') {
        lastKeyRef.current = null;
        const key = e.key.toLowerCase();
        if (key === 'i') {
          e.preventDefault();
          onNavigate('inbox');
        } else if (key === 'l') {
          e.preventDefault();
          onNavigate('leads');
        } else if (key === 'a') {
          e.preventDefault();
          onNavigate('analytics');
        } else if (key === 'd') {
          e.preventDefault();
          onNavigate('drip');
        } else if (key === 't') {
          e.preventDefault();
          onNavigate('templates');
        } else if (key === 's') {
          e.preventDefault();
          onNavigate('settings');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current);
    };
  }, [onNavigate, onOpenCommandPalette, onNewLead]);
}
