import { cn } from '@/lib/utils';
import { Clock, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function SessionBar({ hours }: { hours: number }) {
  const isExpired = hours <= 0;
  const isCritical = hours > 0 && hours < 2;
  const isModerate = hours >= 2 && hours < 12;
  const isHealthy = hours >= 12;

  const statusColor = isExpired 
    ? 'text-danger' 
    : isCritical 
    ? 'text-danger' 
    : isModerate 
    ? 'text-accent' 
    : 'text-success';

  const barColor = isExpired 
    ? 'bg-danger' 
    : isCritical 
    ? 'bg-danger' 
    : isModerate 
    ? 'bg-accent' 
    : 'bg-success';

  return (
    <div className="p-3 bg-surface-card border border-border rounded-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpired ? (
            <Lock className="w-3.5 h-3.5 text-danger shrink-0" />
          ) : isCritical ? (
            <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0 animate-pulse" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-tertiary shrink-0" />
          )}
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Meta 24h Session
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCritical && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-danger"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              aria-hidden="true"
            />
          )}
          {isHealthy && (
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
          )}
          <span className={cn("text-xs font-mono font-semibold tabular-nums", statusColor)}>
            {isExpired ? 'Session Expired (0h)' : `${hours.toFixed(1)}h Remaining`}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-surface-sub rounded-sm overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-sm", barColor)}
          initial={{ width: 0 }}
          animate={{ width: isExpired ? '100%' : `${Math.min(Math.max((hours / 24) * 100, 4), 100)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      </div>

      {/* Subtext info or Template Lock Notice */}
      {isExpired ? (
        <div className="flex items-center justify-between text-[10px] font-mono text-danger bg-danger/10 border border-danger/20 px-2 py-1 rounded">
          <span>🔒 Free-form messaging locked by Meta.</span>
          <span className="font-semibold underline cursor-pointer hover:text-white">Use Approved HSM Template →</span>
        </div>
      ) : isCritical ? (
        <div className="flex items-center justify-between text-[10px] font-mono text-tertiary">
          <span className="text-danger">⚠️ Session closing soon — send reply to reset 24h clock</span>
          <span className="text-secondary">Direct WhatsApp Pass-Through</span>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] font-mono text-tertiary">
          <span>Standard customer service window active</span>
          <span className="text-success font-medium">Free 2-Way Chat</span>
        </div>
      )}
    </div>
  );
}
