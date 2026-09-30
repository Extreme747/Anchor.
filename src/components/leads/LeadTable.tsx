import React from 'react';
import { ArrowUpDown, MessageSquare, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Lead {
  id: number | string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city: string;
  source: string;
  status: string;
  score: number;
  tag: string;
  value: string;
  agent: string;
  created: string;
  lastContact: string;
  notes?: string;
}

interface LeadTableProps {
  leads: Lead[];
  selected: (number | string)[];
  onToggleSelect: (id: number | string) => void;
  onSelectAll: () => void;
  onEdit: (lead: Lead) => void;
  onOpenChat?: (lead: Lead) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function LeadTable({
  leads,
  selected,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onOpenChat,
  sortField,
  sortOrder,
  onSort,
}: LeadTableProps) {
  const isAllSelected = leads.length > 0 && selected.length === leads.length;

  return (
    <div className="w-full overflow-x-auto border border-border rounded-md bg-surface-card shadow-sm">
      <table className="w-full text-left border-collapse min-w-[850px]">
        <thead>
          <tr className="border-b border-border bg-surface-sub/80 text-[10px] font-mono text-tertiary uppercase tracking-wider">
            <th className="py-3 px-4 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="w-3.5 h-3.5 accent-[#C8953A] rounded-sm cursor-pointer"
                aria-label="Select all leads"
              />
            </th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onSort?.('name')}
            >
              <div className="flex items-center gap-1.5">
                <span>Prospect / Buyer</span>
                <ArrowUpDown size={11} />
              </div>
            </th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onSort?.('score')}
            >
              <div className="flex items-center gap-1.5">
                <span>Intent Score</span>
                <ArrowUpDown size={11} />
              </div>
            </th>
            <th className="py-3 px-4">Status</th>
            <th 
              className="py-3 px-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onSort?.('value')}
            >
              <div className="flex items-center gap-1.5">
                <span>Deal Value</span>
                <ArrowUpDown size={11} />
              </div>
            </th>
            <th className="py-3 px-4">Advisor</th>
            <th className="py-3 px-4">Last Activity</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50 text-xs">
          {leads.map((lead) => {
            const isSelected = selected.includes(lead.id);
            const score = lead.score || 0;
            const scoreColor = score >= 80 ? 'bg-accent text-accent' : score >= 50 ? 'bg-accent-light text-accent-light' : 'bg-tertiary text-tertiary';

            const statusVariant = 
              lead.status === 'NEW' ? 'gold' :
              lead.status === 'QUALIFIED' ? 'qualified' :
              lead.status === 'CONTACTED' ? 'contacted' :
              lead.status === 'WON' ? 'won' : 'default';

            return (
              <tr 
                key={lead.id}
                className={cn(
                  "transition-colors hover:bg-surface-hover/50 group",
                  isSelected && "bg-surface-hover/80"
                )}
              >
                <td className="py-3.5 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.id)}
                    className="w-3.5 h-3.5 accent-[#C8953A] rounded-sm cursor-pointer"
                    aria-label={`Select ${lead.name}`}
                  />
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={lead.name} size="sm" />
                    <div className="min-w-0">
                      <div className="font-medium text-primary truncate">{lead.name}</div>
                      <div className="font-mono text-[10px] text-tertiary truncate">
                        {lead.phone} · {lead.city} · {lead.source}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-sub rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", scoreColor.split(' ')[0])}
                        style={{ width: `${Math.min(score, 100)}%` }}
                      />
                    </div>
                    <span className={cn("font-mono text-xs font-semibold tabular-nums", scoreColor.split(' ')[1])}>
                      {score}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <Badge variant={statusVariant} className="text-[10px]">
                    {lead.status}
                  </Badge>
                </td>

                <td className="py-3.5 px-4 font-mono text-xs text-primary font-medium tabular-nums">
                  {lead.value}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-surface-hover flex items-center justify-center font-mono text-[9px] text-accent">
                      {lead.agent ? lead.agent[0] : 'A'}
                    </div>
                    <span className="font-mono text-xs text-secondary truncate max-w-[100px]">
                      {lead.agent || 'Unassigned'}
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] text-tertiary">
                  {lead.lastContact || lead.created}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1.5 rounded text-tertiary hover:text-primary hover:bg-surface-hover transition-colors"
                      title="Edit Prospect"
                      aria-label="Edit lead"
                    >
                      <Edit3 size={13} />
                    </button>
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(lead)}
                        className="p-1.5 rounded text-accent hover:text-accent-light hover:bg-accent/10 transition-colors"
                        title="Open WhatsApp Chat"
                        aria-label="Chat with lead"
                      >
                        <MessageSquare size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {leads.length === 0 && (
        <div className="text-center py-12 text-tertiary font-mono text-xs">
          No prospect records matching the current filters.
        </div>
      )}
    </div>
  );
}
