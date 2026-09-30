import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card border border-border-strong w-full max-w-lg rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-sub">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-accent" />
            <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
              Import Leads from CSV
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-tertiary hover:text-primary transition-colors p-1 rounded hover:bg-surface-hover"
            aria-label="Close import modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex border-b border-border bg-surface-card">
          {['Upload', 'Map Columns', 'Preview', 'Import'].map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <div 
                key={s} 
                className="flex-1 py-2 text-center font-mono text-[10px] transition-colors"
                style={{ 
                  color: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-success)' : 'var(--color-tertiary)',
                  borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent' 
                }}
              >
                {isCompleted ? <CheckCircle2 size={10} className="inline mr-1" /> : `${stepNum}. `}
                <span>{s}</span>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); setStep(2); }}
              className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all rounded-md ${
                isDragging 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border hover:border-accent/40 bg-surface-sub/50'
              }`}
              onClick={() => setStep(2)}
            >
              <UploadCloud className="w-10 h-10 text-accent/70 mx-auto mb-3" />
              <div className="font-medium text-sm text-primary">Drop your leads CSV here or click to browse</div>
              <div className="font-mono text-[11px] text-tertiary mt-1.5">
                Supports MagicBricks, 99acres, Housing.com exports · Up to 10,000 leads
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="font-mono text-xs text-secondary mb-3">Map CSV columns to Anchor CRM fields:</div>
              {[
                { csv: 'Buyer Name', anchor: 'Name' },
                { csv: 'Phone Number', anchor: 'Phone' },
                { csv: 'Email Address', anchor: 'Email' },
                { csv: 'City / Region', anchor: 'City' },
                { csv: 'Portal Source', anchor: 'Source' },
              ].map(m => (
                <div key={m.csv} className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-sub border border-border px-3 py-2 font-mono text-xs text-secondary rounded-sm">
                    {m.csv}
                  </div>
                  <ArrowRight size={13} className="text-tertiary shrink-0" />
                  <select 
                    className="flex-1 bg-surface-sub border border-border text-primary text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-border-strong cursor-pointer font-mono"
                    defaultValue={m.anchor}
                  >
                    <option>Name</option>
                    <option>Phone</option>
                    <option>Email</option>
                    <option>City</option>
                    <option>Source</option>
                    <option>Skip Column</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="font-mono text-xs text-secondary mb-2">Review first 3 mapped prospect records:</div>
              <div className="border border-border rounded-md overflow-hidden text-xs">
                <div className="grid grid-cols-4 px-3 py-2 border-b border-border bg-surface-sub font-mono text-[10px] text-tertiary gap-2">
                  <span>NAME</span><span>PHONE</span><span>CITY</span><span>PORTAL</span>
                </div>
                {[
                  ['Arjun Sharma', '+91 98765 43210', 'Gurugram', 'MagicBricks'],
                  ['Priya Mehta', '+91 87654 32109', 'Delhi', '99acres'],
                  ['Rohit Gupta', '+91 76543 21098', 'Noida', 'Housing.com'],
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 px-3 py-2 border-b border-border/50 last:border-0 text-primary gap-2 font-mono text-[11px]">
                    {row.map((cell, j) => <span key={j} className="truncate">{cell}</span>)}
                  </div>
                ))}
              </div>
              <div className="font-mono text-[11px] text-accent mt-2 bg-accent/10 border border-accent/20 p-2.5 rounded-sm">
                ⚡ 247 leads ready for ingestion · 3 duplicate phone numbers automatically deduplicated
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full border border-success/30 bg-success/10 flex items-center justify-center mx-auto mb-3 text-success">
                <CheckCircle2 size={24} />
              </div>
              <div className="font-display text-xl text-primary mb-1">244 Leads Ingested Successfully</div>
              <p className="font-mono text-xs text-secondary max-w-sm mx-auto">
                All contacts verified & ready in your pipeline. Deterministic intent scoring and 24h Meta session timers have been initiated.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-6 pt-3 border-t border-border">
            {step > 1 && step < 4 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setStep(s => s - 1)} 
                className="flex-1 font-mono text-xs"
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (step === 3) {
                  toast.success('244 prospect records ingested & deduplicated successfully!');
                }
                if (step < 4) {
                  setStep(s => s + 1);
                } else {
                  if (onSuccess) onSuccess();
                  onClose();
                }
              }}
              className="flex-1 font-mono text-xs font-semibold"
            >
              {step === 3 ? 'Confirm & Ingest' : step === 4 ? 'Return to Pipeline' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
