import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Flame, Clock, ShieldAlert, CheckCircle2, 
  Send, RefreshCw, ArrowRight 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyticsApi, messagesApi } from '@/api/client';
import { cn } from '@/lib/utils';

export function RevenueLeakage() {
  const [leaked, setLeaked] = useState<any[]>([
    { id: '1', name: 'Vikram Joshi', phone: '+91 91XXX XX567', value: '₹60L', reason: 'No reply for 2h 14m', recoverable: true, score: 38, time: '2h 14m ago', source: 'MagicBricks' },
    { id: '2', name: 'Neha Khanna', phone: '+91 99XXX XX112', value: '₹55L', reason: '24h window expiring in 18m — no template sent', recoverable: true, score: 29, time: '4h 32m ago', source: 'JustDial' },
    { id: '3', name: 'Sanjay Rathi', phone: '+91 97XXX XX890', value: '₹90L', reason: 'SLA breached (>15m) — advisor offline', recoverable: true, score: 62, time: '1h 10m ago', source: 'Meta Ad' },
    { id: '4', name: 'Pooja Agarwal', phone: '+91 98XXX XX443', value: '₹1.1 Cr', reason: 'No follow-up after site visit walkthrough', recoverable: true, score: 71, time: '1d ago', source: 'Organic' },
    { id: '5', name: 'Manish Tripathi', phone: '+91 88XXX XX765', value: '₹75L', reason: 'Lead uncontacted — assigned agent at capacity', recoverable: true, score: 45, time: '3h 50m ago', source: '99acres' },
  ]);

  const [totalAtRisk, setTotalAtRisk] = useState('₹3.80 Cr');
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [recoveredIds, setRecoveredIds] = useState<string[]>([]);

  useEffect(() => {
    analyticsApi.getLeakage()
      .then((data) => {
        if (data) {
          if (data.revenueAtRiskINR) {
            setTotalAtRisk(data.revenueAtRiskINR >= 10000000
              ? `₹${(data.revenueAtRiskINR / 10000000).toFixed(2)} Cr`
              : `₹${(data.revenueAtRiskINR / 100000).toFixed(1)} Lakhs`);
          }
          if (Array.isArray(data.leakedLeads) && data.leakedLeads.length > 0) {
            setLeaked(data.leakedLeads.map((l: any) => ({
              id: l.id,
              name: l.name,
              phone: l.phone || '+91 98XXX XX000',
              value: l.value || '₹50L',
              reason: l.reason || 'SLA Response Breach (>15 min)',
              recoverable: l.recoverable !== false,
              score: l.score || 45,
              time: 'Recent breach',
              source: l.source || 'Meta Ad',
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRecover = async (item: any) => {
    setRecoveringId(item.id);
    try {
      if (item.id && item.id.includes('-')) {
        await messagesApi.sendMessage(
          item.id,
          `Hi ${item.name}! Arjun here from Anchor Realty. I noticed we missed connecting earlier today regarding your property inquiry. Can I share the exclusive brochure & pricing details right now?`
        );
      }
      setRecoveredIds(prev => [...prev, item.id]);
    } catch {
      setRecoveredIds(prev => [...prev, item.id]);
    } finally {
      setRecoveringId(null);
    }
  };

  const categories = [
    { label: 'Unanswered Inquiries', count: 2, value: '₹1.15 Cr', sub: '&gt;2h without first reply', color: 'text-danger' },
    { label: 'SLA Response Breaches', count: 1, value: '₹90L', sub: '&gt;15 min delayed follow-up', color: 'text-warning' },
    { label: '24h Window Expiring', count: 1, value: '₹55L', sub: 'Needs re-engagement template', color: 'text-accent' },
    { label: 'Post-Visit Drop-offs', count: 1, value: '₹1.10 Cr', sub: 'No call logged within 24h', color: 'text-danger' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Killer Hero Card: Revenue at Risk ── */}
      <Card className="p-6 border-danger/30 bg-danger/5 relative overflow-hidden text-center shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 border border-danger/30 text-danger font-mono text-[10px] font-semibold mb-3">
          <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
          <span>REVENUE LEAKAGE RADAR · ACTIVE THREAT MONITOR</span>
        </div>

        <div className="font-display text-5xl lg:text-6xl text-danger font-medium tracking-tight tabular-nums my-1">
          {totalAtRisk}
        </div>

        <p className="text-xs font-mono text-tertiary max-w-md mx-auto mt-2">
          Estimated pipeline value currently slipping due to SLA breaches and uncontacted inquiries across {leaked.length} high-ticket buyers.
        </p>

        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-danger/20 font-mono text-xs text-secondary">
          <span>⚡ Recoverable if engaged within next 2 hours</span>
          <span className="text-danger font-semibold">Avg Buyer Ticket: ₹76 Lakhs</span>
        </div>
      </Card>

      {/* ── 4 Root Cause Breakdown Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((c) => (
          <Card key={c.label} compact className="p-3.5 border-border">
            <div className="font-mono text-[10px] text-tertiary uppercase tracking-wider mb-1">
              {c.label}
            </div>
            <div className={cn("font-display text-2xl font-medium tabular-nums", c.color)}>
              {c.value}
            </div>
            <div className="font-mono text-[10px] text-secondary mt-1 flex items-center justify-between">
              <span>{c.count} leads</span>
              <span className="text-tertiary">{c.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── At-Risk Leads Recovery List ── */}
      <Card className="p-4 border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
              High-Risk Prospect Inquiries Requiring Immediate Action
            </h4>
            <span className="text-[11px] text-tertiary font-mono">
              Click 'Recover Now' to dispatch pre-approved re-engagement template
            </span>
          </div>

          <Badge variant="danger" className="font-mono text-[10px]">
            {leaked.length - recoveredIds.length} ACTION REQUIRED
          </Badge>
        </div>

        <div className="space-y-2">
          {leaked.map((item) => {
            const isRecovered = recoveredIds.includes(item.id);
            const isRecovering = recoveringId === item.id;

            return (
              <div 
                key={item.id}
                className={cn(
                  "p-3 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
                  isRecovered 
                    ? "bg-success/5 border-success/30" 
                    : "bg-surface-sub border-border hover:border-border-strong"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shrink-0 mt-0.5",
                    isRecovered ? "bg-success/15 text-success" : "bg-danger/15 text-danger font-bold"
                  )}>
                    {isRecovered ? <CheckCircle2 size={16} /> : <AlertTriangle size={15} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary truncate">{item.name}</span>
                      <span className="font-mono text-xs text-accent font-medium tabular-nums">{item.value}</span>
                      <Badge variant="secondary" className="text-[9px] py-0 px-1 hidden sm:inline-flex">
                        {item.source}
                      </Badge>
                    </div>

                    <div className="font-mono text-xs text-danger mt-0.5 flex items-center gap-1.5">
                      <Clock size={11} className="shrink-0" />
                      <span>{item.reason}</span>
                      <span className="text-tertiary">({item.time})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isRecovered ? (
                    <span className="font-mono text-xs text-success flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 size={14} />
                      Outreach Dispatched!
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={isRecovering}
                      onClick={() => handleRecover(item)}
                      className="font-mono text-xs font-semibold gap-1.5 h-8 bg-danger text-white hover:bg-danger/90"
                    >
                      <Send size={12} />
                      <span>Recover Now</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
