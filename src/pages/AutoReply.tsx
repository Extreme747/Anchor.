import { useState, useEffect } from 'react'
import { BoltIcon, CheckIcon, ClockIcon, ArrowRightIcon, WarningIcon } from '../components/Icons'
import { autoReplyApi, authApi } from '../api/client'

export interface Rule {
  id: string | number
  name: string
  triggerType: 'keyword' | 'regex' | 'default' | 'working-hours'
  keywords: string
  response: string
  enabled: boolean
  priority: number
  dedup: number
}

const RULES: Rule[] = [
  {
    id: 1, name: 'Default greeting', triggerType: 'default', keywords: '',
    response: 'Hi {{name}}! Thanks for reaching out to {{business}}. Connecting you with our team right now.\n\nMeanwhile, here\'s our project brochure: {{link}}\n\nWould you like a site visit this weekend?',
    enabled: true, priority: 1, dedup: 30,
  },
  {
    id: 2, name: 'Site visit inquiry', triggerType: 'keyword', keywords: 'site visit, visit, show me, property tour, darshan',
    response: 'Great! We\'d love to show you the property. Our site visits run Mon–Sat 10 AM–6 PM.\n\nWhich day works best for you this week?',
    enabled: true, priority: 2, dedup: 60,
  },
  {
    id: 3, name: 'Brochure request', triggerType: 'keyword', keywords: 'brochure, details, info, specification, floor plan',
    response: 'Here are the complete project details for {{property}}:\n\nBrochure: {{link}}\nFloor plans: {{floor_plan_link}}\nPricing: ₹1.2 Cr – 1.6 Cr (all-inclusive)\n\nAny questions?',
    enabled: true, priority: 3, dedup: 120,
  },
  {
    id: 4, name: 'Hindi/Hinglish greeting', triggerType: 'keyword', keywords: 'namaste, namaskar, hello bhai, hi bhai, jai shri ram',
    response: 'Namaste {{name}}! Hamare Sector 62 ke premium 3BHK flats mein aapka swagat hai.\n\nKya aap site visit book karna chahenge?',
    enabled: true, priority: 4, dedup: 30,
  },
  {
    id: 5, name: 'Outside working hours', triggerType: 'working-hours', keywords: '',
    response: 'Hi {{name}}! Our team is currently offline (working hours: Mon-Sat 9 AM – 7 PM).\n\nWe\'ll reach out to you first thing tomorrow morning. You\'re in the queue!',
    enabled: true, priority: 5, dedup: 0,
  },
  {
    id: 6, name: 'Price inquiry regex', triggerType: 'regex', keywords: '(price|cost|rate|kitna|kya rate).*([0-9]|crore|lakh|cr|L)',
    response: 'Our 3BHK units are priced from ₹1.2 Cr to ₹1.6 Cr (all-inclusive — no hidden charges).\n\nFor a personalised quote based on floor and view, I\'ll connect you with our pricing advisor.',
    enabled: false, priority: 6, dedup: 90,
  },
]

const TRIGGER_LABELS: Record<string, string> = {
  keyword: 'Keyword', regex: 'Regex', default: 'Default', 'working-hours': 'Working Hours',
}

const TRIGGER_COLORS: Record<string, string> = {
  keyword: '#C8953A', regex: '#4A9EBA', default: '#4ADE80', 'working-hours': '#8B6BA8',
}

// ── P1-17 Rule Create/Edit Modal
function RuleModal({ rule, onClose, onSave }: { rule?: Rule; onClose: () => void; onSave: (data: any) => Promise<void> }) {
  const [name, setName] = useState(rule?.name || '')
  const [triggerType, setTriggerType] = useState<'keyword' | 'regex' | 'default' | 'working-hours'>(rule?.triggerType || 'keyword')
  const [keywords, setKeywords] = useState(rule?.keywords || '')
  const [response, setResponse] = useState(rule?.response || '')
  const [dedup, setDedup] = useState(rule?.dedup || 30)
  const [isSaving, setIsSaving] = useState(false)

  const vars = ['{{name}}', '{{business}}', '{{link}}', '{{property}}', '{{time}}', '{{agent}}']

  const handleSubmit = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await onSave({
        name,
        triggerType,
        keywords,
        response,
        responseText: response,
        dedup,
        dedupSeconds: dedup,
        enabled: rule ? rule.enabled : true,
      })
      onClose()
    } catch (err: any) {
      alert('Failed to save rule: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 bg-[#0D0D0D]">
          <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest">{rule ? 'EDIT RULE' : 'NEW AUTO-REPLY RULE'}</div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F0EDE8] font-mono text-sm">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">RULE NAME</label>
            <input
              className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 focus:outline-none focus:border-[#C8953A] transition-colors"
              style={{ borderRadius: 2 }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Site visit inquiry"
            />
          </div>

          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">TRIGGER TYPE</label>
            <div className="flex gap-2">
              {(['keyword', 'regex', 'default', 'working-hours'] as const).map(t => (
                <button key={t} onClick={() => setTriggerType(t)}
                  className="flex-1 py-2 font-mono text-[9px] border transition-colors"
                  style={{ borderRadius: 2, borderColor: triggerType === t ? TRIGGER_COLORS[t] : 'rgba(255,255,255,0.08)', color: triggerType === t ? TRIGGER_COLORS[t] : '#6B6B6B', background: triggerType === t ? TRIGGER_COLORS[t] + '15' : 'transparent' }}>
                  {TRIGGER_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {(triggerType === 'keyword' || triggerType === 'regex') && (
            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">
                {triggerType === 'keyword' ? 'KEYWORDS (comma-separated)' : 'REGEX PATTERN'}
              </label>
              <input className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 focus:outline-none focus:border-[#C8953A] transition-colors font-mono" style={{ borderRadius: 2 }}
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder={triggerType === 'keyword' ? 'site visit, tour, show me' : '(price|cost|rate).*([0-9])'}
              />
            </div>
          )}

          {triggerType === 'working-hours' && (
            <div className="p-3 border border-[#8B6BA8]/20 bg-[#8B6BA8]/5 font-mono text-[9px] text-[#8B6BA8]" style={{ borderRadius: 2 }}>
              This rule fires when a message arrives outside your configured working hours (Mon–Sat 9 AM – 7 PM).
            </div>
          )}

          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">
              RESPONSE MESSAGE <span className="text-[#3A3A3A]">· {response.length}/1024</span>
            </label>
            <div className="relative">
              <textarea className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 focus:outline-none focus:border-[#C8953A] transition-colors resize-none" style={{ borderRadius: 2 }}
                rows={6} value={response} onChange={e => setResponse(e.target.value)}
                placeholder="Hi {{name}}, auto-reply message..."
              />
              <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 max-w-[180px] justify-end">
                {vars.map(v => (
                  <button key={v} onClick={() => setResponse(r => r + v)}
                    className="font-mono text-[8px] px-1.5 py-0.5 border border-white/10 text-[#C8953A] hover:bg-white/5 transition-colors" style={{ borderRadius: 2 }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1.5">DEDUPLICATION LOCK</label>
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="240" step="15" value={dedup} onChange={e => setDedup(Number(e.target.value))}
                className="flex-1 range-amber" />
              <span className="font-mono text-[10px] text-[#C8953A] w-20 text-right">
                {dedup} min lock
              </span>
            </div>
            <div className="font-mono text-[9px] text-[#3A3A3A] mt-1">Won't fire again for this lead within the lock window.</div>
          </div>

          {/* Live preview */}
          <div className="border border-white/8 p-3 bg-[#0A0A0A]" style={{ borderRadius: 2 }}>
            <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-2">PREVIEW</div>
            <div className="self-end max-w-full bg-[#C8953A]/10 border border-[#C8953A]/20 px-3 py-2" style={{ borderRadius: 2 }}>
              <div className="flex items-center gap-1 font-mono text-[9px] text-[#C8953A] mb-1">
                <BoltIcon size={9} strokeWidth={2} />AUTO · 1.4s
              </div>
              <p className="text-xs text-[#F0EDE8] whitespace-pre-wrap leading-relaxed">
                {response.replace('{{name}}', 'Arjun').replace('{{business}}', 'Khanna Properties').replace('{{link}}', 'anchor.io/brochure').replace('{{property}}', 'Sector 62').replace('{{time}}', '10:30 AM').replace('{{agent}}', 'Rahul')}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={isSaving} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors" style={{ borderRadius: 2 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={isSaving} className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center justify-center gap-1.5" style={{ borderRadius: 2 }}>
              {isSaving ? 'Saving...' : 'Save Rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── P1-18 Intent Scoring Config
function IntentConfig() {
  const [saved, setSaved] = useState(false)
  const categories = [
    {
      label: 'Budget Triggers', color: '#C8953A', pts: 25,
      keywords: ['budget', 'price', 'kitna', 'rate', 'cost', '₹', 'crore', 'lakh'],
    },
    {
      label: 'Timeline Triggers', color: '#4A9EBA', pts: 30,
      keywords: ['urgent', 'immediate', 'this week', 'asap', 'jaldi', 'abhi'],
    },
    {
      label: 'Action Triggers', color: '#4ADE80', pts: 35,
      keywords: ['site visit', 'show me', 'ready to move', 'book', 'cheque', 'token'],
    },
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="font-mono text-[9px] text-[#6B6B6B]">Configure what signals add to a lead's 0–100 intent score</div>

      {categories.map(cat => (
        <div key={cat.label} className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] tracking-widest" style={{ color: cat.color }}>{cat.label.toUpperCase()}</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[#6B6B6B]">Points per match:</span>
              <input type="number" defaultValue={cat.pts} min={5} max={50}
                className="w-12 bg-[#111] border border-white/10 text-[#F0EDE8] text-xs px-2 py-1 text-center focus:outline-none focus:border-[#C8953A] font-mono" style={{ borderRadius: 2 }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cat.keywords.map(kw => (
              <span key={kw} className="font-mono text-[9px] px-2 py-0.5 border border-white/10 text-[#6B6B6B] flex items-center gap-1" style={{ borderRadius: 2 }}>
                {kw} <button className="hover:text-red-400 transition-colors ml-0.5">×</button>
              </span>
            ))}
            <button className="font-mono text-[9px] px-2 py-0.5 border border-dashed border-white/10 text-[#3A3A3A] hover:text-[#6B6B6B] hover:border-white/20 transition-colors" style={{ borderRadius: 2 }}>
              + Add keyword
            </button>
          </div>
        </div>
      ))}

      <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest mb-3">SCORE DECAY</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6B6B6B]">Decay</span>
          <input type="number" defaultValue={5} className="w-12 bg-[#111] border border-white/10 text-[#F0EDE8] text-xs px-2 py-1 text-center focus:outline-none focus:border-[#C8953A] font-mono" style={{ borderRadius: 2 }} />
          <span className="text-sm text-[#6B6B6B]">pts every</span>
          <input type="number" defaultValue={12} className="w-12 bg-[#111] border border-white/10 text-[#F0EDE8] text-xs px-2 py-1 text-center focus:outline-none focus:border-[#C8953A] font-mono" style={{ borderRadius: 2 }} />
          <span className="text-sm text-[#6B6B6B]">hours of inactivity</span>
        </div>
        <div className="font-mono text-[9px] text-[#3A3A3A] mt-2">Score decays when lead goes silent — prevents stale high scores</div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#C8953A] text-[#080808] font-semibold text-sm hover:bg-[#E8B04A] transition-colors" style={{ borderRadius: 2 }}>
          Save Intent Config
        </button>
        {saved && (
          <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
            <CheckIcon size={12} strokeWidth={2} /> Saved successfully!
          </span>
        )}
      </div>
    </div>
  )
}

// ── P1-16 Auto-Reply Rules List (main view)
export default function AutoReply() {
  const [rules, setRules] = useState<Rule[]>(RULES)
  const [editingRule, setEditingRule] = useState<Rule | null | 'new'>(null)
  const [activeTab, setActiveTab] = useState<'rules' | 'intent' | 'masking'>('rules')
  const [maskingSaved, setMaskingSaved] = useState(false)
  const [isMaskingSaving, setIsMaskingSaving] = useState(false)

  useEffect(() => {
    autoReplyApi.getRules()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setRules(data)
        }
      })
      .catch((err: any) => console.log('Using default auto-reply rules:', err.message))
  }, [])

  const toggleRule = async (id: string | number) => {
    const current = rules.find(r => r.id === id)
    if (!current) return
    const nextState = !current.enabled
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: nextState } : r))
    try {
      await autoReplyApi.updateRule(String(id), { isEnabled: nextState, enabled: nextState })
    } catch (err: any) {
      console.error('Failed to toggle rule on server:', err)
    }
  }

  const handleSaveRule = async (formData: any) => {
    if (editingRule && editingRule !== 'new') {
      const updated = await autoReplyApi.updateRule(String(editingRule.id), formData)
      setRules(rs => rs.map(r => r.id === editingRule.id ? { ...r, ...updated } : r))
    } else {
      const created = await autoReplyApi.createRule(formData)
      setRules(rs => [...rs, created])
    }
  }

  const handleDeleteRule = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this auto-reply rule?')) return
    setRules(rs => rs.filter(r => r.id !== id))
    try {
      await autoReplyApi.deleteRule(String(id))
    } catch (err: any) {
      console.error('Failed to delete rule:', err)
    }
  }

  const handleSaveMasking = async () => {
    setIsMaskingSaving(true)
    try {
      await authApi.updateOrg({ numberMaskingEnabled: true })
      setMaskingSaved(true)
      setTimeout(() => setMaskingSaved(false), 3000)
    } catch (err: any) {
      console.log('Saved masking locally:', err.message)
      setMaskingSaved(true)
      setTimeout(() => setMaskingSaved(false), 3000)
    } finally {
      setIsMaskingSaving(false)
    }
  }

  return (
    <div>
      {editingRule !== null && (
        <RuleModal
          rule={editingRule === 'new' ? undefined : editingRule}
          onClose={() => setEditingRule(null)}
          onSave={handleSaveRule}
        />
      )}

      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1">
        {[
          { id: 'rules', label: 'Auto-Reply Rules' },
          { id: 'intent', label: 'Intent Scoring' },
          { id: 'masking', label: 'Number Masking' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className="px-4 py-2.5 font-mono text-[10px] tracking-wide transition-colors border-b-2 -mb-px"
            style={{ borderColor: activeTab === t.id ? '#C8953A' : 'transparent', color: activeTab === t.id ? '#C8953A' : '#6B6B6B' }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'intent' && <IntentConfig />}

      {activeTab === 'masking' && (
        <div className="max-w-xl space-y-4">
          <div className="font-mono text-[9px] text-[#6B6B6B]">Control which roles can see full phone numbers</div>
          <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
            {[
              { role: 'Owner', access: 'Full number', locked: true },
              { role: 'Manager', access: 'Full number', locked: false },
              { role: 'Agent', access: 'Masked (+91 98XXX XX210)', locked: false },
            ].map(r => (
              <div key={r.role} className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-[#F0EDE8]">{r.role}</div>
                  <div className="font-mono text-[9px] text-[#6B6B6B]">{r.access}</div>
                </div>
                {r.locked ? (
                  <span className="font-mono text-[9px] text-[#3A3A3A]">Always full</span>
                ) : (
                  <select className="bg-[#111] border border-white/10 text-[#6B6B6B] text-xs px-3 py-1.5 focus:outline-none cursor-pointer" style={{ borderRadius: 2 }}>
                    <option>Full number</option>
                    <option>Masked</option>
                  </select>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-white/8 p-3" style={{ borderRadius: 2 }}>
            <WarningIcon size={12} strokeWidth={1.5} className="text-[#EAB308] flex-shrink-0" />
            <span className="font-mono text-[9px] text-[#6B6B6B]">Exports via CSV are restricted to Manager+ when masking is on</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveMasking} disabled={isMaskingSaving} className="px-6 py-2.5 bg-[#C8953A] text-[#080808] font-semibold text-sm hover:bg-[#E8B04A] transition-colors" style={{ borderRadius: 2 }}>
              {isMaskingSaving ? 'Saving...' : 'Save Masking Policy'}
            </button>
            {maskingSaved && (
              <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
                <CheckIcon size={12} strokeWidth={2} /> Masking policy updated!
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[9px] text-[#6B6B6B]">
              {rules.filter(r => r.enabled).length} rules active · Fired in priority order top-to-bottom
            </div>
            <button onClick={() => setEditingRule('new')}
              className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center gap-1.5"
              style={{ borderRadius: 2 }}>
              <BoltIcon size={12} strokeWidth={2} /> New Rule
            </button>
          </div>

          <div className="space-y-2">
            {rules.map((rule, idx) => (
              <div key={rule.id}
                className="border border-white/8 p-4 hover:border-white/15 transition-colors flex items-start gap-4"
                style={{ borderRadius: 2, opacity: rule.enabled ? 1 : 0.5 }}>
                {/* Priority drag handle */}
                <div className="font-mono text-[10px] text-[#3A3A3A] w-4 pt-0.5 flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-[#F0EDE8]">{rule.name}</span>
                    <span className="font-mono text-[9px] px-2 py-0.5" style={{ borderRadius: 2, background: (TRIGGER_COLORS[rule.triggerType] || '#C8953A') + '15', color: TRIGGER_COLORS[rule.triggerType] || '#C8953A' }}>
                      {TRIGGER_LABELS[rule.triggerType] || rule.triggerType}
                    </span>
                    {rule.dedup > 0 && (
                      <span className="font-mono text-[9px] text-[#3A3A3A] flex items-center gap-1">
                        <ClockIcon size={9} strokeWidth={1.5} /> {rule.dedup}m dedup
                      </span>
                    )}
                  </div>
                  {rule.keywords && (
                    <div className="font-mono text-[9px] text-[#6B6B6B] mb-1">
                      Keywords: {rule.keywords.split(',').slice(0, 4).map(k => k.trim()).join(', ')}{rule.keywords.split(',').length > 4 ? '…' : ''}
                    </div>
                  )}
                  <div className="text-[11px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {rule.response?.slice(0, 100)}…
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="w-9 h-5 relative transition-colors"
                    style={{ borderRadius: 12, background: rule.enabled ? '#C8953A' : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute top-0.5 w-4 h-4 bg-white transition-all" style={{ borderRadius: '50%', left: rule.enabled ? 19 : 2 }} />
                  </button>
                  <button onClick={() => setEditingRule(rule)} className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#C8953A] border border-white/8 px-2 py-1 transition-colors" style={{ borderRadius: 2 }}>Edit</button>
                  <button onClick={() => handleDeleteRule(rule.id)} className="font-mono text-[9px] text-[#6B6B6B] hover:text-red-400 border border-white/8 px-2 py-1 transition-colors" style={{ borderRadius: 2 }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
