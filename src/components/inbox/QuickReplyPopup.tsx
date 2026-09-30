import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap, X, MapPin, Calendar, FileText, IndianRupee, MessageCircle } from 'lucide-react';

const SHORTCUTS = [
  { cmd: '/visit', text: 'Would you like to schedule a site visit this weekend?', icon: Calendar, label: 'Site Visit' },
  { cmd: '/brochure', text: 'Here\'s our latest project brochure: anchor.io/brochure/sec62', icon: FileText, label: 'Brochure' },
  { cmd: '/pricing', text: 'Our 3BHK units are priced from ₹1.2–1.6 Cr (all-inclusive).', icon: IndianRupee, label: 'Pricing' },
  { cmd: '/location', text: 'Location: Sector 62, Gurugram. 5 min from NH-48. Google Maps: maps.anchor.io/sec62', icon: MapPin, label: 'Location' },
  { cmd: '/followup', text: 'Hi! Just following up on our earlier conversation. Still interested in the property?', icon: MessageCircle, label: 'Follow Up' },
];

interface QuickReplyPopupProps {
  onSelect: (text: string) => void;
  onClose: () => void;
}

export function QuickReplyPopup({ onSelect, onClose }: QuickReplyPopupProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % SHORTCUTS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + SHORTCUTS.length) % SHORTCUTS.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSelect(SHORTCUTS[selectedIndex].text);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="absolute bottom-full left-0 right-0 mb-3 bg-surface-card border border-border-strong rounded-md shadow-2xl overflow-hidden flex flex-col z-50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-sub">
        <div className="flex items-center gap-2 text-primary font-medium text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span>QUICK REPLIES & SHORTCUTS</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-tertiary hover:text-primary transition-colors focus:outline-none rounded-sm p-0.5"
          aria-label="Close quick replies"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-1 flex flex-col max-h-56 overflow-y-auto">
        {SHORTCUTS.map((item, index) => {
          const Icon = item.icon;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={item.cmd}
              onClick={() => onSelect(item.text)}
              className={cn(
                "flex items-start gap-2.5 p-2 rounded-sm text-left transition-colors focus:outline-none",
                isSelected 
                  ? "bg-surface-hover text-primary" 
                  : "text-secondary hover:bg-surface-hover/60 hover:text-primary"
              )}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className={cn(
                "font-mono text-xs font-semibold px-1.5 py-0.5 rounded shrink-0",
                isSelected ? "bg-accent text-canvas" : "bg-surface-sub text-accent border border-accent/20"
              )}>
                {item.cmd}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className="w-3 h-3 text-tertiary" />
                  <span className="text-[11px] font-medium text-primary">{item.label}</span>
                </div>
                <p className="text-xs text-secondary truncate">{item.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
