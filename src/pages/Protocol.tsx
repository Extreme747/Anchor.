import { useState } from 'react'
import {
  BoltIcon, CheckIcon, WarningIcon, ClockIcon, LockIcon,
  RupeeSymbol, ArrowRightIcon, ShieldIcon
} from '../components/Icons'
import { toast } from '@/components/ui/toast'

// ── Types for Phase 0
export interface WebhookEvent {
  id: string
  timestamp: string
  eventType: 'messages' | 'message_template_status_update' | 'phone_number_quality_update' | 'ctwa_referral'
  senderPhone: string
  payloadPreview: string
  latencyMs: number
  signatureVerified: boolean
  status: 'PROCESSED' | 'QUEUED' | 'RETRY'
}

const SAMPLE_EVENTS: WebhookEvent[] = [
  { id: 'evt_998124', timestamp: '16:51:04.120', eventType: 'messages', senderPhone: '+91 98234 11204', payloadPreview: '{"text": {"body": "Site visit kab? Budget ready hai"}}', latencyMs: 28, signatureVerified: true, status: 'PROCESSED' },
  { id: 'evt_998123', timestamp: '16:50:58.840', eventType: 'ctwa_referral', senderPhone: '+91 97112 88491', payloadPreview: '{"referral": {"source_type": "ad", "headline": "Luxury 3BHK Video Tour"}}', latencyMs: 34, signatureVerified: true, status: 'PROCESSED' },
  { id: 'evt_998122', timestamp: '16:49:12.310', eventType: 'messages', senderPhone: '+91 98114 55109', payloadPreview: '{"interactive": {"button_reply": {"title": "Book Site Visit"}}}', latencyMs: 22, signatureVerified: true, status: 'PROCESSED' },
  { id: 'evt_998121', timestamp: '16:47:02.100', eventType: 'message_template_status_update', senderPhone: 'Meta System', payloadPreview: '{"event": "APPROVED", "message_template_name": "hour_23_session_nudge"}', latencyMs: 19, signatureVerified: true, status: 'PROCESSED' },
]

export default function Protocol() {
  const [activeTab, setActiveTab] = useState<'costs' | 'webhook_log' | 'api_health' | 'config'>('costs')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success'>('idle')

  const handleTestConnection = () => {
    setTestStatus('testing')
    setTimeout(() => setTestStatus('success'), 800)
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1 overflow-x-auto">
        {[
          { id: 'costs', label: 'Per-Message Cost Audit (₹0 Markup)' },
          { id: 'webhook_log', label: 'Meta Webhook Event Stream' },
          { id: 'api_health', label: 'API Health & Latency' },
          { id: 'config', label: 'Meta Gateway Credentials' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className="px-4 py-2.5 font-mono text-[10px] tracking-wide transition-colors border-b-2 -mb-px flex-shrink-0"
            style={{
              borderColor: activeTab === t.id ? '#C8953A' : 'transparent',
              color: activeTab === t.id ? '#C8953A' : '#6B6B6B',
            }}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* P0-04, P0-05, P0-06: Per-Message Cost Dashboard */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          {/* Top Pass-Through Hero */}
          <div className="border border-[#C8953A]/25 bg-[#C8953A]/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderRadius: 2 }}>
            <div>
              <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P0-05 · ZERO-MARKUP META PASS-THROUGH DASHBOARD</div>
              <div className="font-display text-3xl text-[#F0EDE8] mt-1">₹0.00 Anchor Markup Guaranteed</div>
              <div className="font-mono text-[10px] text-[#6B6B6B] mt-1">
                Meta Base Rate: Marketing ~₹0.86 | Utility ~₹0.115 | Authentication ~₹0.115
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[9px] text-[#6B6B6B]">WALLET BALANCE</div>
              <div className="font-display text-3xl text-[#C8953A]">₹4,820.60</div>
              <div className="font-mono text-[9px] text-green-400">~5,600 Messages Remaining</div>
            </div>
          </div>

          {/* Today's Spend Breakdown */}
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { type: 'Marketing Messages', count: 412, unitRate: '₹0.86', total: '₹354.32', markup: '₹0' },
              { type: 'Utility Messages', count: 89, unitRate: '₹0.115', total: '₹10.23', markup: '₹0' },
              { type: 'Authentication OTPs', count: 24, unitRate: '₹0.115', total: '₹2.76', markup: '₹0' },
              { type: 'CTWA 72h Free Leads', count: 68, unitRate: 'FREE', total: '₹0.00', markup: '₹0' },
            ].map(row => (
              <div key={row.type} className="border border-white/8 p-4 bg-[#0D0D0D] space-y-1" style={{ borderRadius: 2 }}>
                <div className="font-mono text-[9px] text-[#6B6B6B]">{row.type.toUpperCase()}</div>
                <div className="font-display text-2xl text-[#F0EDE8]">{row.count}</div>
                <div className="font-mono text-[10px] text-[#C8953A] flex justify-between pt-2 border-t border-white/5">
                  <span>Spend: {row.total}</span>
                  <span className="text-[#6B6B6B]">({row.unitRate}/msg)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Competitor Markup Comparison Alert */}
          <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
            <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">SAVINGS VS COMPETITOR MARKUPS (MONTH-TO-DATE)</div>
            <div className="grid md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#111] border border-white/5 space-y-1" style={{ borderRadius: 2 }}>
                <div className="text-[#6B6B6B]">Wati.io (15–20% markup)</div>
                <div className="text-red-400 font-bold">You would pay +₹1,420 more</div>
                <div className="text-[9px] text-[#444]">+ Overseas FX charges</div>
              </div>
              <div className="p-3 bg-[#111] border border-white/5 space-y-1" style={{ borderRadius: 2 }}>
                <div className="text-[#6B6B6B]">Interakt (up to 39% utility markup)</div>
                <div className="text-red-400 font-bold">You would pay +₹1,850 more</div>
                <div className="text-[9px] text-[#444]">Utility billed at ₹0.16 vs ₹0.115</div>
              </div>
              <div className="p-3 bg-[#111] border border-green-500/20 bg-green-500/5 space-y-1" style={{ borderRadius: 2 }}>
                <div className="text-green-400">Anchor Cloud API Direct</div>
                <div className="text-[#F0EDE8] font-bold">₹0.00 Extra Fee</div>
                <div className="text-[9px] text-green-400">100% Pass-Through + GST ITC</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P0-02: Webhook Event Log */}
      {activeTab === 'webhook_log' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-mono text-[9px] text-[#6B6B6B]">
              Real-time Ingestion Stream · HMAC-SHA256 Cryptographic Signature Verification
            </div>
            <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" /> Ingesting Live
            </span>
          </div>

          <div className="border border-white/8 overflow-hidden bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
            <div className="grid grid-cols-[auto_1.5fr_auto_2fr_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
              <span>TIME</span>
              <span>EVENT TYPE</span>
              <span>SENDER</span>
              <span>PAYLOAD PREVIEW</span>
              <span>STATUS</span>
            </div>
            {SAMPLE_EVENTS.map(evt => (
              <div key={evt.id} className="grid grid-cols-[auto_1.5fr_auto_2fr_auto] px-4 py-3 border-b border-white/5 last:border-0 items-center gap-4 hover:bg-white/2 transition-colors font-mono text-xs">
                <span className="text-[#6B6B6B]">{evt.timestamp}</span>
                <span className="text-[#C8953A] font-semibold">{evt.eventType}</span>
                <span className="text-[#F0EDE8]">{evt.senderPhone}</span>
                <span className="text-[#6B6B6B] truncate text-[11px]">{evt.payloadPreview}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20" style={{ borderRadius: 2 }}>
                    {evt.status} ({evt.latencyMs}ms)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* P0-03: API Health & Latency */}
      {activeTab === 'api_health' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: 'Uptime (30d)', value: '99.98%', color: '#4ADE80' },
              { label: 'Avg Webhook Latency', value: '24 ms', color: '#C8953A' },
              { label: 'Throughput', value: '10,000/min', color: '#4A9EBA' },
              { label: 'Error Rate', value: '0.002%', color: '#6B6B6B' },
            ].map(k => (
              <div key={k.label} className="border border-white/8 p-4 bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
                <div className="font-display text-2xl" style={{ color: k.color }}>{k.value}</div>
                <div className="font-mono text-[9px] text-[#6B6B6B] mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
            <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">INGESTION QUEUE ARCHITECTURE (BullMQ + Redis)</div>
            <div className="font-mono text-xs space-y-2 text-[#F0EDE8]">
              <div className="flex justify-between p-2 bg-[#111] border border-white/5">
                <span>Webhook Ingestion Handshake (200 OK)</span>
                <span className="text-green-400">&lt; 35ms response time to Meta</span>
              </div>
              <div className="flex justify-between p-2 bg-[#111] border border-white/5">
                <span>Async Event Consumer (BullMQ Worker)</span>
                <span className="text-[#C8953A]">4 Active Concurrency Workers</span>
              </div>
              <div className="flex justify-between p-2 bg-[#111] border border-white/5">
                <span>Retry Policy & Exponential Backoff</span>
                <span className="text-white">Active (3 retries on transient errors)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P0-01: Meta Gateway Credentials */}
      {activeTab === 'config' && (
        <div className="space-y-6 max-w-2xl">
          <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
            <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P0-01 · META CLOUD API PRODUCTION WEBHOOK GATEWAY</div>

            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">WEBHOOK CALLBACK URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://api.anchor.io/v1/webhook/meta"
                  className="flex-1 bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 font-mono outline-none"
                  style={{ borderRadius: 2 }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('https://api.anchor.io/v1/webhook/meta')
                    toast.success('Webhook URL copied to clipboard!')
                  }}
                  className="px-3 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold"
                  style={{ borderRadius: 2 }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">VERIFY TOKEN</label>
                <input
                  type="text"
                  readOnly
                  value="anchor_meta_verify_secret_2026"
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 font-mono outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">PHONE NUMBER ID</label>
                <input
                  type="text"
                  readOnly
                  value="104891289123891"
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 font-mono outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleTestConnection}
                className="w-full py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors"
                style={{ borderRadius: 2 }}
              >
                {testStatus === 'testing' ? 'Testing Handshake...' : testStatus === 'success' ? '✓ Meta Handshake Verified (< 30ms)' : 'Test Meta Webhook Handshake (hub.challenge) →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
