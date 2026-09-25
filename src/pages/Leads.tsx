import { useState, useEffect } from 'react'
import {
  SearchIcon, TagIcon, TransferIcon, FlowIcon,
  ArrowRightIcon, CheckIcon, WarningIcon, ClockIcon,
} from '../components/Icons'
import { leadsApi } from '../api/client'

interface Lead {
  id: number | string; name: string; phone: string; email: string
  company: string; city: string; source: string; status: string
  score: number; tag: string; value: string; agent: string
  created: string; lastContact: string; notes: string
}

const LEADS: Lead[] = [
  { id: 1, name: 'Arjun Sharma', phone: '+91 98XXX XX210', email: 'arjun@example.com', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 91, tag: 'Hot', value: '₹1.4 Cr', agent: 'Rahul Verma', created: '18 Oct 2026', lastContact: '1h ago', notes: 'Interested in 3BHK, prefers east-facing. Budget confirmed.' },
  { id: 2, name: 'Priya Mehta', phone: '+91 87XXX XX345', email: 'priya@mehta.co', company: 'Mehta & Associates', city: 'Delhi', source: 'Organic', status: 'CONTACTED', score: 72, tag: 'Qualified', value: '₹1.2 Cr', agent: 'Sneha Patel', created: '17 Oct 2026', lastContact: '8h ago', notes: 'Commercial investment, wants rental yield info.' },
  { id: 3, name: 'Rohit Gupta', phone: '+91 76XXX XX901', email: '', company: '', city: 'Noida', source: '99acres', status: 'NEW', score: 45, tag: 'Warm', value: '₹80L', agent: 'Amit Sharma', created: '19 Oct 2026', lastContact: '15m ago', notes: '' },
  { id: 4, name: 'Sunita Bose', phone: '+91 98XXX XX034', email: 'sunita.bose@gmail.com', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 88, tag: 'Hot', value: '₹95L', agent: 'Rahul Verma', created: '18 Oct 2026', lastContact: '1h ago', notes: 'Urgent, needs carpet area clarity. CTWA lead.' },
  { id: 5, name: 'Vikram Joshi', phone: '+91 91XXX XX567', email: 'vjoshi@corp.in', company: 'Joshi Corp', city: 'Ghaziabad', source: 'MagicBricks', status: 'NEW', score: 38, tag: 'Cold', value: '₹60L', agent: 'Divya Nair', created: '20 Oct 2026', lastContact: '2h ago', notes: '' },
  { id: 6, name: 'Kavita Reddy', phone: '+91 88XXX XX221', email: 'kavita@reddy.family', company: '', city: 'Gurugram', source: 'Meta Ad', status: 'QUALIFIED', score: 95, tag: 'Hot', value: '₹3.2 Cr', agent: 'Rahul Verma', created: '19 Oct 2026', lastContact: '30m ago', notes: 'Penthouse only. Has existing property to sell. Serious buyer.' },
  { id: 7, name: 'Rajesh Nair', phone: '+91 77XXX XX889', email: '', company: '', city: 'Bengaluru', source: 'Housing.com', status: 'CONTACTED', score: 68, tag: 'Warm', value: '₹1.1 Cr', agent: 'Sneha Patel', created: '16 Oct 2026', lastContact: '5h ago', notes: 'Relocation from Bangalore. Timeline: 3 months.' },
  { id: 8, name: 'Neha Khanna', phone: '+91 99XXX XX112', email: 'neha@khanna.in', company: '', city: 'Pune', source: 'JustDial', status: 'NEW', score: 29, tag: 'Cold', value: '₹55L', agent: 'Karan Mehra', created: '20 Oct 2026', lastContact: '1d ago', notes: '' },
]

const TAG_COLORS: Record<string, string> = {
  Hot: '#C8953A', Qualified: '#4A9EBA', Warm: '#8B6BA8', Cold: '#4A4A4A',
}
const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  NEW: { text: '#C8953A', bg: 'rgba(200,149,58,0.12)' },
  CONTACTED: { text: '#4A9EBA', bg: 'rgba(74,158,186,0.1)' },
  QUALIFIED: { text: '#4ADE80', bg: 'rgba(74,222,128,0.08)' },
  WON: { text: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  LOST: { text: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
}

// ── P1-13 CSV Import Wizard
function CSVImport({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-lg" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest">IMPORT LEADS FROM CSV</div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F0EDE8] font-mono text-sm">×</button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-white/8">
          {['Upload', 'Map Columns', 'Preview', 'Import'].map((s, i) => (
            <div key={s} className="flex-1 py-2.5 text-center font-mono text-[9px] transition-colors"
              style={{ color: step === i + 1 ? '#C8953A' : step > i + 1 ? '#6B6B6B' : '#3A3A3A', borderBottom: step === i + 1 ? '2px solid #C8953A' : '2px solid transparent' }}>
              {step > i + 1 ? <CheckIcon size={10} strokeWidth={2.5} className="inline" /> : (i + 1) + '.'} {s}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); setStep(2) }}
              className="border-2 border-dashed p-12 text-center cursor-pointer hover:border-[#C8953A]/40 transition-colors"
              style={{ borderRadius: 2, borderColor: isDragging ? '#C8953A' : 'rgba(255,255,255,0.1)' }}
              onClick={() => setStep(2)}
            >
              <div className="font-mono text-[10px] text-[#6B6B6B]">Drop your CSV here or click to browse</div>
              <div className="font-mono text-[9px] text-[#3A3A3A] mt-1">Max 10,000 rows · columns: Name, Phone, Email, City, Source</div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-[#6B6B6B] mb-4">Map your CSV columns to Anchor fields</div>
              {[
                { csv: 'Full Name', anchor: 'Name' },
                { csv: 'Mobile', anchor: 'Phone' },
                { csv: 'Email ID', anchor: 'Email' },
                { csv: 'Location', anchor: 'City' },
                { csv: 'Campaign', anchor: 'Source' },
              ].map(m => (
                <div key={m.csv} className="flex items-center gap-3">
                  <div className="flex-1 bg-[#111] border border-white/10 px-3 py-2 font-mono text-xs text-[#6B6B6B]" style={{ borderRadius: 2 }}>{m.csv}</div>
                  <ArrowRightIcon size={12} strokeWidth={1.5} className="text-[#3A3A3A] flex-shrink-0" />
                  <select className="flex-1 bg-[#111] border border-white/10 text-[#F0EDE8] text-xs px-3 py-2 focus:outline-none cursor-pointer" style={{ borderRadius: 2 }} defaultValue={m.anchor}>
                    <option>Name</option><option>Phone</option><option>Email</option><option>City</option><option>Source</option><option>Skip</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="font-mono text-[10px] text-[#6B6B6B] mb-3">Preview — first 3 rows</div>
              <div className="border border-white/8 overflow-hidden text-xs" style={{ borderRadius: 2 }}>
                <div className="grid grid-cols-4 px-3 py-2 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] gap-3">
                  <span>NAME</span><span>PHONE</span><span>CITY</span><span>SOURCE</span>
                </div>
                {[
                  ['Arjun Sharma', '+91 9876543210', 'Gurugram', 'Instagram'],
                  ['Priya Mehta', '+91 8765432109', 'Delhi', 'Facebook'],
                  ['Rohit Gupta', '+91 7654321098', 'Noida', '99acres'],
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 px-3 py-2 border-b border-white/5 last:border-0 text-[#F0EDE8] gap-3">
                    {row.map((cell, j) => <span key={j} className="truncate">{cell}</span>)}
                  </div>
                ))}
              </div>
              <div className="font-mono text-[9px] text-[#6B6B6B] mt-2">247 rows total · 3 duplicates will be skipped</div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-12 h-12 border border-[#C8953A]/30 bg-[#C8953A]/5 flex items-center justify-center mx-auto mb-4 text-[#C8953A]" style={{ borderRadius: 2 }}>
                <CheckIcon size={20} strokeWidth={2} />
              </div>
              <div className="font-display text-xl text-[#F0EDE8] mb-1">244 leads imported</div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">3 duplicates skipped · Auto-enroll in sequence?</div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors" style={{ borderRadius: 2 }}>
                Back
              </button>
            )}
            <button
              onClick={() => step < 4 ? setStep(s => s + 1) : onClose()}
              className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}>
              {step === 3 ? 'Import Now' : step === 4 ? 'Done' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── P1-11 Lead Create/Edit Modal
function LeadModal({ lead, onClose, onSave }: { lead?: Lead; onClose: () => void; onSave?: () => void }) {
  const [name, setName] = useState(lead?.name || '')
  const [phone, setPhone] = useState(lead?.phone || '')
  const [email, setEmail] = useState(lead?.email || '')
  const [city, setCity] = useState(lead?.city || 'Gurugram')
  const [source, setSource] = useState(lead?.source || 'Organic WhatsApp')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !phone) return
    setSubmitting(true)
    try {
      if (lead && typeof lead.id === 'string') {
        await leadsApi.updateLead(lead.id, { name, phone, email, city, source })
      } else {
        await leadsApi.createLead({ name, phone, email, city, source, estimatedValueINR: 5000000 })
      }
      if (onSave) onSave()
      onClose()
    } catch (err) {
      console.warn('Save lead fallback:', err)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-md" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest">{lead ? 'EDIT LEAD' : 'NEW LEAD'}</div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#F0EDE8] font-mono text-sm">×</button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">NAME *</label>
              <input
                className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-3 py-2 focus:outline-none focus:border-[#C8953A] transition-colors"
                style={{ borderRadius: 2 }}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">PHONE *</label>
              <input
                className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-3 py-2 focus:outline-none focus:border-[#C8953A] transition-colors"
                style={{ borderRadius: 2 }}
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">EMAIL</label>
            <input
              className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-3 py-2 focus:outline-none focus:border-[#C8953A] transition-colors"
              style={{ borderRadius: 2 }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">CITY</label>
              <input
                className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-3 py-2 focus:outline-none focus:border-[#C8953A] transition-colors"
                style={{ borderRadius: 2 }}
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono text-[9px] text-[#6B6B6B] block mb-1">SOURCE</label>
              <select
                className="w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-3 py-2 focus:outline-none cursor-pointer"
                style={{ borderRadius: 2 }}
                value={source}
                onChange={e => setSource(e.target.value)}
              >
                {['Meta CTWA Ad', 'Organic WhatsApp', '99acres', 'MagicBricks', 'Housing.com', 'Manual', 'Referral'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors" style={{ borderRadius: 2 }}>Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !phone}
              className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors disabled:opacity-50"
              style={{ borderRadius: 2 }}
            >
              {submitting ? 'Saving...' : lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── P1-15 Bulk Actions Bar
function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/15 px-4 py-3 flex items-center gap-4 shadow-2xl z-40" style={{ borderRadius: 2 }}>
      <span className="font-mono text-sm text-[#F0EDE8]">{count} leads selected</span>
      <div className="w-px h-4 bg-white/10" />
      {[
        { label: 'Assign Agent', Icon: TransferIcon },
        { label: 'Enroll in Sequence', Icon: FlowIcon },
        { label: 'Add Tag', Icon: TagIcon },
      ].map(a => (
        <button key={a.label} className="font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] flex items-center gap-1.5 transition-colors">
          <a.Icon size={12} strokeWidth={1.5} /> {a.label}
        </button>
      ))}
      <div className="w-px h-4 bg-white/10" />
      <button onClick={onClear} className="font-mono text-[10px] text-[#6B6B6B] hover:text-red-400 transition-colors">× Clear</button>
    </div>
  )
}

// ── Main Leads page
export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState<(number | string)[]>([])
  const [showImport, setShowImport] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null | 'new'>(null)
  const [sort, setSort] = useState<'score' | 'created' | 'value'>('score')
  const [leadsList, setLeadsList] = useState<Lead[]>(LEADS)

  const loadLeads = async () => {
    try {
      const data = await leadsApi.getLeads()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Lead[] = data.map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email || '',
          company: '',
          city: l.city || 'Gurugram',
          source: l.source || (l.isCtwa ? 'Meta CTWA Ad' : 'Organic WhatsApp'),
          status: l.status,
          score: l.intentScore,
          tag: l.intentScore >= 80 ? 'Hot' : l.intentScore >= 50 ? 'Qualified' : 'Warm',
          value: l.estimatedValueINR > 0 ? `₹${(l.estimatedValueINR / 100000).toFixed(0)}L` : '₹50L',
          agent: l.assignedAgent?.name || 'Unassigned',
          created: new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          lastContact: 'Active',
          notes: l.tags?.join(', ') || '',
        }))
        setLeadsList(prev => {
          const existingIds = new Set(mapped.map(m => String(m.id)))
          return [...mapped, ...prev.filter(p => !existingIds.has(String(p.id)))]
        })
      }
    } catch (err) {
      console.warn('Backend leads fallback:', err)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const filtered = leadsList
    .filter(l => {
      const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search) || l.city.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || l.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sort === 'score') return b.score - a.score
      return 0
    })

  const toggleSelect = (id: number | string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  return (
    <div>
      {showImport && <CSVImport onClose={() => setShowImport(false)} />}
      {editingLead !== null && <LeadModal lead={editingLead === 'new' ? undefined : editingLead} onClose={() => setEditingLead(null)} onSave={loadLeads} />}
      {selected.length > 0 && <BulkBar count={selected.length} onClear={() => setSelected([])} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-[#111] border border-white/10 px-3 py-2 flex-1 min-w-48" style={{ borderRadius: 2 }}>
          <SearchIcon size={12} strokeWidth={1.5} className="text-[#6B6B6B] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#F0EDE8] placeholder-[#3A3A3A] focus:outline-none flex-1"
            placeholder="Search by name, phone, city..." />
        </div>

        <div className="flex gap-1">
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-2.5 py-1.5 font-mono text-[9px] border transition-colors"
              style={{ borderRadius: 2, borderColor: statusFilter === s ? '#C8953A' : 'rgba(255,255,255,0.08)', color: statusFilter === s ? '#C8953A' : '#6B6B6B', background: statusFilter === s ? 'rgba(200,149,58,0.08)' : 'transparent' }}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="bg-[#111] border border-white/10 text-[#6B6B6B] text-xs px-3 py-2 focus:outline-none cursor-pointer" style={{ borderRadius: 2 }}>
          <option value="score">Sort: Intent Score</option>
          <option value="created">Sort: Newest</option>
          <option value="value">Sort: Value</option>
        </select>

        <button onClick={() => setShowImport(true)}
          className="px-3 py-2 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] hover:border-white/20 transition-colors"
          style={{ borderRadius: 2 }}>
          Import CSV
        </button>
        <button onClick={() => setEditingLead('new')}
          className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors"
          style={{ borderRadius: 2 }}>
          + New Lead
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Leads', value: LEADS.length },
          { label: 'New', value: LEADS.filter(l => l.status === 'NEW').length },
          { label: 'Qualified', value: LEADS.filter(l => l.status === 'QUALIFIED').length },
          { label: 'High Intent (80+)', value: LEADS.filter(l => l.score >= 80).length },
          { label: 'Pipeline Value', value: '₹8.6 Cr' },
        ].map(k => (
          <div key={k.label} className="border border-white/8 p-3" style={{ borderRadius: 2 }}>
            <div className="font-display text-xl text-[#C8953A]">{k.value}</div>
            <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Leads table */}
      <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
        <div className="grid grid-cols-[24px_1fr_auto_auto_auto_auto_auto_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-3 items-center">
          <input type="checkbox" className="accent-[#C8953A]"
            checked={selected.length === filtered.length && filtered.length > 0}
            onChange={e => setSelected(e.target.checked ? filtered.map(l => l.id) : [])} />
          <span>LEAD</span>
          <span>SCORE</span>
          <span>STATUS</span>
          <span>VALUE</span>
          <span>AGENT</span>
          <span>LAST CONTACT</span>
          <span>ACTIONS</span>
        </div>
        {filtered.map(lead => {
          const statusStyle = STATUS_COLORS[lead.status] || { text: '#6B6B6B', bg: 'rgba(255,255,255,0.05)' }
          return (
            <div key={lead.id}
              className="grid grid-cols-[24px_1fr_auto_auto_auto_auto_auto_auto] px-4 py-3.5 border-b border-white/5 last:border-0 items-center gap-3 hover:bg-white/2 transition-colors"
              style={{ background: selected.includes(lead.id) ? 'rgba(200,149,58,0.04)' : undefined }}>
              <input type="checkbox" className="accent-[#C8953A]"
                checked={selected.includes(lead.id)}
                onChange={() => toggleSelect(lead.id)} />
              <div>
                <div className="text-sm text-[#F0EDE8]">{lead.name}</div>
                <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{lead.phone} · {lead.city} · {lead.source}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="relative w-10 h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: lead.score >= 80 ? '#C8953A' : lead.score >= 50 ? '#E8B04A' : '#4A4A4A' }} />
                </div>
                <span className="font-mono text-[10px]" style={{ color: lead.score >= 80 ? '#C8953A' : '#6B6B6B' }}>{lead.score}</span>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5" style={{ borderRadius: 2, background: statusStyle.bg, color: statusStyle.text }}>
                {lead.status}
              </span>
              <span className="font-mono text-xs text-[#F0EDE8]">{lead.value}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center font-mono text-[8px] text-[#C8953A]">{lead.agent[0]}</div>
                <span className="font-mono text-[9px] text-[#6B6B6B]">{lead.agent.split(' ')[0]}</span>
              </div>
              <span className="font-mono text-[9px] text-[#6B6B6B]">{lead.lastContact}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingLead(lead)} className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#C8953A] transition-colors">Edit</button>
                <button className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">Chat</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
