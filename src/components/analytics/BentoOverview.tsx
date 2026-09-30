import React, { useState } from 'react';
import { 
  TrendingUp, Clock, Zap, ArrowUpRight, ShieldCheck, 
  Target, IndianRupee, Sparkles, MessageSquare, Flame 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveLineChart } from '@/components/ui/chart';
import { Sparkline } from '@/components/ui/sparkline';
import { NumberCounter } from '@/components/ui/number-counter';
import { cn } from '@/lib/utils';

interface BentoOverviewProps {
  liveKpis?: any;
}

export function BentoOverview({ liveKpis }: BentoOverviewProps) {
  const [range, setRange] = useState('7d');

  const volumePoints = [
    { label: 'Mon', value: 34 },
    { label: 'Tue', value: 42 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 58 },
    { label: 'Fri', value: 51 },
    { label: 'Sat', value: 68 },
    { label: 'Sun', value: 61 },
  ];

  const ranges = ['24h', '7d', '30d', '90d', 'YTD'];

  return (
    <div className="space-y-4">
      {/* Date Range & Workspace Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-xs text-tertiary">
            Telemetry Stream · Gurugram Real Estate Workspace (Sec 62 & Ext)
          </span>
        </div>

        <div className="flex gap-1 bg-surface-card p-1 rounded-md border border-border">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 font-mono text-[10px] rounded-sm transition-all",
                range === r 
                  ? "bg-accent text-black font-semibold shadow-sm" 
                  : "text-tertiary hover:text-primary hover:bg-surface-hover"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid 2.0 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* ── CELL A (Hero 2x2): High-Ticket Real Estate Pipeline ── */}
        <Card className="md:col-span-2 lg:col-span-2 p-5 flex flex-col justify-between border-border-strong relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <IndianRupee size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-mono font-semibold text-tertiary uppercase tracking-wider">
                    Total Active Pipeline Value
                  </h3>
                  <span className="text-[11px] text-tertiary">42 qualified prospect inquiries</span>
                </div>
              </div>

              <Badge variant="gold" className="font-mono text-[10px]">
                ↑ 14.8% vs last week
              </Badge>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="font-display text-4xl lg:text-5xl text-primary font-medium tracking-tight tabular-nums">
                ₹18.4 Cr
              </span>
              <span className="text-xs font-mono text-success flex items-center gap-0.5">
                <TrendingUp size={13} />
                <span>+₹2.4 Cr fresh</span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-3">
            <div className="flex items-center justify-between text-xs font-mono text-tertiary mb-2">
              <span>7-Day Value Velocity</span>
              <span className="text-accent font-semibold">₹2.6 Cr avg/day</span>
            </div>
            <Sparkline 
              data={[12, 14, 13.5, 16, 15.2, 17.8, 18.4]} 
              width={340} 
              height={36} 
              color="#C8953A"
              className="w-full"
            />
          </div>
        </Card>

        {/* ── CELL B (1x1): Agent First Response Time (FRT) ── */}
        <Card className="p-4 flex flex-col justify-between border-border hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider">First Reply Speed</span>
            <div className="w-6 h-6 rounded bg-success/10 flex items-center justify-center text-success">
              <Zap size={13} />
            </div>
          </div>

          <div className="my-2">
            <div className="font-display text-3xl text-primary font-medium tabular-nums">
              <NumberCounter value={42} suffix="s" />
            </div>
            <div className="font-mono text-[11px] text-success mt-1">
              ⚡ Target &lt;90s (98.4% SLA met)
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-tertiary flex items-center justify-between">
            <span>Fastest: Kabir (18s)</span>
            <span className="text-accent">Auto-reply: 1.4s</span>
          </div>
        </Card>

        {/* ── CELL C (1x1): 24h Meta Session Window Health ── */}
        <Card className="p-4 flex flex-col justify-between border-border hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider">24h Meta Window</span>
            <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent">
              <Clock size={13} />
            </div>
          </div>

          <div className="my-2">
            <div className="font-display text-3xl text-primary font-medium tabular-nums">
              <NumberCounter value={94.2} suffix="%" decimals={1} />
            </div>
            <div className="font-mono text-[11px] text-tertiary mt-1">
              Replied within freeform window
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-tertiary flex items-center justify-between">
            <span>Active Sessions: 28</span>
            <span className="text-danger font-semibold">3 &lt; 2h left</span>
          </div>
        </Card>

        {/* ── CELL D (2x1 / 2-col): Click-to-WhatsApp (CTWA) Ad Attribution ── */}
        <Card className="md:col-span-2 lg:col-span-2 p-4 flex flex-col justify-between border-border hover:border-border-strong transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-info/10 flex items-center justify-center text-info">
                <Target size={13} />
              </div>
              <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider">
                Click-to-WhatsApp (CTWA) Ad ROAS
              </span>
            </div>
            <Badge variant="success" className="text-[9px]">
              📢 72H FREE WINDOWS
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2 text-center">
            <div className="p-2 bg-surface-sub rounded border border-border">
              <div className="font-display text-xl text-primary tabular-nums">14.2x</div>
              <div className="font-mono text-[9px] text-tertiary mt-0.5">Estimated ROAS</div>
            </div>
            <div className="p-2 bg-surface-sub rounded border border-border">
              <div className="font-display text-xl text-accent tabular-nums">₹412</div>
              <div className="font-mono text-[9px] text-tertiary mt-0.5">Cost / Hot Lead</div>
            </div>
            <div className="p-2 bg-surface-sub rounded border border-border">
              <div className="font-display text-xl text-success tabular-nums">₹1.8 Cr</div>
              <div className="font-mono text-[9px] text-tertiary mt-0.5">Won Ad Revenue</div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-tertiary flex items-center justify-between">
            <span className="truncate">Top Campaign: Instagram Reels #7821 (Luxury 3BHK)</span>
            <span className="text-primary font-semibold">89 leads</span>
          </div>
        </Card>

        {/* ── CELL E (1x1): Zero Meta Markup Cost Advantage ── */}
        <Card className="p-4 flex flex-col justify-between border-border bg-accent/5 hover:border-accent/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold">
              ₹0 Anchor Markup
            </span>
            <ShieldCheck size={14} className="text-accent" />
          </div>

          <div className="my-2">
            <div className="font-display text-2xl text-primary font-medium tabular-nums">
              ₹16,380
            </div>
            <div className="font-mono text-[10px] text-secondary mt-1">
              Saved this month vs Wati & Interakt per-convo markups
            </div>
          </div>

          <div className="pt-2 border-t border-accent/20 text-[10px] font-mono text-accent">
            Official Meta Cloud Direct Billing ✓
          </div>
        </Card>

        {/* ── CELL F (1x1): Weekend Site Visits Booked ── */}
        <Card className="p-4 flex flex-col justify-between border-border hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider">Site Visits Booked</span>
            <Flame size={14} className="text-accent" />
          </div>

          <div className="my-2">
            <div className="font-display text-3xl text-primary font-medium tabular-nums">
              <NumberCounter value={18} />
            </div>
            <div className="font-mono text-[11px] text-success mt-1">
              Confirmed for this weekend
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-tertiary flex items-center justify-between">
            <span>Avg Value: ₹1.6 Cr</span>
            <span className="text-accent">95% show rate</span>
          </div>
        </Card>
      </div>

      {/* ── 7-Day Inbound Volume Chart (Interactive) ── */}
      <Card className="p-4 border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
              7-Day Inbound WhatsApp Inquiries Trend
            </h4>
            <span className="text-[11px] text-tertiary font-mono">Hover data points to inspect daily inquiry counts</span>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            Peak: Sat (68 leads)
          </Badge>
        </div>

        <InteractiveLineChart
          data={volumePoints}
          valueSuffix=" leads"
          height={140}
          color="#C8953A"
        />
      </Card>
    </div>
  );
}
