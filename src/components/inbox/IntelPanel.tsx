import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IntentDial } from './IntentDial';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe, MousePointer, Clock, Activity, Building2, Zap, DollarSign } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

interface IntelPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  className?: string;
  onClose?: () => void;
}

export function IntelPanel({ lead, className, onClose }: IntelPanelProps) {
  if (!lead) return null;

  const score = lead.score ?? lead.intentScore ?? 85;
  const leadTag = Array.isArray(lead.tags) && lead.tags.length > 0 ? lead.tags[0] : (lead.tag || 'Hot');
  const allTags = Array.isArray(lead.tags) && lead.tags.length > 0 ? lead.tags : [leadTag, lead.source, lead.city].filter(Boolean);
  const pipelineValue = lead.value || '₹1.2 Cr';
  const isCtwa = Boolean(lead.ctwa || lead.isCtwa);

  const activities = [
    { time: 'Just now', text: 'Intent score computed: ' + score + '/100', icon: Zap, color: 'text-accent' },
    { time: '2m ago', text: 'WhatsApp inbound inquiry received', icon: MousePointer, color: 'text-info' },
    { time: '2m ago', text: 'Auto-reply dispatched in 1.4s', icon: Activity, color: 'text-success' },
    { time: '1h ago', text: 'Lead ingested via ' + (lead.source || 'Meta Ad'), icon: Clock, color: 'text-tertiary' },
  ];

  return (
    <div className={cn("flex flex-col w-full h-full bg-surface-sub border-l border-border overflow-y-auto", className)}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={lead.id || 'panel'}
        className="p-4 flex flex-col gap-4"
      >
        {/* Header / Intent Dial */}
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-5 bg-surface-card rounded-md border border-border shadow-sm text-center">
          <IntentDial score={score} size="lg" />
          <h3 className="mt-3 font-display text-lg text-primary">{lead.name || 'Unknown Lead'}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-sm text-accent font-medium tabular-nums">{pipelineValue}</span>
            <span className="text-xs text-tertiary">pipeline</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Badge variant={score >= 80 ? 'gold' : score >= 50 ? 'warning' : 'default'}>
              {score >= 80 ? 'HOT PROSPECT' : score >= 50 ? 'WARM' : 'COLD'}
            </Badge>
            {isCtwa && (
              <Badge variant="success" className="text-[9px]">
                📢 CTWA AD
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <h4 className="text-[10px] font-mono font-medium text-tertiary uppercase tracking-wider">Tags & Segments</h4>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs py-0.5 px-2">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Lead Details / Firmographics */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <h4 className="text-[10px] font-mono font-medium text-tertiary uppercase tracking-wider">Prospect Metadata</h4>
          <div className="flex flex-col gap-2.5 p-3.5 bg-surface-card rounded-md border border-border text-xs">
            <div className="flex items-center justify-between">
              <span className="text-tertiary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> City
              </span>
              <span className="text-primary font-medium">{lead.city || 'Gurugram'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tertiary flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Channel Source
              </span>
              <span className="text-primary font-medium">{lead.source || 'Meta Ad'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tertiary flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Deal Value
              </span>
              <span className="text-accent font-mono tabular-nums">{pipelineValue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tertiary flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 24h Meta Window
              </span>
              <span className={cn("font-mono font-medium", isCtwa ? "text-success" : "text-accent")}>
                {isCtwa ? '72h Free (CTWA)' : 'Standard 24h'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Activity Log */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <h4 className="text-[10px] font-mono font-medium text-tertiary uppercase tracking-wider">Live Activity Stream</h4>
          <div className="flex flex-col gap-3 p-3.5 bg-surface-card rounded-md border border-border">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", a.color)} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-primary leading-tight">{a.text}</span>
                    <span className="text-[10px] text-tertiary font-mono mt-0.5">{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
