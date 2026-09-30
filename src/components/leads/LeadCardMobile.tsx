import React from 'react';
import { MessageSquare, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Lead } from './LeadTable';

interface LeadCardMobileProps {
  lead: Lead;
  isSelected: boolean;
  onToggleSelect: (id: number | string) => void;
  onEdit: (lead: Lead) => void;
  onOpenChat?: (lead: Lead) => void;
}

export function LeadCardMobile({
  lead,
  isSelected,
  onToggleSelect,
  onEdit,
  onOpenChat,
}: LeadCardMobileProps) {
  const score = lead.score || 0;
  const statusVariant = 
    lead.status === 'NEW' ? 'gold' :
    lead.status === 'QUALIFIED' ? 'qualified' :
    lead.status === 'CONTACTED' ? 'contacted' :
    lead.status === 'WON' ? 'won' : 'default';

  return (
    <Card 
      compact 
      className={cn(
        "p-3.5 space-y-2.5 transition-colors border",
        isSelected ? "bg-surface-hover border-border-strong" : "bg-surface-card border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(lead.id)}
            className="w-4 h-4 accent-[#C8953A] rounded-sm shrink-0"
            aria-label={`Select ${lead.name}`}
          />
          <Avatar name={lead.name} size="sm" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-primary truncate">{lead.name}</h4>
            <div className="font-mono text-[10px] text-tertiary truncate">
              {lead.phone} · {lead.city}
            </div>
          </div>
        </div>

        <Badge variant={statusVariant} className="text-[9px] shrink-0">
          {lead.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-tertiary">Score:</span>
          <span className="font-mono text-xs font-semibold text-accent tabular-nums">{score}</span>
        </div>

        <div className="font-mono text-xs text-accent font-medium tabular-nums">
          {lead.value}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-[10px] text-tertiary truncate">
          Agent: {lead.agent || 'Unassigned'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(lead)}
            className="p-1.5 rounded text-tertiary hover:text-primary bg-surface-sub hover:bg-surface-hover"
            aria-label="Edit lead"
          >
            <Edit3 size={13} />
          </button>
          {onOpenChat && (
            <button
              onClick={() => onOpenChat(lead)}
              className="p-1.5 rounded text-accent hover:text-accent-light bg-accent/10 hover:bg-accent/20"
              aria-label="Chat with lead"
            >
              <MessageSquare size={13} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
