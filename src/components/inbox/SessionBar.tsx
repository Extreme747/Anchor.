import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function SessionBar({ hours }: { hours: number }) {
  const isCritical = hours < 2;

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-card border border-border rounded-md">
      <Clock className="w-4 h-4 text-tertiary shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary">Session Timer</span>
          <div className="flex items-center gap-1.5">
            {isCritical && (
              <motion.div
                className="w-2 h-2 rounded-full bg-danger"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-hidden="true"
              />
            )}
            <span className={cn("text-xs font-mono font-medium", isCritical ? "text-danger" : "text-tertiary")}>
              {hours}h remaining
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-surface-sub rounded-sm overflow-hidden">
          <motion.div 
            className={cn("h-full rounded-sm", isCritical ? "bg-danger" : "bg-accent")}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((hours / 24) * 100, 100)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </div>
      </div>
    </div>
  );
}
