import React, { useEffect } from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { Kbd } from './kbd';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'GENERAL & COMMANDS',
    items: [
      { label: 'Open Command Palette', keys: ['⌘', 'K'] },
      { label: 'Create New Lead', keys: ['⌘', 'N'] },
      { label: 'Simulate Inbound WhatsApp Lead', keys: ['⌘', '⇧', 'S'] },
      { label: 'Toggle Keyboard Cheatsheet', keys: ['?'] },
      { label: 'Close Active Modal / Dropdown', keys: ['Esc'] },
    ],
  },
  {
    title: 'NAVIGATION CHORDS (PRESS "G" THEN)',
    items: [
      { label: 'Go to Command Inbox', keys: ['G', 'I'] },
      { label: 'Go to Leads Database', keys: ['G', 'L'] },
      { label: 'Go to Revenue Analytics', keys: ['G', 'A'] },
      { label: 'Go to Drip Sequences', keys: ['G', 'D'] },
      { label: 'Go to HSM Templates', keys: ['G', 'T'] },
      { label: 'Go to Settings', keys: ['G', 'S'] },
    ],
  },
  {
    title: 'INBOX & CHAT WORKFLOW',
    items: [
      { label: 'Select Next Lead (Down)', keys: ['J'] },
      { label: 'Select Previous Lead (Up)', keys: ['K'] },
      { label: 'Toggle WhatsApp / Private Note Mode', keys: ['Tab'] },
      { label: 'Open Real Estate Quick Replies', keys: ['/'] },
      { label: 'Approve & Send Staged Reply', keys: ['⌘', '↵'] },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-surface-card border border-border-strong rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-sub">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-accent" />
            <h3 className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
              Anchor Keyboard Cheatsheet
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-tertiary hover:text-primary transition-colors p-1 rounded hover:bg-surface-hover"
            aria-label="Close shortcuts modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h4 className="text-[10px] font-mono text-tertiary tracking-wider font-semibold uppercase">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div 
                    key={item.label}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-surface-hover/50 text-xs transition-colors"
                  >
                    <span className="text-secondary">{item.label}</span>
                    <Kbd keys={item.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-sub/80 flex items-center justify-between font-mono text-[11px] text-tertiary">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" />
            Designed for 10x Sales Rep Velocity
          </span>
          <span>Press <Kbd>?</Kbd> or <Kbd>Esc</Kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
