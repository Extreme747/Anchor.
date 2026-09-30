import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { 
  Search, Users, MessageSquare, BarChart3, Settings, 
  GitBranch, FileText, Zap, Plus, ArrowRight, 
  Flame, DollarSign, Sparkles, X, Shield, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kbd } from './kbd';
import { Badge } from './badge';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tabId: string) => void;
  onNewLead?: () => void;
  onSimulate?: () => void;
}

const RECENT_LEADS = [
  { id: '1', name: 'Arjun Sharma', phone: '+91 98XXX XX210', value: '₹1.4 Cr', score: 91, source: 'CTWA Ad' },
  { id: '5', name: 'Kavita Reddy', phone: '+91 88XXX XX221', value: '₹3.2 Cr', score: 95, source: 'Meta Ad' },
  { id: '3', name: 'Sunita Bose', phone: '+91 98XXX XX034', value: '₹95L', score: 88, source: 'Meta Ad' },
  { id: '2', name: 'Priya Mehta', phone: '+91 87XXX XX345', value: '₹1.2 Cr', score: 74, source: 'Organic' },
];

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onNewLead,
  onSimulate,
}: CommandPaletteProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="w-full max-w-2xl bg-surface-card border border-border-strong rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full flex flex-col font-sans">
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 border-b border-border bg-surface-sub/80">
            <Search className="w-4 h-4 text-tertiary shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search leads, commands, templates... (Type 'leads', 'analytics', 'Arjun'...)"
              className="w-full bg-transparent py-3.5 text-sm text-primary placeholder:text-tertiary focus:outline-none font-mono"
            />
            <button 
              onClick={() => onOpenChange(false)}
              className="text-tertiary hover:text-primary p-1 rounded hover:bg-surface-hover"
              aria-label="Close command palette"
            >
              <X size={16} />
            </button>
          </div>

          {/* List of Suggestions */}
          <Command.List className="max-h-[380px] overflow-y-auto p-2 space-y-2 select-none scrollbar-hide">
            <Command.Empty className="py-10 text-center font-mono text-xs text-tertiary">
              No matching prospects or actions found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="QUICK ACTIONS" className="text-[10px] font-mono text-tertiary px-2 py-1 uppercase tracking-wider font-semibold">
              <Command.Item
                onSelect={() => {
                  onOpenChange(false);
                  if (onNewLead) onNewLead();
                  else onNavigate('leads');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-sm text-xs text-primary hover:bg-surface-hover hover:text-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                    <Plus size={12} />
                  </div>
                  <span>Create New Prospect Record</span>
                </div>
                <Kbd keys={["⌘", "N"]} />
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenChange(false);
                  if (onSimulate) onSimulate();
                  else onNavigate('inbox');
                }}
                className="flex items-center justify-between px-3 py-2 rounded-sm text-xs text-primary hover:bg-surface-hover hover:text-accent cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                    <Zap size={12} />
                  </div>
                  <span>Simulate WhatsApp Inbound Lead</span>
                </div>
                <Kbd keys={["⌘", "⇧", "S"]} />
              </Command.Item>
            </Command.Group>

            {/* Recent High-Intent Leads */}
            <Command.Group heading="RECENT HIGH-INTENT PROSPECTS" className="text-[10px] font-mono text-tertiary px-2 py-1 uppercase tracking-wider font-semibold">
              {RECENT_LEADS.map(lead => (
                <Command.Item
                  key={lead.id}
                  value={`${lead.name} ${lead.phone} ${lead.source} ${lead.value}`}
                  onSelect={() => {
                    onOpenChange(false);
                    onNavigate('inbox');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-sm text-xs text-primary hover:bg-surface-hover cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-surface-sub border border-border flex items-center justify-center font-mono text-[10px] text-accent shrink-0">
                      {lead.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <span>{lead.name}</span>
                        <span className="font-mono text-[10px] text-tertiary">{lead.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-accent font-medium tabular-nums">{lead.value}</span>
                    <Badge variant="gold" className="text-[9px] py-0 px-1">
                      🔥 {lead.score}
                    </Badge>
                    <span className="font-mono text-[9px] text-tertiary hidden sm:inline">{lead.source}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Navigation Modules */}
            <Command.Group heading="NAVIGATION MODULES" className="text-[10px] font-mono text-tertiary px-2 py-1 uppercase tracking-wider font-semibold">
              {[
                { id: 'inbox', label: 'Command Inbox & Chat', icon: MessageSquare, chord: ['G', 'I'] },
                { id: 'leads', label: 'Lead Database & Pipeline', icon: Users, chord: ['G', 'L'] },
                { id: 'analytics', label: 'Revenue Intelligence & Analytics', icon: BarChart3, chord: ['G', 'A'] },
                { id: 'drip', label: 'Drip Engine & 24h Meta Sequences', icon: GitBranch, chord: ['G', 'D'] },
                { id: 'templates', label: 'Approved Meta HSM Templates', icon: FileText, chord: ['G', 'T'] },
                { id: 'auto-reply', label: 'Deterministic Auto-Reply Gateway', icon: Zap },
                { id: 'commerce', label: 'Flows & Conversational Commerce', icon: CreditCard },
                { id: 'routing', label: 'Routing Rules & Agent SLA', icon: Users },
                { id: 'protocol', label: 'Meta Cloud API Protocol Diagnostics', icon: Shield },
                { id: 'settings', label: 'Workspace & Number Settings', icon: Settings, chord: ['G', 'S'] },
              ].map(nav => {
                const Icon = nav.icon;
                return (
                  <Command.Item
                    key={nav.id}
                    value={nav.label}
                    onSelect={() => {
                      onOpenChange(false);
                      onNavigate(nav.id);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-sm text-xs text-secondary hover:text-primary hover:bg-surface-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-tertiary" />
                      <span>{nav.label}</span>
                    </div>
                    {nav.chord && <Kbd keys={nav.chord} />}
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>

          {/* Footer Bar with Keyboard Cheatsheet */}
          <div className="px-4 py-2 border-t border-border bg-surface-sub/80 flex items-center justify-between text-[11px] font-mono text-tertiary">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑↓</Kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Esc</Kbd> Close
              </span>
            </div>
            <div className="flex items-center gap-1 text-accent font-medium">
              <Sparkles size={11} />
              <span>Anchor Velocity Engine</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
