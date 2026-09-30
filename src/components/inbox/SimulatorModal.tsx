import React, { useState } from 'react';
import { Bolt, Sparkles, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { simulatorApi } from '@/api/client';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function SimulatorModal({ isOpen, onClose, onCreated }: SimulatorModalProps) {
  const [name, setName] = useState('Vikrant Malhotra');
  const [phone, setPhone] = useState('+91 99887 77665');
  const [message, setMessage] = useState('Hi, saw your ad. Budget 2.5 Cr for 3BHK penthouse. Site visit kab kar sakte hain?');
  const [isCtwa, setIsCtwa] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await simulatorApi.sendInbound({
        name,
        phone,
        message,
        isCtwa,
        adHeadline: 'Luxury 3BHK Sector 62',
      });
      setResult(res);
      toast.success('Inbound WhatsApp Lead successfully simulated & ingested!');
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      toast.error('Error simulating lead: ' + (err?.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { label: '🔥 High-Ticket Site Visit (2.5 Cr)', text: 'Hi, saw your ad. Budget 2.5 Cr for 3BHK penthouse. Site visit kab kar sakte hain?' },
    { label: '⚡ Urgent Hinglish Inquiry', text: 'Rate kitna padega? Urgent possession chahiye iss weekend.' },
    { label: '📄 Brochure Request', text: 'Please send latest brochure and payment breakdown for Sector 62.' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-strong w-full max-w-lg p-6 space-y-4 shadow-2xl rounded-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Bolt size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-display text-lg text-primary">WhatsApp Inbound Simulator</h3>
              <p className="text-[11px] text-tertiary font-mono">Test Intent Engine & &lt;1.4s Auto-Reply Live</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-tertiary hover:text-primary font-mono text-sm p-1 rounded hover:bg-surface-hover transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[10px] text-tertiary block mb-1 uppercase tracking-wider font-semibold">Prospect Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-canvas border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-border-strong text-xs"
              placeholder="e.g. Vikrant Malhotra"
            />
          </div>

          <div>
            <label className="text-[10px] text-tertiary block mb-1 uppercase tracking-wider font-semibold">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-canvas border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-border-strong text-xs"
              placeholder="+91 99887 77665"
            />
          </div>

          <div>
            <label className="text-[10px] text-tertiary block mb-1 uppercase tracking-wider font-semibold">Inbound WhatsApp Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-canvas border border-border rounded-sm px-3 py-2 text-primary focus:outline-none focus:border-border-strong text-xs resize-none"
              placeholder="Type simulated inquiry..."
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-tertiary font-semibold flex items-center gap-1">
              <Sparkles size={11} className="text-accent" /> QUICK REAL ESTATE PRESETS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setMessage(p.text)}
                  className="px-2.5 py-1 bg-surface-sub hover:bg-surface-hover text-[10px] text-accent border border-border rounded-sm transition-colors text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTWA Checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-primary pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCtwa}
              onChange={e => setIsCtwa(e.target.checked)}
              className="accent-[#C8953A] w-4 h-4 rounded"
            />
            <span className="text-secondary text-[11px]">
              Simulate as <strong>Click-to-WhatsApp (CTWA) Ad Lead</strong> (72h Free Messaging Window)
            </span>
          </label>
        </div>

        {/* Result alert */}
        {result && (
          <div className="p-3 bg-success/10 border border-success/30 text-success font-mono text-xs rounded-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Lead Ingested! Intent Score: {result.lead?.intentScore || 91}/100 · Auto-reply dispatched!</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs text-tertiary"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSimulate}
            className="text-xs font-semibold px-4"
          >
            Dispatch Inbound Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
