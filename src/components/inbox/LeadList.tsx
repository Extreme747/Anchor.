import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LeadListProps {
  leads: any[];
  selected: string;
  onSelect: (id: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  onOpenSim: () => void;
  className?: string;
}

export function LeadList({ leads, selected, onSelect, filter, setFilter, onOpenSim, className }: LeadListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredLeads = useMemo(() => {
    let list = leads;
    const filterLower = filter.toLowerCase();

    if (filterLower === 'new') {
      list = leads.filter(l => l.status?.toLowerCase() === 'new');
    } else if (filterLower === 'hot') {
      list = leads.filter(l => (l.score || 0) >= 80 || (l.tags && l.tags.some((t: string) => t.toLowerCase().includes('hot'))) || l.tag === 'Hot');
    } else if (filterLower === 'qualified') {
      list = leads.filter(l => l.status?.toLowerCase() === 'qualified' || l.tag === 'Qualified');
    }
    
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(l => 
        l.name?.toLowerCase().includes(q) || 
        l.phone?.includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, filter, debouncedSearch]);

  // J / K Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = filteredLeads.findIndex(l => String(l.id) === String(selected));
        if (idx >= 0 && idx < filteredLeads.length - 1) {
          onSelect(String(filteredLeads[idx + 1].id));
        } else if (idx === -1 && filteredLeads.length > 0) {
          onSelect(String(filteredLeads[0].id));
        }
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = filteredLeads.findIndex(l => String(l.id) === String(selected));
        if (idx > 0) {
          onSelect(String(filteredLeads[idx - 1].id));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredLeads, selected, onSelect]);

  const tabs = [
    { id: 'All', label: 'All', count: leads.length },
    { id: 'New', label: 'New', count: leads.filter(l => l.status?.toLowerCase() === 'new').length },
    { id: 'Hot', label: 'Hot 🔥', count: leads.filter(l => (l.score || 0) >= 80 || l.tag === 'Hot').length },
    { id: 'Qualified', label: 'Qualified', count: leads.filter(l => l.status?.toLowerCase() === 'qualified').length },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-surface-sub border-r border-border shrink-0 select-none", className)}>
      {/* Search & Actions */}
      <div className="p-3 border-b border-border space-y-2.5">
        <Button 
          variant="secondary" 
          size="sm"
          className="w-full justify-center gap-1.5 border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-black font-mono text-[11px] h-8 transition-all"
          onClick={onOpenSim}
        >
          <Zap size={13} className="fill-current" />
          <span>⚡ Simulate Inbound Lead</span>
        </Button>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary" size={13} />
          <input 
            placeholder="Search leads, phone, city... (J/K to move)" 
            className="w-full bg-canvas border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-primary placeholder:text-tertiary focus:outline-none focus:border-border-strong font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {tabs.map(t => {
            const isActive = filter.toLowerCase() === t.id.toLowerCase();
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm transition-all whitespace-nowrap flex items-center gap-1",
                  isActive 
                    ? "bg-accent text-black font-semibold shadow-sm" 
                    : "text-tertiary hover:text-primary hover:bg-surface-hover"
                )}
              >
                <span>{t.label}</span>
                <span className={cn(
                  "text-[9px] px-1 rounded",
                  isActive ? "bg-black/20 text-black" : "bg-surface-card text-tertiary"
                )}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead List Stream */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredLeads.map((lead, i) => {
            const isSelected = String(selected) === String(lead.id);
            const unread = lead.unread || lead.unreadCount || 0;
            const preview = lead.preview || lead.lastMessage || 'Inbound property inquiry';
            const time = lead.time || (lead.lastMessageAt ? new Date(lead.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now');
            const score = lead.score ?? lead.intentScore ?? 75;
            const leadTag = Array.isArray(lead.tags) && lead.tags.length > 0 ? lead.tags[0] : (lead.tag || 'New');
            const isCtwa = Boolean(lead.ctwa || lead.isCtwa);

            return (
              <motion.div
                key={lead.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.02, 0.2), type: "spring", stiffness: 350, damping: 28 }}
                onClick={() => onSelect(String(lead.id))}
                className={cn(
                  "group relative p-3 rounded-md cursor-pointer transition-all border flex gap-3",
                  isSelected
                    ? "bg-surface-hover border-border-strong shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "bg-transparent border-transparent hover:bg-surface-card/60 hover:border-border/60"
                )}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" />
                )}

                {/* Avatar with unread count */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar name={lead.name} status="online" size="default" />
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 bg-accent text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                      {unread}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-xs font-semibold text-primary truncate pr-1">{lead.name}</h4>
                    <span className="text-[10px] font-mono text-tertiary shrink-0">{time}</span>
                  </div>
                  
                  <p className="text-[11px] text-secondary truncate mb-2 leading-tight">
                    {preview}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn(
                      "font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded border",
                      score >= 80 
                        ? "border-accent/40 text-accent bg-accent/10" 
                        : "border-border text-tertiary bg-surface-card"
                    )}>
                      {score}
                    </span>

                    <span className="font-mono text-[9px] text-tertiary px-1 bg-surface-card rounded border border-border">
                      {leadTag}
                    </span>

                    {lead.value && (
                      <span className="font-mono text-[10px] text-accent font-medium ml-auto tabular-nums">
                        {lead.value}
                      </span>
                    )}

                    {isCtwa && (
                      <span className="font-mono text-[8px] text-info border border-info/30 bg-info/10 px-1 rounded">
                        CTWA
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-tertiary font-mono text-xs">
            No leads matching filter
          </div>
        )}
      </div>
    </div>
  );
}
