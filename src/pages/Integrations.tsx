import { useState, useEffect } from 'react'
import {
  BoltIcon, CheckIcon, ArrowRightIcon, WarningIcon,
  SearchIcon, TeamIcon, IndiaFlagBlock, RupeeSymbol
} from '../components/Icons'
import { integrationsApi, commerceApi } from '../api/client'

// ── Types for Phase 5
export interface IntegrationItem {
  id: string
  name: string
  category: 'Property Portal' | 'CRM' | 'Spreadsheet' | 'Automation' | 'Payments'
  description: string
  icon: string
  status: 'CONNECTED' | 'AVAILABLE' | 'PRO'
  lastSync?: string
  recordsSynced?: number
}

const INTEGRATIONS_CATALOG: IntegrationItem[] = [
  { id: 'int_sheets', name: 'Google Sheets (2-Way Sync)', category: 'Spreadsheet', description: 'Continuous bidirectional sync with Indian SMBs primary operational database.', icon: '📊', status: 'CONNECTED', lastSync: 'Just now', recordsSynced: 1204 },
  { id: 'int_99acres', name: '99acres Lead Ingestion', category: 'Property Portal', description: 'Zero-latency webhook ingestion for buyer inquiries. Auto-replies in <2 seconds.', icon: '🏢', status: 'CONNECTED', lastSync: '3 min ago', recordsSynced: 142 },
  { id: 'int_magicbricks', name: 'MagicBricks Direct API', category: 'Property Portal', description: 'Instant sync for property lead forms with automatic project brochure delivery.', icon: '🏗️', status: 'CONNECTED', lastSync: '12 min ago', recordsSynced: 89 },
  { id: 'int_housing', name: 'Housing.com Partner Bridge', category: 'Property Portal', description: 'Auto-ingest verified buyer profiles & match against active sales inventory.', icon: '🏠', status: 'CONNECTED', lastSync: '25 min ago', recordsSynced: 54 },
  { id: 'int_razorpay', name: 'Razorpay UPI & Cards', category: 'Payments', description: 'Automated booking token payment links and real-time webhook settlement.', icon: '💳', status: 'CONNECTED', lastSync: '1 hour ago', recordsSynced: 28 },
  { id: 'int_indiamart', name: 'IndiaMART B2B Gateway', category: 'Property Portal', description: 'Auto-reply to B2B commercial catalog inquiries within 2 seconds.', icon: '🇮🇳', status: 'AVAILABLE' },
  { id: 'int_leadsquared', name: 'LeadSquared CRM', category: 'CRM', description: 'Push WhatsApp conversation history, call attempts, and intent scores into LMS.', icon: '📈', status: 'AVAILABLE' },
  { id: 'int_zapier', name: 'Zapier & Make.com Webhooks', category: 'Automation', description: 'Trigger arbitrary webhook events on lead WON, site visit booked, or SLA breach.', icon: '⚡', status: 'CONNECTED', lastSync: '1 hour ago', recordsSynced: 312 },
]

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE SHEETS 2-WAY SYNC MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GoogleSheetsModal({ onClose }: { onClose: () => void }) {
  const [script, setScript] = useState('')
  const [copied, setCopied] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [testLeadName, setTestLeadName] = useState('Rajesh Singhania')
  const [testPhone, setTestPhone] = useState('+91 98111 55443')
  const [testBudget, setTestBudget] = useState('₹1.8 Cr')

  useEffect(() => {
    integrationsApi.getGoogleSheetsScript()
      .then((data: any) => {
        if (data?.script) setScript(data.script)
      })
      .catch((err: any) => console.log('Script fetch error:', err))
  }, [])

  const copyScript = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleSyncOut = async () => {
    setIsSyncing(true)
    try {
      const res = await integrationsApi.syncOutGoogleSheets()
      setSyncResult(`✅ Synced ${res.totalSynced} leads to Google Sheets!`)
      setTimeout(() => setSyncResult(null), 4000)
    } catch (err: any) {
      alert('Sync failed: ' + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSimulateInbound = async () => {
    setIsSyncing(true)
    try {
      const res = await integrationsApi.simulateSheetsInbound({
        leadName: testLeadName,
        phone: testPhone,
        city: 'Gurugram',
        budget: testBudget,
        status: 'NEW',
        tags: ['Google Sheets', 'Hot 🔥'],
      })
      setSyncResult(`⚡ Inbound row received! Created lead ID: ${res.leadId || 'lead_new'}`)
      setTimeout(() => setSyncResult(null), 4000)
    } catch (err: any) {
      alert('Simulation failed: ' + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <div className="font-mono text-[10px] text-[#C8953A] tracking-widest">GOOGLE SHEETS 2-WAY SYNC BRIDGE</div>
              <div className="text-xs text-[#F0EDE8]">Bidirectional Row Sync & Real-Time Ingestion</div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-white font-mono text-sm">×</button>
        </div>

        {syncResult && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 font-mono text-[10px] text-green-400" style={{ borderRadius: 2 }}>
            {syncResult}
          </div>
        )}

        <div className="space-y-3">
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">STEP 1: 30-SECOND APPS SCRIPT SETUP</div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Copy the automated sync script below. In your Google Sheet, open <strong className="text-[#F0EDE8]">Extensions &gt; Apps Script</strong>, paste the code, and click Save. New sheet rows will auto-ingest into Anchor in real time.
          </p>
          <div className="relative">
            <pre className="bg-[#111] border border-white/10 p-3 font-mono text-[9px] text-[#C8953A] max-h-40 overflow-y-auto leading-relaxed" style={{ borderRadius: 2 }}>
              {script || '// Loading automated Apps Script...'}
            </pre>
            <button
              onClick={copyScript}
              className="absolute top-2 right-2 px-2.5 py-1 bg-[#C8953A] text-[#080808] font-mono text-[9px] font-bold hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}
            >
              {copied ? '✓ COPIED!' : 'COPY CODE'}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/8 space-y-3">
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">STEP 2: TEST TWO-WAY SYNC ACTIONS</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">LEAD NAME</label>
              <input value={testLeadName} onChange={e => setTestLeadName(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-2 py-1.5 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">PHONE</label>
              <input value={testPhone} onChange={e => setTestPhone(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-2 py-1.5 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">BUDGET</label>
              <input value={testBudget} onChange={e => setTestBudget(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-2 py-1.5 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSimulateInbound}
              disabled={isSyncing}
              className="flex-1 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}
            >
              ⚡ Test Inbound Row From Sheets
            </button>
            <button
              onClick={handleSyncOut}
              disabled={isSyncing}
              className="flex-1 py-2 border border-white/10 text-[#F0EDE8] font-mono text-[10px] hover:border-white/30 transition-colors"
              style={{ borderRadius: 2 }}
            >
              🔄 Export All Leads to Sheets
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL ESTATE PORTAL WEBHOOK BRIDGE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PortalModal({ defaultPortal = '99acres', onClose }: { defaultPortal?: string; onClose: () => void }) {
  const [portal, setPortal] = useState(defaultPortal)
  const [buyerName, setBuyerName] = useState('Vikram Malhotra')
  const [phone, setPhone] = useState('+91 99888 77665')
  const [propertyTitle, setPropertyTitle] = useState('Sector 62 Ultra Luxury 3BHK')
  const [budget, setBudget] = useState('1.65 Cr')
  const [city, setCity] = useState('Gurugram')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSimulate = async () => {
    setIsSubmitting(true)
    try {
      const res = await integrationsApi.simulatePortalInbound({
        portal,
        leadName: buyerName,
        phone,
        propertyTitle,
        budget,
        city,
      })
      setResult(`⚡ Ingested in 0.24s! ${res.message}`)
      setTimeout(() => setResult(null), 5000)
    } catch (err: any) {
      alert('Ingestion error: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-lg p-6 space-y-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <div>
            <div className="font-mono text-[10px] text-[#C8953A] tracking-widest">PORTAL LEAD WEBHOOK GATEWAY</div>
            <div className="text-xs text-[#F0EDE8]">99acres · MagicBricks · Housing.com · IndiaMART</div>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-white font-mono text-sm">×</button>
        </div>

        {result && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 font-mono text-[10px] text-green-400" style={{ borderRadius: 2 }}>
            {result}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">SELECT PORTAL SOURCE</label>
            <div className="flex gap-2">
              {['99acres', 'MagicBricks', 'Housing.com', 'IndiaMART'].map(p => (
                <button
                  key={p}
                  onClick={() => setPortal(p)}
                  className="flex-1 py-1.5 font-mono text-[9px] border transition-colors"
                  style={{
                    borderRadius: 2,
                    borderColor: portal === p ? '#C8953A' : 'rgba(255,255,255,0.08)',
                    color: portal === p ? '#C8953A' : '#6B6B6B',
                    background: portal === p ? 'rgba(200,149,58,0.1)' : 'transparent',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">BUYER NAME</label>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">BUYER PHONE</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">PROPERTY / PROJECT</label>
              <input value={propertyTitle} onChange={e => setPropertyTitle(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
            <div>
              <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">BUDGET</label>
              <input value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none" style={{ borderRadius: 2 }} />
            </div>
          </div>

          <div className="p-3 bg-[#111] border border-white/5 font-mono text-[9px] text-[#6B6B6B] space-y-1">
            <div>Webhook Endpoint: <span className="text-[#C8953A]">POST /api/integrations/portal-inbound</span></div>
            <div>Automated Actions: Lead deduplicated, intent scored, routed by SLA, auto-reply &lt;2s.</div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-white/10 text-xs text-[#6B6B6B] hover:text-white" style={{ borderRadius: 2 }}>Cancel</button>
            <button
              onClick={handleSimulate}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}
            >
              {isSubmitting ? 'Ingesting...' : `⚡ Test Ingest ${portal} Lead`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY WEBHOOK BRIDGE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RazorpayModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('25000')
  const [isSimulating, setIsSimulating] = useState(false)
  const [resMsg, setResMsg] = useState<string | null>(null)

  const handleSimulateWebhook = async () => {
    setIsSimulating(true)
    try {
      const res = await commerceApi.simulateRazorpayWebhook({ amountINR: Number(amount) })
      setResMsg(`✅ Webhook verified! Token payment of ₹${Number(amount).toLocaleString('en-IN')} marked as PAID. Lead updated to WON.`)
      setTimeout(() => setResMsg(null), 5000)
    } catch (err: any) {
      alert('Webhook error: ' + err.message)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-lg p-6 space-y-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <div>
            <div className="font-mono text-[10px] text-[#C8953A] tracking-widest">RAZORPAY PRODUCTION WEBHOOK BRIDGE</div>
            <div className="text-xs text-[#F0EDE8]">HMAC-SHA256 Signature Verified Payment Ingestion</div>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-white font-mono text-sm">×</button>
        </div>

        {resMsg && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 font-mono text-[10px] text-green-400" style={{ borderRadius: 2 }}>
            {resMsg}
          </div>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-[#111] border border-white/5 font-mono text-[9px] space-y-1">
            <div className="text-[#6B6B6B]">Razorpay Webhook URL:</div>
            <div className="text-[#C8953A] font-bold select-all">https://api.anchor.io/api/commerce/webhooks/razorpay</div>
            <div className="text-[#6B6B6B] mt-1">Events: <span className="text-[#F0EDE8]">payment_link.paid, payment.captured, order.paid</span></div>
          </div>

          <div>
            <label className="font-mono text-[8px] text-[#6B6B6B] block mb-1">TEST PAYMENT AMOUNT (INR)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none font-mono" style={{ borderRadius: 2 }} />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-white/10 text-xs text-[#6B6B6B] hover:text-white" style={{ borderRadius: 2 }}>Close</button>
            <button
              onClick={handleSimulateWebhook}
              disabled={isSimulating}
              className="flex-1 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}
            >
              {isSimulating ? 'Processing...' : '⚡ Simulate Razorpay Payment Webhook'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P5-01: HINGLISH & REGIONAL VERNACULAR ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function VernacularEngineView() {
  const [lang, setLang] = useState<'hinglish' | 'marathi' | 'gujarati' | 'telugu'>('hinglish')
  const [testPhrase, setTestPhrase] = useState('bhai 3bhk ka price kya hai aur visit kab kar sakte hain')
  const [detectedIntent, setDetectedIntent] = useState<{ budget: boolean; visit: boolean; score: number }>({
    budget: true,
    visit: true,
    score: 60,
  })

  const handleTest = (phrase: string) => {
    setTestPhrase(phrase)
    const lower = phrase.toLowerCase()
    const budget = lower.includes('price') || lower.includes('rate') || lower.includes('kitna') || lower.includes('budget') || lower.includes('cost')
    const visit = lower.includes('visit') || lower.includes('dekhna') || lower.includes('kab') || lower.includes('tour')
    setDetectedIntent({
      budget,
      visit,
      score: (budget ? 25 : 0) + (visit ? 35 : 0),
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P5-01 · DETERMINISTIC VERNACULAR PARSER</div>
        <div className="text-sm font-medium text-[#F0EDE8]">Hinglish, Marathi, Gujarati & South Indian Rule Engine</div>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'hinglish', label: 'Hinglish (Hindi + English)' },
          { id: 'marathi', label: 'Marathi' },
          { id: 'gujarati', label: 'Gujarati' },
          { id: 'telugu', label: 'Telugu' },
        ].map(l => (
          <button
            key={l.id}
            onClick={() => setLang(l.id as any)}
            className="px-3 py-1.5 font-mono text-[10px] border transition-colors"
            style={{
              borderRadius: 2,
              borderColor: lang === l.id ? '#C8953A' : 'rgba(255,255,255,0.08)',
              background: lang === l.id ? 'rgba(200,149,58,0.08)' : 'transparent',
              color: lang === l.id ? '#C8953A' : '#6B6B6B',
            }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">LIVE INBOUND PARSER SANDBOX</div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">TYPE INCOMING CUSTOMER QUERY</label>
          <input
            type="text"
            value={testPhrase}
            onChange={e => handleTest(e.target.value)}
            className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
            style={{ borderRadius: 2 }}
          />
        </div>

        <div className="border border-white/5 p-4 bg-[#111] space-y-3" style={{ borderRadius: 2 }}>
          <div className="flex justify-between items-center">
            <span className="font-mono text-[10px] text-[#6B6B6B]">DETERMINISTIC HEURISTIC SIGNALS</span>
            <span className="font-mono text-xs text-[#C8953A] font-bold">+{detectedIntent.score} Intent Points</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className={`p-2 border ${detectedIntent.budget ? 'border-[#C8953A]/40 bg-[#C8953A]/10 text-[#C8953A]' : 'border-white/5 text-[#444]'}`}>
              {detectedIntent.budget ? '✓ Budget Trigger ("price / rate / kitna")' : '○ No Budget Signal'}
            </div>
            <div className={`p-2 border ${detectedIntent.visit ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-white/5 text-[#444]'}`}>
              {detectedIntent.visit ? '✓ Site Visit Trigger ("visit / dekhna")' : '○ No Visit Signal'}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-[#6B6B6B]">
            Automated Next Action: <strong className="text-[#F0EDE8]">Dispatch Sector 62 Pricing Card & Trigger Site Visit Booking Flow</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P5-06, P5-07, P5-08: AGENCY PARTNER & WHITE-LABEL DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AgencyPartnerView() {
  const clients = [
    { name: 'Apex Realty Gurugram', plan: 'Business Scale', leads: 412, revShare: '₹999/mo', status: 'ACTIVE' },
    { name: 'Solis Healthcare Clinic', plan: 'Growth', leads: 184, revShare: '₹499/mo', status: 'ACTIVE' },
    { name: 'Skyline Luxury Residences', plan: 'Business Scale', leads: 642, revShare: '₹999/mo', status: 'ACTIVE' },
  ]

  return (
    <div className="space-y-6">
      <div className="border border-[#C8953A]/25 bg-[#C8953A]/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderRadius: 2 }}>
        <div>
          <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P5-06 · AGENCY PARTNER FLYWHEEL</div>
          <div className="font-display text-3xl text-[#F0EDE8] mt-1">20% Lifetime Recurring Rev-Share</div>
          <div className="font-mono text-[10px] text-[#6B6B6B] mt-1">
            Active Managed Client Accounts: 3 | Accumulated Monthly Payout: ₹2,497
          </div>
        </div>
        <button className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A]" style={{ borderRadius: 2 }}>
          + Add Managed Client WABA
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">MANAGED CLIENT ACCOUNTS</div>
          <div className="space-y-2">
            {clients.map(c => (
              <div key={c.name} className="p-3 bg-[#111] border border-white/5 flex justify-between items-center" style={{ borderRadius: 2 }}>
                <div>
                  <div className="text-xs font-semibold text-[#F0EDE8]">{c.name}</div>
                  <div className="font-mono text-[9px] text-[#6B6B6B]">{c.plan} · {c.leads} leads this month</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-[#C8953A]">{c.revShare}</div>
                  <span className="font-mono text-[8px] text-green-400">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">WHITE-LABEL CUSTOM DOMAIN & BRANDING</div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Agencies can map their custom subdomains (e.g. <span className="text-[#C8953A]">crm.youragency.in</span>) and brand Anchor with their custom logo, theme, and client invoice headers.
          </p>
          <div className="pt-2">
            <input placeholder="crm.youragency.com" className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 mb-2 outline-none font-mono" style={{ borderRadius: 2 }} />
            <button className="w-full py-2 border border-white/10 font-mono text-[10px] text-[#F0EDE8] hover:border-[#C8953A] transition-colors" style={{ borderRadius: 2 }}>
              Verify CNAME DNS Record
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P5-09 & P5-10: META EMBEDDED SIGNUP & GREEN TICK VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function MetaVerificationWizard() {
  const steps = [
    { num: '01', title: 'Facebook Business Manager', desc: 'Verified Legal Business entity with matching address', done: true },
    { num: '02', title: 'GSTIN & Tax Invoice Match', desc: 'Valid 15-digit Indian GSTIN matching official trade name', done: true },
    { num: '03', title: 'Meta Two-Factor & Domain', desc: 'DNS TXT verification for registered business domain', done: true },
    { num: '04', title: 'Official WhatsApp Green Badge', desc: 'Meta Tier-1 direct BSP submission for Official Business Account (OBA)', done: false },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P5-09 & P5-10 · META EMBEDDED SIGNUP & GREEN TICK</div>
        <div className="text-sm font-medium text-[#F0EDE8]">Official Business Account (OBA) Verification Tracker</div>
      </div>

      <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
        {steps.map(s => (
          <div key={s.num} className="flex items-start gap-4 p-3.5 border border-white/5 bg-[#111]" style={{ borderRadius: 2 }}>
            <span className={`font-mono text-sm font-bold ${s.done ? 'text-green-400' : 'text-[#C8953A]'}`}>{s.num}</span>
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#F0EDE8] flex items-center gap-2">
                {s.title}
                {s.done ? <span className="text-green-400 font-mono text-[9px]">✓ COMPLETE</span> : <span className="text-[#C8953A] font-mono text-[9px]">IN PROGRESS</span>}
              </div>
              <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{s.desc}</div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button className="w-full py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors" style={{ borderRadius: 2 }}>
            Submit Official Meta Green Tick Request via Anchor BSP →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INTEGRATIONS EXPORT (PHASE 5)
// ─────────────────────────────────────────────────────────────────────────────
export default function Integrations() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'vernacular' | 'agency' | 'greentick'>('catalog')
  const [modalType, setModalType] = useState<'sheets' | 'portal' | 'razorpay' | null>(null)
  const [selectedPortal, setSelectedPortal] = useState('99acres')

  const openConfig = (item: IntegrationItem) => {
    if (item.id === 'int_sheets') setModalType('sheets')
    else if (item.id === 'int_razorpay') setModalType('razorpay')
    else {
      if (item.id === 'int_magicbricks') setSelectedPortal('MagicBricks')
      else if (item.id === 'int_housing') setSelectedPortal('Housing.com')
      else if (item.id === 'int_indiamart') setSelectedPortal('IndiaMART')
      else setSelectedPortal('99acres')
      setModalType('portal')
    }
  }

  return (
    <div>
      {/* Modals */}
      {modalType === 'sheets' && <GoogleSheetsModal onClose={() => setModalType(null)} />}
      {modalType === 'portal' && <PortalModal defaultPortal={selectedPortal} onClose={() => setModalType(null)} />}
      {modalType === 'razorpay' && <RazorpayModal onClose={() => setModalType(null)} />}

      {/* Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1 overflow-x-auto">
        {[
          { id: 'catalog', label: 'Integration Hub & Portals' },
          { id: 'vernacular', label: 'Vernacular Hinglish Engine' },
          { id: 'agency', label: 'Agency Partner & White-Label' },
          { id: 'greentick', label: 'Meta Green Tick Wizard' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
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

      {activeTab === 'vernacular' && <VernacularEngineView />}
      {activeTab === 'agency' && <AgencyPartnerView />}
      {activeTab === 'greentick' && <MetaVerificationWizard />}

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">
                {INTEGRATIONS_CATALOG.filter(i => i.status === 'CONNECTED').length} active connectors · High-speed property portals & spreadsheet sync
              </div>
            </div>
            <div className="font-mono text-[10px] text-[#C8953A]">
              Google Sheets 2-Way Sync + 99acres + Razorpay Active
            </div>
          </div>

          {/* Integrations Catalog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTEGRATIONS_CATALOG.map(item => (
              <div key={item.id} className="border border-white/8 p-5 bg-[#0D0D0D] hover:border-white/15 transition-colors space-y-3 flex flex-col justify-between" style={{ borderRadius: 2 }}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span
                      className="font-mono text-[9px] px-2 py-0.5"
                      style={{
                        borderRadius: 2,
                        background: item.status === 'CONNECTED' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                        color: item.status === 'CONNECTED' ? '#4ADE80' : '#6B6B6B',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F0EDE8]">{item.name}</h3>
                  <div className="font-mono text-[9px] text-[#4A9EBA] mt-0.5">{item.category}</div>
                  <p className="text-xs text-[#6B6B6B] mt-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center font-mono text-[9px]">
                  <span className="text-[#3A3A3A]">{item.lastSync ? `Synced: ${item.lastSync}` : 'Ready to setup'}</span>
                  <button
                    onClick={() => openConfig(item)}
                    className="text-[#C8953A] hover:underline cursor-pointer"
                  >
                    {item.status === 'CONNECTED' ? 'Configure & Test →' : 'Connect +'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
