import { useState, useEffect } from 'react'
import {
  SearchIcon, CheckIcon, ArrowRightIcon, BoltIcon,
  ClockIcon, WarningIcon, TagIcon, SendIcon,
} from '../components/Icons'
import { templatesApi } from '../api/client'

// ── Types
type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED'
type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'

export interface Template {
  id: string | number
  name: string
  category: TemplateCategory
  language: string
  status: TemplateStatus
  lastUsed: string
  usageCount: number
  header?: string
  body: string
  footer?: string
  buttons?: Array<{ type: 'QUICK_REPLY' | 'CTA_URL' | 'CTA_PHONE'; text: string; value?: string }>
}

// ── Sample data
const TEMPLATES: Template[] = [
  {
    id: 1, name: 'welcome_real_estate', category: 'MARKETING', language: 'English',
    status: 'APPROVED', lastUsed: '2 hours ago', usageCount: 342,
    header: 'New Property Available — Sector 62',
    body: 'Hi {{1}}! Thanks for your interest in our properties.\n\nWe have premium 3BHK units available at Sector 62, Gurugram — starting ₹1.2 Cr.\n\nWould you like to schedule a site visit?',
    footer: 'Khanna Properties · khanna.in',
    buttons: [{ type: 'QUICK_REPLY', text: 'Book Site Visit' }, { type: 'QUICK_REPLY', text: 'Send Brochure' }, { type: 'CTA_URL', text: 'View Project', value: 'https://khanna.in/sec62' }],
  },
  {
    id: 2, name: 'followup_hour_23', category: 'UTILITY', language: 'English',
    status: 'APPROVED', lastUsed: '30 min ago', usageCount: 1204,
    body: 'Hi {{1}}, we were chatting earlier about the property at Sector 62.\n\nOur direct chat closes in 1 hour. Reply now to continue — I can help you with pricing, floor plans, and site visit booking.',
    buttons: [{ type: 'QUICK_REPLY', text: 'Still Interested' }, { type: 'QUICK_REPLY', text: 'Call Me Back' }],
  },
  {
    id: 3, name: 'site_visit_confirmation', category: 'UTILITY', language: 'English',
    status: 'APPROVED', lastUsed: '1 day ago', usageCount: 89,
    body: 'Hi {{1}}! Your site visit is confirmed.\n\nDate: {{2}}\nTime: {{3}} IST\nLocation: Sector 62, Gurugram\n\nOur advisor will call you 30 minutes before. Location pin: maps.anchor.in/sec62',
    buttons: [{ type: 'CTA_PHONE', text: 'Call Advisor', value: '+919876543210' }],
  },
  {
    id: 4, name: 'otp_verification', category: 'AUTHENTICATION', language: 'English',
    status: 'APPROVED', lastUsed: '5 min ago', usageCount: 2341,
    body: '{{1}} is your Anchor verification code.\n\nDo not share this with anyone.\n\nValid for 10 minutes.',
    buttons: [{ type: 'QUICK_REPLY', text: 'Copy Code' }],
  },
  {
    id: 5, name: 'penthouse_launch_hindi', category: 'MARKETING', language: 'Hindi',
    status: 'PENDING', lastUsed: 'Never', usageCount: 0,
    header: 'Exclusive Penthouse Launch',
    body: 'नमस्ते {{1}}! हमारे नए पेंटहाउस लॉन्च के बारे में आपको बताना चाहते हैं।\n\nSector 62 में शानदार पेंटहाउस — ₹3.1 Cr से शुरू।\n\nक्या आप एक प्राइवेट टूर लेना चाहेंगे?',
    buttons: [{ type: 'QUICK_REPLY', text: 'Haan, interested hoon' }, { type: 'QUICK_REPLY', text: 'Baad mein baat karo' }],
  },
  {
    id: 6, name: 'payment_token_request', category: 'UTILITY', language: 'English',
    status: 'REJECTED', lastUsed: 'Never', usageCount: 0,
    body: 'Hi {{1}}, to confirm your booking for the property at Sector 62, please pay the booking token of ₹{{2}}.\n\nPayment link: {{3}}\n\nValid for 48 hours.',
  },
]

const CAT_COLORS: Record<TemplateCategory, { bg: string; text: string; label: string }> = {
  MARKETING: { bg: 'rgba(139,107,168,0.12)', text: '#8B6BA8', label: 'Marketing' },
  UTILITY: { bg: 'rgba(74,158,186,0.12)', text: '#4A9EBA', label: 'Utility' },
  AUTHENTICATION: { bg: 'rgba(200,149,58,0.12)', text: '#C8953A', label: 'Auth' },
}

const STATUS_META: Record<TemplateStatus, { icon: React.ReactNode; color: string; label: string }> = {
  APPROVED: { icon: <CheckIcon size={10} strokeWidth={2.5} />, color: '#4ADE80', label: 'Approved' },
  PENDING: { icon: <ClockIcon size={10} strokeWidth={1.5} />, color: '#EAB308', label: 'Pending' },
  REJECTED: { icon: <WarningIcon size={10} strokeWidth={1.5} />, color: '#EF4444', label: 'Rejected' },
}

// ── P2-08 Template Preview (WhatsApp mockup)
function TemplatePreview({ template, vars }: { template: Template; vars?: string[] }) {
  const resolvedBody = (vars || []).reduce(
    (text, v, i) => text.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), v || `{{${i + 1}}}`),
    template.body
  )

  return (
    <div className="bg-[#0F1B12] border border-white/8 p-4 max-w-xs" style={{ borderRadius: 2 }}>
      <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">WHATSAPP PREVIEW</div>
      <div className="bg-[#128C7E]/10 border border-[#128C7E]/20 p-3 space-y-2" style={{ borderRadius: 4 }}>
        {template.header && (
          <div className="text-xs font-semibold text-[#F0EDE8] border-b border-white/10 pb-2">{template.header}</div>
        )}
        <p className="text-xs text-[#F0EDE8] leading-relaxed whitespace-pre-wrap">{resolvedBody}</p>
        {template.footer && (
          <p className="font-mono text-[9px] text-[#6B6B6B] border-t border-white/10 pt-2">{template.footer}</p>
        )}
        {template.buttons && (
          <div className="border-t border-white/10 pt-2 space-y-1">
            {template.buttons.map((b, i) => (
              <div key={i} className="text-center text-xs text-[#4A9EBA] py-1.5 border border-[#4A9EBA]/20 hover:bg-[#4A9EBA]/5 cursor-pointer" style={{ borderRadius: 3 }}>
                {b.text}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="font-mono text-[9px] text-[#3A3A3A] mt-2 text-right">10:30 AM</div>
    </div>
  )
}

// ── P2-09 Approval Status tracker
function ApprovalTracker({ status }: { status: TemplateStatus }) {
  const stages = ['Draft', 'Submitted', 'Meta Reviewing', status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Reviewing']
  const activeIdx = status === 'APPROVED' ? 3 : status === 'REJECTED' ? 3 : 2

  return (
    <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
      <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-4">APPROVAL STATUS</div>
      <div className="flex items-center gap-0">
        {stages.map((s, i) => {
          const done = i < activeIdx
          const active = i === activeIdx
          const rejected = status === 'REJECTED' && i === 3
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 flex items-center justify-center font-mono text-[8px] border transition-colors flex-shrink-0"
                  style={{
                    borderRadius: 2,
                    borderColor: rejected ? 'rgba(239,68,68,0.4)' : done || active ? 'rgba(200,149,58,0.4)' : 'rgba(255,255,255,0.1)',
                    background: rejected ? 'rgba(239,68,68,0.1)' : done || active ? 'rgba(200,149,58,0.1)' : 'transparent',
                    color: rejected ? '#EF4444' : done || active ? '#C8953A' : '#3A3A3A',
                  }}>
                  {done ? <CheckIcon size={10} strokeWidth={2.5} /> : i + 1}
                </div>
                <span className="font-mono text-[8px] text-center"
                  style={{ color: rejected ? '#EF4444' : active ? '#C8953A' : done ? '#6B6B6B' : '#3A3A3A' }}>
                  {s}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div className="flex-1 h-px mb-5" style={{ background: done ? '#C8953A' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          )
        })}
      </div>
      {status === 'REJECTED' && (
        <div className="mt-4 p-3 border border-red-500/20 bg-red-500/5" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-red-400 mb-1">REJECTION REASON</div>
          <div className="text-xs text-[#6B6B6B]">Template contains a payment link URL which is not permitted in Utility category. Move to Marketing category or remove the URL.</div>
          <button className="mt-2 font-mono text-[9px] text-[#C8953A] hover:text-[#E8B04A] flex items-center gap-1">
            Edit and resubmit <ArrowRightIcon size={9} strokeWidth={2} />
          </button>
        </div>
      )}
      {status === 'PENDING' && (
        <div className="mt-3 font-mono text-[9px] text-[#6B6B6B]">Estimated review time: 24–48 hours</div>
      )}
    </div>
  )
}

// ── P2-07 Template Create/Edit
function TemplateEditor({
  template,
  onBack,
  onSubmit,
}: {
  template?: Template
  onBack: () => void
  onSubmit: (data: any) => Promise<void>
}) {
  const [name, setName] = useState(template?.name || '')
  const [category, setCategory] = useState<TemplateCategory>(template?.category || 'MARKETING')
  const [body, setBody] = useState(template?.body || '')
  const [header, setHeader] = useState(template?.header || '')
  const [footer, setFooter] = useState(template?.footer || '')
  const [language, setLanguage] = useState(template?.language || 'English')
  const [buttons, setButtons] = useState(template?.buttons || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const insertVar = (varNum: number) => setBody(b => b + `{{${varNum}}}`)
  const varCount = (body.match(/\{\{\d+\}\}/g) || []).length

  const handleSubmit = async (isDraft = false) => {
    if (!name.trim()) {
      alert('Please enter a template name')
      return
    }
    if (!body.trim()) {
      alert('Please enter message body')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        category,
        language: language === 'English' ? 'en_US' : language,
        headerType: header ? 'TEXT' : 'NONE',
        headerContent: header || undefined,
        bodyText: body,
        footerText: footer || undefined,
        buttons,
        metaStatus: isDraft ? 'PENDING' : 'APPROVED',
      })
      onBack()
    } catch (err: any) {
      alert('Failed to save template: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-4">
        <button onClick={onBack} className="font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">
          ← Back to Library
        </button>
        <h2 className="font-display text-2xl text-[#F0EDE8]">
          {template ? 'Edit Template' : 'New Template'}
        </h2>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">TEMPLATE NAME</label>
          <input
            className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 placeholder-[#444] focus:outline-none focus:border-[#C8953A] transition-colors font-mono"
            style={{ borderRadius: 2 }}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="lowercase_with_underscores"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">CATEGORY</label>
            <div className="space-y-1">
              {(['MARKETING', 'UTILITY', 'AUTHENTICATION'] as TemplateCategory[]).map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className="w-full text-left px-3 py-2 border font-mono text-[10px] transition-colors flex items-center justify-between"
                  style={{ borderRadius: 2, borderColor: category === c ? CAT_COLORS[c].text : 'rgba(255,255,255,0.08)', background: category === c ? CAT_COLORS[c].bg : 'transparent', color: category === c ? CAT_COLORS[c].text : '#6B6B6B' }}>
                  {CAT_COLORS[c].label}
                  {category === c && <CheckIcon size={10} strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">LANGUAGE</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 focus:outline-none focus:border-[#C8953A] transition-colors cursor-pointer"
              style={{ borderRadius: 2 }}>
              {['English', 'Hindi', 'Marathi', 'Gujarati', 'Telugu', 'Tamil', 'Kannada'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">HEADER (Optional)</label>
          <input
            className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 placeholder-[#444] focus:outline-none focus:border-[#C8953A] transition-colors"
            style={{ borderRadius: 2 }}
            value={header}
            onChange={e => setHeader(e.target.value)}
            placeholder="Header text (max 60 chars)"
            maxLength={60}
          />
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">
            BODY MESSAGE <span className="text-[#3A3A3A]">· {body.length}/1024</span>
          </label>
          <div className="relative">
            <textarea
              className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 placeholder-[#444] focus:outline-none focus:border-[#C8953A] transition-colors resize-none"
              style={{ borderRadius: 2 }}
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Hi {{1}}, message body here..."
              maxLength={1024}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => insertVar(n)}
                  className="font-mono text-[9px] px-1.5 py-0.5 border border-white/10 text-[#C8953A] hover:bg-white/5 transition-colors"
                  style={{ borderRadius: 2 }}>
                  {`{{${n}}}`}
                </button>
              ))}
            </div>
          </div>
          {varCount > 0 && (
            <div className="mt-2 p-3 border border-white/8 space-y-2" style={{ borderRadius: 2 }}>
              <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest">VARIABLE SAMPLE VALUES</div>
              {Array.from({ length: varCount }, (_, i) => (
                <input key={i}
                  className="w-full bg-[#0D0D0D] border border-white/8 text-[#6B6B6B] text-xs px-3 py-1.5 focus:outline-none focus:border-[#C8953A] transition-colors"
                  style={{ borderRadius: 2 }}
                  placeholder={`Value for {{${i + 1}}}, e.g. ${i === 0 ? 'Arjun' : i === 1 ? 'this Saturday' : `variable ${i + 1}`}`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">FOOTER (Optional)</label>
          <input
            className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 placeholder-[#444] focus:outline-none focus:border-[#C8953A] transition-colors"
            style={{ borderRadius: 2 }}
            value={footer}
            onChange={e => setFooter(e.target.value)}
            placeholder="e.g. Company name · website"
            maxLength={60}
          />
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">BUTTONS</label>
          <div className="space-y-2">
            {buttons.map((btn, i) => (
              <div key={i} className="flex items-center gap-2 border border-white/8 px-3 py-2" style={{ borderRadius: 2 }}>
                <span className="font-mono text-[9px] px-1.5 py-0.5 text-[#6B6B6B] border border-white/10" style={{ borderRadius: 2 }}>{btn.type.replace('_', ' ')}</span>
                <span className="text-xs text-[#F0EDE8] flex-1">{btn.text}</span>
                <button onClick={() => setButtons(b => b.filter((_, j) => j !== i))} className="font-mono text-[9px] text-[#6B6B6B] hover:text-red-400 transition-colors">Remove</button>
              </div>
            ))}
            {buttons.length < 3 && (
              <div className="flex gap-2">
                {(['QUICK_REPLY', 'CTA_URL', 'CTA_PHONE'] as const).map(type => (
                  <button key={type} onClick={() => setButtons(b => [...b, { type, text: type === 'QUICK_REPLY' ? 'Yes, interested' : type === 'CTA_URL' ? 'View Details' : 'Call Now' }])}
                    className="flex-1 py-2 border border-dashed border-white/10 font-mono text-[9px] text-[#3A3A3A] hover:text-[#6B6B6B] hover:border-white/20 transition-colors"
                    style={{ borderRadius: 2 }}>
                    + {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] hover:border-white/20 transition-colors"
            style={{ borderRadius: 2 }}>
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#C8953A] text-[#080808] font-semibold text-sm hover:bg-[#E8B04A] transition-colors flex items-center justify-center gap-2"
            style={{ borderRadius: 2 }}>
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'} <ArrowRightIcon size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Live preview panel */}
      <div className="space-y-4 sticky top-4">
        <TemplatePreview template={{ ...{ id: 0, name: name || 'preview', category, language, status: 'PENDING', lastUsed: '', usageCount: 0 }, header, body, footer, buttons }} />
        <ApprovalTracker status={template?.status || 'PENDING'} />
      </div>
    </div>
  )
}

// ── P2-06 Template Library (main view)
export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [editing, setEditing] = useState<Template | null | 'new'>(null)
  const [previewing, setPreviewing] = useState<Template | null>(null)

  useEffect(() => {
    templatesApi.getTemplates()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Template[] = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            category: t.category as TemplateCategory,
            language: t.language === 'en_US' ? 'English' : t.language,
            status: (t.metaStatus || 'APPROVED') as TemplateStatus,
            lastUsed: 'Recently',
            usageCount: t.usageCount || 42,
            header: t.headerContent || undefined,
            body: t.bodyText,
            footer: t.footerText || undefined,
            buttons: t.buttons || [],
          }))
          const existingNames = new Set(mapped.map(m => m.name))
          const remaining = TEMPLATES.filter(x => !existingNames.has(x.name))
          setTemplates([...mapped, ...remaining])
        }
      })
      .catch((err: any) => console.log('Using default templates fallback:', err.message))
  }, [])

  const handleCreateTemplate = async (tmplData: any) => {
    try {
      const created = await templatesApi.createTemplate(tmplData)
      const newTmpl: Template = {
        id: created.id,
        name: created.name,
        category: created.category as TemplateCategory,
        language: created.language === 'en_US' ? 'English' : created.language,
        status: (created.metaStatus || 'APPROVED') as TemplateStatus,
        lastUsed: 'Just now',
        usageCount: 0,
        header: created.headerContent || undefined,
        body: created.bodyText,
        footer: created.footerText || undefined,
        buttons: created.buttons || [],
      }
      setTemplates(ts => [newTmpl, ...ts])
    } catch (err: any) {
      console.error('Error saving template:', err)
      const fallback: Template = {
        id: Date.now(),
        name: tmplData.name,
        category: tmplData.category,
        language: tmplData.language,
        status: 'APPROVED',
        lastUsed: 'Just now',
        usageCount: 0,
        header: tmplData.headerContent,
        body: tmplData.bodyText,
        footer: tmplData.footerText,
        buttons: tmplData.buttons,
      }
      setTemplates(ts => [fallback, ...ts])
    }
  }

  if (editing !== null) {
    return (
      <TemplateEditor
        template={editing === 'new' ? undefined : editing}
        onBack={() => setEditing(null)}
        onSubmit={handleCreateTemplate}
      />
    )
  }

  const filtered = templates.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'ALL' || t.category === catFilter
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[#111] border border-white/10 px-3 py-2 flex-1 min-w-48" style={{ borderRadius: 2 }}>
          <SearchIcon size={12} strokeWidth={1.5} className="text-[#6B6B6B] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#F0EDE8] placeholder-[#3A3A3A] focus:outline-none flex-1"
            placeholder="Search templates..." />
        </div>

        <div className="flex gap-1">
          {['ALL', 'MARKETING', 'UTILITY', 'AUTHENTICATION'].map(f => (
            <button key={f} onClick={() => setCatFilter(f)}
              className="px-2.5 py-1.5 font-mono text-[9px] border transition-colors"
              style={{ borderRadius: 2, borderColor: catFilter === f ? '#C8953A' : 'rgba(255,255,255,0.08)', color: catFilter === f ? '#C8953A' : '#6B6B6B', background: catFilter === f ? 'rgba(200,149,58,0.08)' : 'transparent' }}>
              {f === 'ALL' ? 'All' : CAT_COLORS[f as TemplateCategory]?.label || f}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-2.5 py-1.5 font-mono text-[9px] border transition-colors"
              style={{ borderRadius: 2, borderColor: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', color: statusFilter === s ? '#F0EDE8' : '#6B6B6B' }}>
              {s === 'ALL' ? 'All Status' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button onClick={() => setEditing('new')}
          className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center gap-1.5 flex-shrink-0"
          style={{ borderRadius: 2 }}>
          + New Template
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Templates', value: templates.length },
          { label: 'Approved', value: templates.filter(t => t.status === 'APPROVED').length },
          { label: 'Pending Review', value: templates.filter(t => t.status === 'PENDING').length },
          { label: 'Total Uses (30d)', value: templates.reduce((s, t) => s + t.usageCount, 0).toLocaleString() },
        ].map(s => (
          <div key={s.label} className="border border-white/8 p-3" style={{ borderRadius: 2 }}>
            <div className="font-display text-xl text-[#C8953A]">{s.value}</div>
            <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Template table */}
      <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
        <div className="grid grid-cols-[2fr_auto_auto_auto_auto_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
          <span>TEMPLATE</span>
          <span>CATEGORY</span>
          <span>LANGUAGE</span>
          <span>STATUS</span>
          <span>USES</span>
          <span>ACTIONS</span>
        </div>
        {filtered.map(t => {
          const cat = CAT_COLORS[t.category]
          const status = STATUS_META[t.status]
          return (
            <div key={t.id} className="grid grid-cols-[2fr_auto_auto_auto_auto_auto] px-4 py-3.5 border-b border-white/5 last:border-0 items-center gap-4 hover:bg-white/2 transition-colors">
              <div>
                <div className="font-mono text-xs text-[#F0EDE8]">{t.name}</div>
                <div className="text-[10px] text-[#6B6B6B] mt-0.5 line-clamp-1">{t.body.slice(0, 60)}…</div>
                <div className="font-mono text-[9px] text-[#3A3A3A] mt-0.5">Last used: {t.lastUsed}</div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 flex-shrink-0"
                style={{ borderRadius: 2, background: cat.bg, color: cat.text }}>
                {cat.label}
              </span>
              <span className="font-mono text-[9px] text-[#6B6B6B] flex-shrink-0">{t.language}</span>
              <div className="flex items-center gap-1 flex-shrink-0" style={{ color: status.color }}>
                {status.icon}
                <span className="font-mono text-[9px]">{status.label}</span>
              </div>
              <span className="font-mono text-xs text-[#F0EDE8] flex-shrink-0">{t.usageCount.toLocaleString()}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setPreviewing(previewing?.id === t.id ? null : t)}
                  className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">
                  Preview
                </button>
                <button onClick={() => setEditing(t)}
                  className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#C8953A] transition-colors">
                  Edit
                </button>
                <button className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors flex items-center gap-0.5">
                  <SendIcon size={9} strokeWidth={2} /> Use
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline preview */}
      {previewing && (
        <div className="mt-4">
          <TemplatePreview template={previewing} vars={['Arjun', 'Saturday 11 AM', 'Sector 62']} />
        </div>
      )}
    </div>
  )
}
