import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, GitBranch, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onAssign?: () => void;
  onEnroll?: () => void;
  onTag?: () => void;
}

export function BulkActionBar({ count, onClear, onAssign, onEnroll, onTag }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-card border border-border-strong px-4 py-2.5 flex items-center gap-3 shadow-2xl rounded-md z-40 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 pr-2 border-r border-border">
        <span className="w-5 h-5 rounded-full bg-accent text-black font-mono text-[11px] font-bold flex items-center justify-center">
          {count}
        </span>
        <span className="font-mono text-xs text-primary font-medium whitespace-nowrap">
          leads selected
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onAssign}
          className="h-7 text-xs font-mono gap-1.5"
        >
          <UserCheck size={13} />
          <span>Assign Agent</span>
        </Button>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onEnroll}
          className="h-7 text-xs font-mono gap-1.5"
        >
          <GitBranch size={13} />
          <span>Enroll Drip</span>
        </Button>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onTag}
          className="h-7 text-xs font-mono gap-1.5"
        >
          <Tag size={13} />
          <span>Add Tag</span>
        </Button>
      </div>

      <div className="pl-2 border-l border-border">
        <button
          onClick={onClear}
          className="text-tertiary hover:text-danger text-xs font-mono flex items-center gap-1 transition-colors p-1"
          aria-label="Clear selection"
        >
          <X size={14} />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </motion.div>
  );
}
