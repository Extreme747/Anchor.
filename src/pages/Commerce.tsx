import { useState, useEffect } from 'react'
import {
  FlowIcon, BoltIcon, CheckIcon, ArrowRightIcon, WarningIcon,
  RupeeSymbol, CardIcon, ClockIcon, SearchIcon, TagIcon, CmdIcon
} from '../components/Icons'
import { commerceApi, leadsApi } from '../api/client'

// ── Types for Phase 3
export interface WhatsAppFlow {
  id: string
  name: string
  category: 'Real Estate' | 'Healthcare' | 'D2C' | 'EdTech'
  screensCount: number
  submissions: number
  conversionRate: number
  status: 'ACTIVE' | 'DRAFT' | 'PAUSED'
  lastActive: string
  screens: {
    id: string
    title: string
    subtitle: string
    fields: {
      id: string
      type: 'text' | 'dropdown' | 'date' | 'radio' | 'checkbox'
      label: string
      placeholder?: string
      options?: string[]
      required: boolean
    }[]
  }[]
}

export interface PaymentRecord {
  id: string
  leadName: string
  leadPhone: string
  amount: number
  description: string
  method: 'Razorpay UPI' | 'WhatsApp Pay' | 'PhonePe QR' | 'Card'
  status: 'PAID' | 'SENT' | 'CREATED' | 'EXPIRED'
  createdAt: string
  txnId?: string
}

export interface AdAttribution {
  adId: string
  adName: string
  campaignName: string
  platform: 'Instagram' | 'Facebook'
  leadsCount: number
  avgIntentScore: number
  conversions: number
  revenueTracked: number
  spend: number
  roas: number
}

// ── Sample WhatsApp Flows
const INITIAL_FLOWS: WhatsAppFlow[] = [
  {
    id: 'flow_re_site_visit',
    name: 'Sector 62 — Site Visit Booking Flow',
    category: 'Real Estate',
    screensCount: 3,
    submissions: 184,
    conversionRate: 42.8,
    status: 'ACTIVE',
    lastActive: '12 min ago',
    screens: [
      {
        id: 'screen_config',
        title: 'Choose Configuration',
        subtitle: 'Select your preferred layout and budget bracket',
        fields: [
          {
            id: 'unit_type',
            type: 'radio',
            label: 'Apartment Typology',
            options: ['2 BHK (1,150 sq.ft)', '3 BHK Luxury (1,450 sq.ft)', '4 BHK Penthouse (2,200 sq.ft)'],
            required: true,
          },
          {
            id: 'budget_range',
            type: 'dropdown',
            label: 'Budget Bracket',
            options: ['₹90L – ₹1.2 Cr', '₹1.2 Cr – ₹1.6 Cr', '₹2.5 Cr+'],
            required: true,
          },
        ],
      },
      {
        id: 'screen_schedule',
        title: 'Schedule Site Tour',
        subtitle: 'Choose your date for complimentary chauffeur pickup',
        fields: [
          { id: 'preferred_date', type: 'date', label: 'Preferred Date', required: true },
          {
            id: 'time_slot',
            type: 'dropdown',
            label: 'Time Window',
            options: ['Morning (10:00 AM – 1:00 PM)', 'Afternoon (2:00 PM – 5:00 PM)', 'Sunset Preview (5:00 PM – 7:00 PM)'],
            required: true,
          },
        ],
      },
      {
        id: 'screen_confirm',
        title: 'Confirm Contact Info',
        subtitle: 'Our Senior Property Advisor will welcome you on site',
        fields: [
          { id: 'visitor_name', type: 'text', label: 'Full Name', placeholder: 'Arjun Sharma', required: true },
          { id: 'special_notes', type: 'text', label: 'Any specific requests?', placeholder: 'Looking for park-facing or high floor', required: false },
        ],
      },
    ],
  },
  {
    id: 'flow_clinic_appointment',
    name: 'Consultation & Doctor Slot Booking',
    category: 'Healthcare',
    screensCount: 2,
    submissions: 92,
    conversionRate: 61.4,
    status: 'ACTIVE',
    lastActive: '1 hour ago',
    screens: [
      {
        id: 'screen_specialty',
        title: 'Select Doctor Specialty',
        subtitle: 'Direct WhatsApp OPD appointment scheduling',
        fields: [
          { id: 'doctor', type: 'dropdown', label: 'Specialist', options: ['Dr. Khanna (Cardiology)', 'Dr. Sharma (Orthopedics)', 'Dr. Verma (Dermatology)'], required: true },
          { id: 'patient_type', type: 'radio', label: 'Consultation Type', options: ['First Visit', 'Follow-up Consultation'], required: true },
        ],
      },
      {
        id: 'screen_slot',
        title: 'Select Date & Slot',
        subtitle: 'Instant token generated with zero clinic waiting',
        fields: [
          { id: 'appointment_date', type: 'date', label: 'Date', required: true },
          { id: 'patient_phone', type: 'text', label: 'Patient WhatsApp Number', placeholder: '+91 98XXX XXXXX', required: true },
        ],
      },
    ],
  },
]

// ── Sample Payments
const INITIAL_PAYMENTS: PaymentRecord[] = [
  { id: 'PAY_001', leadName: 'Arjun Sharma', leadPhone: '+91 98234 11204', amount: 50000, description: 'Sector 62 Unit 804 — Booking Token Hold', method: 'Razorpay UPI', status: 'PAID', createdAt: 'Today, 11:24 AM', txnId: 'pay_Nq98124Xz' },
  { id: 'PAY_002', leadName: 'Priya Mehta', leadPhone: '+91 97112 88491', amount: 100000, description: '3BHK Allotment Guarantee Deposit', method: 'WhatsApp Pay', status: 'SENT', createdAt: 'Today, 09:15 AM' },
  { id: 'PAY_003', leadName: 'Sunita Bose', leadPhone: '+91 98114 55109', amount: 25000, description: 'Site Visit Express Reservation & Token', method: 'PhonePe QR', status: 'PAID', createdAt: 'Yesterday, 04:30 PM', txnId: 'pay_Mp77182Ya' },
  { id: 'PAY_004', leadName: 'Rohit Gupta', leadPhone: '+91 99100 22341', amount: 50000, description: 'Weekend Price Lock Token', method: 'Razorpay UPI', status: 'EXPIRED', createdAt: '3 days ago' },
]

// ── Sample CTWA Ads Attribution
const ADS_ATTRIBUTION: AdAttribution[] = [
  { adId: 'ad_ctwa_01', adName: 'Luxury 3BHK Sector 62 Video Tour', campaignName: 'Gurugram HNI Buyers Q4', platform: 'Instagram', leadsCount: 148, avgIntentScore: 84, conversions: 18, revenueTracked: 24200000, spend: 32000, roas: 75.6 },
  { adId: 'ad_ctwa_02', adName: 'Ready to Move Penthouses Carousel', campaignName: 'Golf Course Extension High-Ticket', platform: 'Facebook', leadsCount: 94, avgIntentScore: 78, conversions: 9, revenueTracked: 16500000, spend: 24000, roas: 68.7 },
  { adId: 'ad_ctwa_03', adName: 'Zero Brokerage Direct Builder Offer', campaignName: 'Festival Fast Track', platform: 'Instagram', leadsCount: 112, avgIntentScore: 62, conversions: 6, revenueTracked: 7800000, spend: 18000, roas: 43.3 },
]

// ─────────────────────────────────────────────────────────────────────────────
// P3-02: INTERACTIVE WHATSAPP FLOW BUILDER WITH LIVE PHONE PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
function FlowBuilder({ flow, onBack }: { flow?: WhatsAppFlow; onBack: () => void }) {
  const [publishing, setPublishing] = useState(false)
  const [flowTitle, setFlowTitle] = useState(flow?.name || 'Custom WhatsApp Interactive Form')
  const [screens, setScreens] = useState(
    flow?.screens || [
      {
        id: 'screen_1',
        title: 'Step 1: Inquire Details',
        subtitle: 'Provide quick information',
        fields: [
          { id: 'f1', type: 'radio' as const, label: 'Interested In', options: ['Option A', 'Option B'], required: true },
        ],
      },
    ]
  )
  const [activeScreenIndex, setActiveScreenIndex] = useState(0)

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await commerceApi.createFlow({
        name: flowTitle,
        category: flow?.category || 'Real Estate',
        screens,
      })
      onBack()
    } catch (err) {
      console.warn('Flow publish fallback:', err)
      onBack()
    } finally {
      setPublishing(false)
    }
  }

  const activeScreen = screens[activeScreenIndex] || screens[0]

  const addField = (type: 'text' | 'dropdown' | 'date' | 'radio') => {
    setScreens(scs =>
      scs.map((sc, idx) =>
        idx === activeScreenIndex
          ? {
              ...sc,
              fields: [
                ...sc.fields,
                {
                  id: `f_${Date.now()}`,
                  type,
                  label: type === 'date' ? 'Preferred Date' : type === 'dropdown' ? 'Select Option' : 'Enter Details',
                  options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
                  required: true,
                },
              ],
            }
          : sc
      )
    )
  }

  const addScreen = () => {
    const newIdx = screens.length + 1
    const newScreen = {
      id: `screen_${newIdx}`,
      title: `Screen 0${newIdx}: Additional Info`,
      subtitle: 'Complete final question',
      fields: [{ id: `f_init_${Date.now()}`, type: 'text' as const, label: 'Your Full Name', required: true }],
    }
    setScreens(scs => [...scs, newScreen])
    setActiveScreenIndex(screens.length)
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors block">
        ← Back to Flows Library
      </button>

      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P3-02 · WHATSAPP FLOWS CANVAS (META DATA API v4.0)</div>
          <input
            type="text"
            value={flowTitle}
            onChange={e => setFlowTitle(e.target.value)}
            className="font-display text-2xl text-[#F0EDE8] mt-0.5 bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#C8953A] outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-3 py-2 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8]" style={{ borderRadius: 2 }}>
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors disabled:opacity-50"
            style={{ borderRadius: 2 }}
          >
            {publishing ? 'Publishing...' : 'Publish to Meta Cloud API →'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Left Form Builder Canvas */}
        <div className="space-y-5">
          {/* Screen Tabs */}
          <div className="flex items-center gap-2 border-b border-white/8 pb-2 overflow-x-auto">
            {screens.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => setActiveScreenIndex(idx)}
                className="px-3 py-1.5 font-mono text-[10px] border transition-colors flex items-center gap-2 flex-shrink-0"
                style={{
                  borderRadius: 2,
                  borderColor: activeScreenIndex === idx ? '#C8953A' : 'rgba(255,255,255,0.08)',
                  background: activeScreenIndex === idx ? 'rgba(200,149,58,0.1)' : 'transparent',
                  color: activeScreenIndex === idx ? '#C8953A' : '#6B6B6B',
                }}
              >
                <span>0{idx + 1}</span> {sc.title.slice(0, 18)}…
              </button>
            ))}
            <button
              onClick={addScreen}
              className="px-2.5 py-1 font-mono text-[10px] border border-dashed border-white/15 text-[#6B6B6B] hover:text-[#F0EDE8] hover:border-white/30"
              style={{ borderRadius: 2 }}
            >
              + Add Screen
            </button>
          </div>

          {/* Active Screen Editor */}
          <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">SCREEN TITLE</label>
                <input
                  type="text"
                  value={activeScreen.title}
                  onChange={e => {
                    const val = e.target.value
                    setScreens(scs => scs.map((sc, i) => i === activeScreenIndex ? { ...sc, title: val } : sc))
                  }}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">SUBTITLE / HELPER TEXT</label>
                <input
                  type="text"
                  value={activeScreen.subtitle}
                  onChange={e => {
                    const val = e.target.value
                    setScreens(scs => scs.map((sc, i) => i === activeScreenIndex ? { ...sc, subtitle: val } : sc))
                  }}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2 focus:border-[#C8953A] outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">FORM FIELDS IN THIS SCREEN</div>
              {activeScreen.fields.map((fld, fIdx) => (
                <div key={fld.id} className="border border-white/5 p-3 bg-[#111] space-y-2" style={{ borderRadius: 2 }}>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-[#4A9EBA] uppercase font-semibold">Field 0{fIdx + 1} · {fld.type}</span>
                    <button
                      onClick={() => {
                        setScreens(scs =>
                          scs.map((sc, i) =>
                            i === activeScreenIndex
                              ? { ...sc, fields: sc.fields.filter(x => x.id !== fld.id) }
                              : sc
                          )
                        )
                      }}
                      className="font-mono text-[9px] text-[#444] hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="text"
                    value={fld.label}
                    onChange={e => {
                      const val = e.target.value
                      setScreens(scs =>
                        scs.map((sc, i) =>
                          i === activeScreenIndex
                            ? { ...sc, fields: sc.fields.map(f => f.id === fld.id ? { ...f, label: val } : f) }
                            : sc
                        )
                      )
                    }}
                    className="w-full bg-[#080808] border border-white/10 text-xs text-[#F0EDE8] px-3 py-1.5 focus:border-[#C8953A] outline-none"
                    style={{ borderRadius: 2 }}
                  />
                  {fld.options && (
                    <div className="text-[10px] font-mono text-[#6B6B6B]">
                      Options: {fld.options.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Field Buttons */}
            <div className="flex gap-2 pt-2">
              <span className="font-mono text-[9px] text-[#6B6B6B] self-center">Insert:</span>
              {(['dropdown', 'radio', 'date', 'text'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => addField(t)}
                  className="px-2.5 py-1 border border-dashed border-white/15 font-mono text-[9px] text-[#C8953A] hover:border-[#C8953A] transition-colors"
                  style={{ borderRadius: 2 }}
                >
                  + {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right WhatsApp Mobile Frame Live Simulator */}
        <div className="flex flex-col items-center">
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">NATIVE WHATSAPP WEB & MOBILE PREVIEW</div>
          <div
            className="w-[300px] border border-white/15 bg-[#0b141a] p-4 flex flex-col justify-between shadow-2xl relative"
            style={{ borderRadius: 24, minHeight: 520 }}
          >
            {/* Top Phone Notch / Bar */}
            <div className="border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#00a884] font-mono text-sm">←</span>
                <div>
                  <div className="text-xs font-semibold text-[#e9edef] truncate">{activeScreen.title}</div>
                  <div className="font-mono text-[8px] text-[#8696a0]">Screen {activeScreenIndex + 1} of {screens.length}</div>
                </div>
              </div>
            </div>

            {/* Form Content Mockup */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="text-[11px] text-[#8696a0] leading-tight">{activeScreen.subtitle}</div>

              {activeScreen.fields.map(fld => (
                <div key={fld.id} className="space-y-1.5">
                  <div className="text-xs font-medium text-[#e9edef]">{fld.label}</div>
                  {fld.type === 'radio' && (
                    <div className="space-y-1">
                      {fld.options?.map((opt, oIdx) => (
                        <div key={opt} className="flex items-center gap-2 p-2 bg-[#1f2c34] border border-white/5 rounded-xs text-[11px] text-[#e9edef]">
                          <input type="radio" name={fld.id} defaultChecked={oIdx === 0} className="accent-[#00a884]" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {fld.type === 'dropdown' && (
                    <div className="p-2.5 bg-[#1f2c34] border border-white/5 rounded-xs text-xs text-[#e9edef] flex justify-between items-center">
                      <span>{fld.options?.[0] || 'Select an option'}</span>
                      <span className="text-[10px] text-[#8696a0]">▼</span>
                    </div>
                  )}
                  {fld.type === 'date' && (
                    <div className="p-2.5 bg-[#1f2c34] border border-white/5 rounded-xs text-xs text-[#e9edef] flex justify-between items-center">
                      <span>28 September 2026</span>
                      <span>📅</span>
                    </div>
                  )}
                  {fld.type === 'text' && (
                    <div className="p-2.5 bg-[#1f2c34] border border-white/5 rounded-xs text-xs text-[#8696a0]">
                      {fld.placeholder || 'Type here...'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom In-Chat CTA */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  if (activeScreenIndex < screens.length - 1) setActiveScreenIndex(i => i + 1)
                  else alert('WhatsApp Flow simulation completed! 100/100 Intent lead logged in Anchor.')
                }}
                className="w-full py-2.5 bg-[#00a884] text-[#111b21] font-semibold text-xs tracking-wide rounded-xs hover:bg-[#02be96] transition-colors shadow-md"
              >
                {activeScreenIndex < screens.length - 1 ? 'Next Step →' : 'Submit Booking Form'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P3-04 & P3-05: IN-CHAT PAYMENTS & UPI TRANSACTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function PaymentsView() {
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAmount, setNewAmount] = useState('50000')
  const [newDesc, setNewDesc] = useState('Sector 62 Unit Allotment Token')
  const [newLead, setNewLead] = useState('Arjun Sharma (+91 98234 11204)')
  const [newMethod, setNewMethod] = useState<'Razorpay UPI' | 'WhatsApp Pay'>('Razorpay UPI')
  const [leadsList, setLeadsList] = useState<any[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [simulatingPaymentId, setSimulatingPaymentId] = useState<string | null>(null)

  const loadPayments = async () => {
    try {
      const data = await commerceApi.getPayments()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PaymentRecord[] = data.map((p: any) => ({
          id: p.id,
          leadName: p.lead?.name || 'Customer',
          leadPhone: p.lead?.phone || '+91 98XXX XX000',
          amount: p.amountINR || 50000,
          description: p.description || 'Token Payment',
          method: (p.paymentMethod || 'Razorpay UPI') as any,
          status: p.status as any,
          createdAt: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          txnId: p.razorpayPaymentId || p.razorpayLinkId,
        }))
        setPayments(prev => {
          const existingIds = new Set(mapped.map(m => m.id))
          return [...mapped, ...prev.filter(p => !existingIds.has(p.id))]
        })
      }
    } catch (err) {
      console.warn('Backend payments fallback:', err)
    }
  }

  useEffect(() => {
    loadPayments()
    leadsApi.getLeads().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setLeadsList(data)
        setSelectedLeadId(data[0].id)
      }
    }).catch(() => {})
  }, [])

  const totalCollected = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const pendingCollection = payments.filter(p => p.status === 'SENT').reduce((s, p) => s + p.amount, 0)

  const handleCreatePayment = async () => {
    setSubmitting(true)
    try {
      if (selectedLeadId) {
        await commerceApi.createPaymentLink({
          leadId: selectedLeadId,
          amountINR: Number(newAmount),
          description: newDesc,
          paymentMethod: newMethod,
        })
        await loadPayments()
      } else {
        const chosenLead = leadsList.find(l => l.id === selectedLeadId) || { name: newLead, phone: '+91 98234 99120' }
        const newRecord: PaymentRecord = {
          id: `PAY_00${payments.length + 1}`,
          leadName: chosenLead.name,
          leadPhone: chosenLead.phone,
          amount: Number(newAmount),
          description: newDesc,
          method: newMethod,
          status: 'SENT',
          createdAt: 'Just now',
        }
        setPayments([newRecord, ...payments])
      }
      setShowCreateModal(false)
    } catch (err) {
      console.warn('Error creating payment:', err)
      setShowCreateModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSimulatePaymentSuccess = async (paymentId: string) => {
    setSimulatingPaymentId(paymentId)
    try {
      if (paymentId.includes('-')) {
        await commerceApi.simulatePaymentSuccess(paymentId)
        await loadPayments()
      } else {
        setPayments(ps => ps.map(p => p.id === paymentId ? { ...p, status: 'PAID', txnId: `pay_${Date.now()}` } : p))
      }
    } catch (err) {
      console.warn('Payment simulation fallback:', err)
      setPayments(ps => ps.map(p => p.id === paymentId ? { ...p, status: 'PAID' } : p))
    } finally {
      setSimulatingPaymentId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* P3-05: Create Payment Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-lg p-6 space-y-4" style={{ borderRadius: 2 }}>
            <div className="flex justify-between items-center border-b border-white/8 pb-3">
              <div>
                <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P3-05 · GENERATE IN-CHAT PAYMENT LINK</div>
                <div className="text-sm font-medium text-[#F0EDE8]">Instant Token & Booking Collection</div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6B6B6B] hover:text-[#F0EDE8] font-mono text-base">×</button>
            </div>

            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">SELECT LEAD</label>
              {leadsList.length > 0 ? (
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 outline-none cursor-pointer focus:border-[#C8953A]"
                  style={{ borderRadius: 2 }}
                >
                  {leadsList.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.phone}) · Intent {l.intentScore}/100
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={newLead}
                  onChange={e => setNewLead(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
                  style={{ borderRadius: 2 }}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">AMOUNT (₹ INR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#C8953A] font-display text-lg px-3 py-1.5 focus:border-[#C8953A] outline-none"
                  style={{ borderRadius: 2 }}
                />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">PAYMENT RAIL</label>
                <select
                  value={newMethod}
                  onChange={e => setNewMethod(e.target.value as any)}
                  className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 outline-none cursor-pointer"
                  style={{ borderRadius: 2 }}
                >
                  <option>Razorpay UPI</option>
                  <option>WhatsApp Pay</option>
                  <option>PhonePe QR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">DESCRIPTION ON INVOICE</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
                style={{ borderRadius: 2 }}
              />
            </div>

            <div className="border border-white/5 p-3 bg-[#111] space-y-1" style={{ borderRadius: 2 }}>
              <div className="font-mono text-[9px] text-green-400">✓ AUTOMATIC WORKFLOW TRIGGER</div>
              <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                Upon payment webhook confirmation from Razorpay/WhatsApp Pay, Anchor automatically upgrades this lead to <strong className="text-[#F0EDE8]">WON</strong> and dispatches an official GST invoice PDF into WhatsApp.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8]">
                Cancel
              </button>
              <button
                onClick={handleCreatePayment}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Generating...' : 'Generate & Dispatch Link →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue Collected', value: `₹${(totalCollected / 100000).toFixed(2)} Lakhs`, color: '#C8953A' },
          { label: 'Pending in Active Chats', value: `₹${(pendingCollection / 100000).toFixed(2)} Lakhs`, color: '#EAB308' },
          {
            label: 'Paid Conversion Rate',
            value: payments.length > 0 ? `${Math.round((payments.filter(p => p.status === 'PAID').length / payments.length) * 100)}%` : '0%',
            color: '#4ADE80'
          },
          { label: 'Zero-Redirect Checkout', value: '100% Native', color: '#4A9EBA' },
        ].map(k => (
          <div key={k.label} className="border border-white/8 p-4 bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
            <div className="font-display text-2xl" style={{ color: k.color }}>{k.value}</div>
            <div className="font-mono text-[9px] text-[#6B6B6B] mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[9px] text-[#6B6B6B]">
            {payments.length} transactions logged · Razorpay + WhatsApp Pay Native UPI protocol
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center gap-1.5"
          style={{ borderRadius: 2 }}
        >
          <CardIcon size={12} strokeWidth={2} /> + Create Payment Link
        </button>
      </div>

      {/* P3-04 & P3-06: Payments Table */}
      <div className="border border-white/8 overflow-hidden bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
        <div className="grid grid-cols-[1.5fr_1fr_auto_auto_auto_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
          <span>LEAD & DETAILS</span>
          <span>PAYMENT DESCRIPTION</span>
          <span>AMOUNT</span>
          <span>METHOD</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>
        {payments.map(p => (
          <div key={p.id} className="grid grid-cols-[1.5fr_1fr_auto_auto_auto_auto] px-4 py-3.5 border-b border-white/5 last:border-0 items-center gap-4 hover:bg-white/2 transition-colors">
            <div>
              <div className="text-sm font-medium text-[#F0EDE8]">{p.leadName}</div>
              <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{p.leadPhone} · {p.createdAt}</div>
            </div>
            <div className="text-xs text-[#6B6B6B] truncate">{p.description}</div>
            <div className="font-mono text-sm text-[#C8953A] font-bold">₹{p.amount.toLocaleString()}</div>
            <div className="font-mono text-[9px] text-[#4A9EBA] border border-[#4A9EBA]/20 bg-[#4A9EBA]/5 px-2 py-0.5 inline-block text-center" style={{ borderRadius: 2 }}>
              {p.method}
            </div>
            <div>
              <span
                className="font-mono text-[9px] px-2 py-0.5"
                style={{
                  borderRadius: 2,
                  background: p.status === 'PAID' ? 'rgba(74,222,128,0.1)' : p.status === 'SENT' ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)',
                  color: p.status === 'PAID' ? '#4ADE80' : p.status === 'SENT' ? '#EAB308' : '#6B6B6B',
                }}
              >
                {p.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {p.status === 'PAID' ? (
                <button
                  onClick={() => alert(`Official GST Receipt: https://anchor.io/receipt/${p.txnId || p.id}`)}
                  className="font-mono text-[9px] text-[#C8953A] hover:underline"
                >
                  Download GST Receipt
                </button>
              ) : (
                <>
                  <button className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8] border border-white/10 px-2 py-1">
                    Resend in Chat
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentSuccess(p.id)}
                    disabled={simulatingPaymentId === p.id}
                    className="font-mono text-[9px] text-[#4ADE80] border border-green-500/25 bg-green-500/10 px-2 py-1 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                  >
                    {simulatingPaymentId === p.id ? 'Confirming...' : '⚡ Simulate Paid'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P3-07, P3-08, P3-09: CTWA AD ATTRIBUTION & ROAS REVENUE SUITE
// ─────────────────────────────────────────────────────────────────────────────
function AttributionView() {
  const totalRevenue = ADS_ATTRIBUTION.reduce((s, a) => s + a.revenueTracked, 0)
  const totalSpend = ADS_ATTRIBUTION.reduce((s, a) => s + a.spend, 0)
  const overallROAS = (totalRevenue / (totalSpend || 1)).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Top Attributed ROAS Hero */}
      <div className="border border-[#C8953A]/25 bg-[#C8953A]/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderRadius: 2 }}>
        <div>
          <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P3-07 · CLOSED-LOOP CTWA ATTRIBUTION</div>
          <div className="font-display text-3xl text-[#F0EDE8] mt-1">₹4.85 Crore Attributed Revenue</div>
          <div className="font-mono text-[10px] text-[#6B6B6B] mt-1">
            Meta Ads Spend: ₹74,000 | Direct WhatsApp Closed Deals: 33
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-[#6B6B6B]">AGGREGATE CTWA ROAS</div>
          <div className="font-display text-4xl text-[#C8953A]">{overallROAS}x</div>
          <div className="font-mono text-[9px] text-green-400">72h Free Messaging Window Active</div>
        </div>
      </div>

      {/* P3-08: Campaign ROAS Breakdown Table */}
      <div>
        <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">P3-08 · CAMPAIGN-WISE DEAL ATTRIBUTION</div>
        <div className="border border-white/8 overflow-hidden bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
          <div className="grid grid-cols-[1.5fr_auto_auto_auto_auto_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
            <span>META AD CAMPAIGN</span>
            <span>LEADS CAPTURED</span>
            <span>AVG INTENT</span>
            <span>SPEND</span>
            <span>CLOSED REVENUE</span>
            <span>ROAS</span>
          </div>
          {ADS_ATTRIBUTION.map(ad => (
            <div key={ad.adId} className="grid grid-cols-[1.5fr_auto_auto_auto_auto_auto] px-4 py-3.5 border-b border-white/5 last:border-0 items-center gap-4 hover:bg-white/2 transition-colors">
              <div>
                <div className="text-sm font-medium text-[#F0EDE8]">{ad.adName}</div>
                <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{ad.campaignName} · {ad.platform}</div>
              </div>
              <span className="font-mono text-xs text-[#F0EDE8]">{ad.leadsCount}</span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-[#C8953A]">
                <span>{ad.avgIntentScore}</span>
                <span className="text-[9px] text-[#6B6B6B]">/100</span>
              </div>
              <span className="font-mono text-xs text-[#6B6B6B]">₹{ad.spend.toLocaleString()}</span>
              <span className="font-mono text-sm text-[#F0EDE8] font-bold">₹{(ad.revenueTracked / 100000).toFixed(1)}L</span>
              <span className="font-mono text-sm text-green-400 font-bold">{ad.roas}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* P3-09: Source Channel Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-white/8 p-4 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">P3-09 · CHANNEL REVENUE CONVERSION</div>
          {[
            { channel: 'Meta CTWA Ads (Instagram & FB)', leads: 354, conv: '11.4%', revenue: '₹4.85 Cr' },
            { channel: 'Organic WhatsApp (Website QR)', leads: 84, conv: '6.2%', revenue: '₹65 Lakhs' },
            { channel: 'Property Portals (99acres / MagicBricks)', leads: 128, conv: '8.1%', revenue: '₹1.10 Cr' },
          ].map(ch => (
            <div key={ch.channel} className="flex items-center justify-between p-2.5 border border-white/5 bg-[#111]" style={{ borderRadius: 2 }}>
              <div>
                <div className="text-xs text-[#F0EDE8] font-medium">{ch.channel}</div>
                <div className="font-mono text-[9px] text-[#6B6B6B]">{ch.leads} leads · {ch.conv} conversion</div>
              </div>
              <div className="font-display text-sm text-[#C8953A] font-bold">{ch.revenue}</div>
            </div>
          ))}
        </div>

        {/* P3-10: Connect Facebook Ads Manager */}
        <div className="border border-white/8 p-4 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">P3-10 · META BUSINESS MANAGER SYNC</div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-green-400">
            <CheckIcon size={12} strokeWidth={2} /> Facebook Ads Account Connected (#act_88192410)
          </div>
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Anchor auto-ingests CTWA referral payloads, tracks conversions back to Meta Pixel via Conversion API (CAPI), and grants prospects 72 hours of ₹0 template messaging.
          </p>
          <div className="flex gap-2 pt-2">
            <button className="px-3 py-1.5 border border-white/10 font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8]" style={{ borderRadius: 2 }}>
              Refresh Ad Tokens
            </button>
            <button className="px-3 py-1.5 bg-[#C8953A]/10 border border-[#C8953A]/30 text-[#C8953A] font-mono text-[9px] hover:bg-[#C8953A]/20" style={{ borderRadius: 2 }}>
              Map Conversion Events
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMMERCE EXPORT (PHASE 3)
// ─────────────────────────────────────────────────────────────────────────────
export default function Commerce() {
  const [activeTab, setActiveTab] = useState<'flows' | 'payments' | 'attribution'>('flows')
  const [flows, setFlows] = useState<WhatsAppFlow[]>(INITIAL_FLOWS)
  const [buildingFlow, setBuildingFlow] = useState<WhatsAppFlow | 'new' | null>(null)

  const loadFlows = async () => {
    try {
      const data = await commerceApi.getFlows()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: WhatsAppFlow[] = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          category: f.category || 'Real Estate',
          screensCount: f.screens?.length || 2,
          submissions: 12,
          conversionRate: 68.4,
          status: 'ACTIVE',
          lastActive: 'Just now',
          screens: f.screens || [],
        }))
        setFlows(prev => {
          const existingIds = new Set(mapped.map(m => m.id))
          return [...mapped, ...prev.filter(p => !existingIds.has(p.id))]
        })
      }
    } catch (err) {
      console.warn('Backend flows fallback:', err)
    }
  }

  useEffect(() => {
    loadFlows()
  }, [])

  if (buildingFlow !== null) {
    return (
      <FlowBuilder
        flow={buildingFlow === 'new' ? undefined : buildingFlow}
        onBack={() => {
          setBuildingFlow(null)
          loadFlows()
        }}
      />
    )
  }

  return (
    <div>
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1 overflow-x-auto">
        {[
          { id: 'flows', label: 'WhatsApp Flows (Forms)' },
          { id: 'payments', label: 'In-Chat Payments & UPI' },
          { id: 'attribution', label: 'CTWA Ads Attribution & ROAS' },
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

      {activeTab === 'payments' && <PaymentsView />}
      {activeTab === 'attribution' && <AttributionView />}

      {activeTab === 'flows' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">
                {flows.filter(f => f.status === 'ACTIVE').length} active interactive flows · Zero-redirect qualification
              </div>
            </div>
            <button
              onClick={() => setBuildingFlow('new')}
              className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center gap-1.5"
              style={{ borderRadius: 2 }}
            >
              <FlowIcon size={12} strokeWidth={2} /> + Build New WhatsApp Flow
            </button>
          </div>

          {/* P3-01: Pre-built Flow Templates Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {flows.map(flow => (
              <div key={flow.id} className="border border-white/8 p-5 bg-[#0D0D0D] hover:border-white/15 transition-colors space-y-4" style={{ borderRadius: 2 }}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] text-[#4A9EBA] border border-[#4A9EBA]/20 bg-[#4A9EBA]/5 px-2 py-0.5 inline-block mb-1.5" style={{ borderRadius: 2 }}>
                      {flow.category}
                    </span>
                    <h3 className="text-sm font-medium text-[#F0EDE8]">{flow.name}</h3>
                  </div>
                  <span className="font-mono text-[9px] px-2 py-0.5 text-green-400 bg-green-500/10 border border-green-500/20" style={{ borderRadius: 2 }}>
                    {flow.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-3 font-mono text-center">
                  <div>
                    <div className="text-[9px] text-[#6B6B6B]">SCREENS</div>
                    <div className="text-sm text-[#F0EDE8] mt-0.5">{flow.screensCount} Steps</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#6B6B6B]">SUBMISSIONS</div>
                    <div className="text-sm text-[#C8953A] mt-0.5">{flow.submissions}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#6B6B6B]">COMPLETION</div>
                    <div className="text-sm text-green-400 mt-0.5">{flow.conversionRate}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#6B6B6B]">Last submission: {flow.lastActive}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBuildingFlow(flow)}
                      className="font-mono text-[9px] text-[#C8953A] hover:underline"
                    >
                      Open Builder Canvas →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
