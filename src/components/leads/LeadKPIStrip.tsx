import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, UserPlus, Flame, Target, IndianRupee } from 'lucide-react';

interface LeadKPIStripProps {
  leads: any[];
}

export function LeadKPIStrip({ leads }: LeadKPIStripProps) {
  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'NEW' || l.status === 'new').length;
  const qualifiedCount = leads.filter(l => l.status === 'QUALIFIED' || l.status === 'qualified').length;
  const hotCount = leads.filter(l => (l.score || l.intentScore || 0) >= 80).length;

  const kpis = [
    { label: 'Total Inbound', value: total, sub: '+14% this week', icon: Users, color: 'text-primary' },
    { label: 'New Inquiries', value: newCount, sub: 'Needs first reply', icon: UserPlus, color: 'text-accent' },
    { label: 'Qualified Leads', value: qualifiedCount, sub: 'Site visits ready', icon: Target, color: 'text-info' },
    { label: 'High Intent (80+)', value: hotCount, sub: 'Close priority', icon: Flame, color: 'text-accent' },
    { label: 'Pipeline Value', value: '₹14.8 Cr', sub: 'Active demand', icon: IndianRupee, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <Card key={k.label} compact className="relative overflow-hidden group hover:border-border-strong transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider">{k.label}</span>
              <Icon size={14} className={k.color} />
            </div>
            <div className="font-display text-2xl text-primary font-medium tracking-tight tabular-nums">
              {k.value}
            </div>
            <div className="font-mono text-[10px] text-tertiary mt-1 flex items-center gap-1">
              <span>{k.sub}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
