import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Zap, Check, CheckCheck, MessageSquare, StickyNote, 
  AlertTriangle, ArrowLeft, Info, Sparkles, UserCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionBar } from './SessionBar';
import { QuickReplyPopup } from './QuickReplyPopup';
import { messagesApi } from '@/api/client';

interface ChatPanelProps {
  lead: any;
  onBack?: () => void;
  onToggleIntel?: () => void;
  showIntelToggle?: boolean;
}

const DEFAULT_MESSAGES_MAP: Record<string, Array<{ from: string; text: string; time: string; auto?: boolean; status?: string }>> = {
  '1': [
    { from: 'lead', text: 'Hi, saw your ad on Instagram. Interested in 3BHK at Sector 62.', time: '10:02' },
    { from: 'anchor', text: 'Hi Arjun! Thanks for reaching out. Connecting you with our team right now. Meanwhile here\'s our latest brochure: anchor.io/brochure/sec62\n\nWe have 3BHK units from ₹1.2–1.6 Cr. Would you like a site visit this weekend?', time: '10:02', auto: true, status: 'read' },
    { from: 'lead', text: 'What\'s the price range? Aur possession kab tak?', time: '10:04' },
    { from: 'lead', text: 'Site visit kab kar sakte hain?', time: '10:05' },
  ],
  '4': [
    { from: 'lead', text: 'Hello, urgent — carpet area of the 2BHK unit?', time: '08:30' },
    { from: 'anchor', text: 'Hi Sunita! Carpet area is 985 sq ft (built-up: 1,280 sq ft). Available in 3 ready-to-move units.\n\nWould you like to schedule a site visit today?', time: '08:30', auto: true, status: 'delivered' },
  ],
  '6': [
    { from: 'lead', text: 'Is penthouse still available? Budget around 3Cr.', time: '07:15' },
    { from: 'anchor', text: 'Hi Kavita! Yes, we have 2 penthouse units available — 38th floor and 40th floor, ₹3.1–3.4 Cr. Stunning golf course views.\n\nOur senior advisor is available for a private tour — any time this week?', time: '07:15', auto: true, status: 'read' },
    { from: 'lead', text: 'Interested. Can you share floor plans?', time: '07:18' },
    { from: 'lead', text: 'Also what amenities?', time: '07:19' },
  ],
};

export function ChatPanel({ lead, onBack, onToggleIntel, showIntelToggle }: ChatPanelProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'whatsapp' | 'note'>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuickReply, setShowQuickReply] = useState(false);
  const [showAiCopilot, setShowAiCopilot] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lead?.id) {
      loadMessages();
      setShowAiCopilot(true);
    }
  }, [lead?.id]);

  const loadMessages = async () => {
    try {
      const res = await messagesApi.getMessages(String(lead.id));
      if (res && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else if (DEFAULT_MESSAGES_MAP[String(lead.id)]) {
        setMessages(DEFAULT_MESSAGES_MAP[String(lead.id)]);
      } else {
        setMessages([{ 
          from: 'lead', 
          text: lead.preview || 'Inquiry received for property', 
          time: lead.time || '10:00' 
        }]);
      }
    } catch {
      if (DEFAULT_MESSAGES_MAP[String(lead.id)]) {
        setMessages(DEFAULT_MESSAGES_MAP[String(lead.id)]);
      } else {
        setMessages([{ 
          from: 'lead', 
          text: lead.preview || 'Inquiry received for property', 
          time: lead.time || '10:00' 
        }]);
      }
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && document.activeElement?.tagName === 'TEXTAREA') {
        e.preventDefault();
        setMode(m => m === 'whatsapp' ? 'note' : 'whatsapp');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sessionHours = lead.session?.hoursRemaining !== undefined
    ? lead.session.hoursRemaining
    : (lead.score >= 80 ? 18 : lead.score >= 50 ? 5 : 2);

  const handleSend = async (customText?: string, isNote = false) => {
    const textToSend = customText !== undefined ? customText : inputValue.trim();
    if (!textToSend || isLoading) return;
    
    setIsLoading(true);
    setError('');
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const tempMsg = {
      from: isNote ? 'note' : 'anchor',
      text: textToSend,
      time: timeStr,
      status: 'sending',
      type: isNote ? 'note' : 'text'
    };
    
    setMessages(prev => [...prev, tempMsg]);
    if (customText === undefined) setInputValue('');
    setShowQuickReply(false);

    try {
      await messagesApi.sendMessage(String(lead.id), textToSend);
      setMessages(prev => prev.map(m => m === tempMsg ? { ...m, status: 'delivered' } : m));
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      setMessages(prev => prev.map(m => m === tempMsg ? { ...m, status: 'failed' } : m));
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <p className="text-tertiary font-mono text-sm">Select a lead to inspect conversation</p>
      </div>
    );
  }

  const aiSuggestionText = lead.score >= 80
    ? `Carpet area is 1,450 sq ft (Super Built-up: 1,890 sq ft). Saturday 11 AM confirmed — our senior property advisor will call you 30 mins before. Location: maps.anchor.io/sec62`
    : `Hi ${lead.name || 'there'}, sharing the master brochure for our 3BHK inventory. Would you prefer a physical walkthrough this weekend or a virtual call?`;

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas relative overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border bg-surface-sub/90 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button 
              onClick={onBack} 
              className="md:hidden p-1.5 rounded-sm hover:bg-surface-hover text-tertiary hover:text-primary transition-colors"
              aria-label="Back to leads list"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <Avatar name={lead.name} status="online" size="default" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-primary font-medium text-sm truncate">{lead.name}</h2>
              <Badge variant={lead.score >= 80 ? 'gold' : 'secondary'} className="text-[9px] py-0 px-1.5">
                {lead.status || 'NEW'}
              </Badge>
              {lead.ctwa && (
                <Badge variant="success" className="text-[9px] py-0 px-1 hidden sm:inline-flex">
                  CTWA
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-tertiary truncate font-mono">
              {lead.phone || '+91 98XXX XX210'} {lead.value ? `· ${lead.value}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs h-7">
            <UserCheck size={13} />
            <span>Assign</span>
          </Button>

          {showIntelToggle && (
            <button
              onClick={onToggleIntel}
              className="p-1.5 rounded-sm border border-border text-tertiary hover:text-primary hover:bg-surface-hover transition-colors"
              title="Toggle Lead Intel"
              aria-label="Toggle Lead Intel"
            >
              <Info size={16} />
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-2 border-l border-border">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span className="font-mono text-[9px] text-primary">LIVE</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Meta Session Bar */}
      <SessionBar hours={sessionHours} />

      {/* Error alert */}
      {error && (
        <div className="px-4 py-2 bg-danger/10 border-b border-danger/20 text-danger font-mono text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5"><AlertTriangle size={13} /> {error}</span>
          <button onClick={() => setError('')} className="text-tertiary hover:text-primary">✕</button>
        </div>
      )}

      {/* Message Thread */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        role="log"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isAgent = msg.from === 'anchor' || msg.sender === 'agent';
            const isNote = msg.from === 'note' || msg.type === 'note';
            const isAuto = Boolean(msg.auto || msg.autoReply);
            const content = msg.text || msg.body;
            const time = msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00');

            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={cn(
                  "flex flex-col max-w-[80%] sm:max-w-[70%]",
                  isAgent || isNote ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-3.5 py-2.5 text-xs leading-relaxed rounded-md",
                  isNote 
                    ? "bg-[#2A2010] border border-accent/60 text-primary shadow-[inset_0_1px_0_0_rgba(200,149,58,0.2)]"
                    : isAgent 
                      ? "bg-accent/12 border border-accent/25 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                      : "bg-surface-card border border-border text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                )}>
                  {isNote && (
                    <div className="flex items-center gap-1 font-mono text-[9px] text-accent font-semibold mb-1">
                      <StickyNote size={10} />
                      INTERNAL ADVISOR NOTE (PRIVATE)
                    </div>
                  )}
                  {isAuto && (
                    <div className="flex items-center gap-1 font-mono text-[9px] text-accent mb-1 font-medium">
                      <Zap size={10} strokeWidth={2} />
                      ANCHOR AUTO-REPLY · 1.4s
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{content}</p>
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="font-mono text-[9px] text-tertiary">{time}</span>
                  {isAgent && (
                    <span className="text-tertiary flex items-center ml-0.5">
                      {msg.status === 'sending' && (
                        <span className="inline-flex items-center gap-0.5 ml-1" aria-label="Sending message">
                          <motion.span 
                            className="w-1 h-1 rounded-full bg-accent inline-block"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                          />
                          <motion.span 
                            className="w-1 h-1 rounded-full bg-accent inline-block"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                          />
                          <motion.span 
                            className="w-1 h-1 rounded-full bg-accent inline-block"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                          />
                        </span>
                      )}
                      {msg.status === 'sent' && <Check size={12} />}
                      {msg.status === 'delivered' && <CheckCheck size={12} />}
                      {msg.status === 'read' && <CheckCheck size={12} className="text-accent" />}
                      {msg.status === 'failed' && <AlertTriangle size={12} className="text-danger" />}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* 🤖 AI Copilot Staged Reply Bar (Anchor Killer Feature) */}
      {showAiCopilot && (
        <div className="mx-4 mb-2 p-3 rounded-md border border-accent/30 bg-[#161410] flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles size={13} />
              <span className="font-mono font-medium text-[11px]">AI Copilot Staged Reply</span>
              <span className="text-[10px] text-tertiary hidden sm:inline">(Grounding: Sec 62 Brochure + Lead Intent {lead.score || 85})</span>
            </div>
            <button 
              onClick={() => setShowAiCopilot(false)}
              className="text-[10px] text-tertiary hover:text-primary transition-colors"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-primary bg-canvas/80 p-2.5 rounded border border-border font-sans leading-relaxed">
            "{aiSuggestionText}"
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="primary" 
              size="sm" 
              className="h-7 text-xs font-semibold px-3"
              onClick={() => {
                handleSend(aiSuggestionText);
                setShowAiCopilot(false);
              }}
            >
              Approve & Send
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs px-2.5"
              onClick={() => {
                setInputValue(aiSuggestionText);
                setShowAiCopilot(false);
              }}
            >
              Edit in Box
            </Button>
            <button 
              onClick={() => setShowAiCopilot(false)} 
              className="text-xs text-tertiary hover:text-danger px-2 transition-colors ml-auto"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="p-3 bg-surface-sub/90 backdrop-blur-xl border-t border-border relative">
        <div className="relative">
          {showQuickReply && (
            <QuickReplyPopup 
              onSelect={(text) => {
                setInputValue(text);
                setShowQuickReply(false);
              }}
              onClose={() => setShowQuickReply(false)}
            />
          )}

          <div className={cn(
            "relative flex items-end gap-2 p-2 rounded-md transition-colors border shadow-inner",
            mode === 'note' 
              ? "bg-[#2A2010]/30 border-accent/60" 
              : "bg-canvas border-border focus-within:border-border-strong"
          )}>
            {/* Mode badge */}
            <div className="absolute -top-2.5 left-3 flex items-center gap-1 z-10">
              <span className={cn(
                "text-[9px] px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 shadow-sm",
                mode === 'note' 
                  ? "bg-accent text-black font-semibold" 
                  : "bg-surface-card text-secondary border border-border"
              )}>
                {mode === 'whatsapp' ? <MessageSquare size={9} /> : <StickyNote size={9} />}
                {mode === 'whatsapp' ? 'WhatsApp Customer Reply' : 'Internal Team Note (Private)'}
              </span>
            </div>

            {/* Quick reply trigger */}
            <button
              type="button"
              onClick={() => setShowQuickReply(!showQuickReply)}
              className="font-mono text-sm text-accent hover:text-accent-light px-2 py-1 transition-colors shrink-0 mb-0.5"
              title="Quick Replies (/ for templates)"
              aria-label="Insert quick reply"
            >
              /
            </button>

            {/* Textarea */}
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value === '/') setShowQuickReply(true);
                else if (showQuickReply && !e.target.value.startsWith('/')) setShowQuickReply(false);
              }}
              placeholder={mode === 'whatsapp' ? "Type a WhatsApp reply or '/' for templates..." : "Type a private internal note for advisors..."}
              className="flex-1 bg-transparent border-none text-xs text-primary placeholder:text-tertiary resize-none focus:outline-none min-h-[38px] max-h-[120px] py-2"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(undefined, mode === 'note');
                }
              }}
            />

            {/* Send Button */}
            <Button
              variant="primary"
              size="icon"
              loading={isLoading}
              disabled={!inputValue.trim() || isLoading}
              onClick={() => handleSend(undefined, mode === 'note')}
              className="h-8 w-8 rounded-sm shrink-0 mb-0.5"
              aria-label="Send message"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-tertiary font-mono">
          <span>Press <kbd className="px-1 py-0.5 bg-surface-card border border-border rounded text-[9px]">Tab</kbd> to toggle note mode</span>
          <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-surface-card border border-border rounded text-[9px]">Enter</kbd> to send</span>
        </div>
      </div>
    </div>
  );
}
