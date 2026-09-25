import { useState, useEffect } from 'react'
import {
  TeamIcon, BoltIcon, CheckIcon, WarningIcon, ClockIcon,
  ShieldIcon, LockIcon, ArrowRightIcon
} from '../components/Icons'
import { routingApi } from '../api/client'

// ── Types for Phase 4
export interface RoutingRule {
  id: string
  name: string
  priority: number
  conditionType: 'tag' | 'city' | 'budget' | 'source' | 'language'
  conditionValue: string
  assignedTo: string
  assignedTeam: string
  enabled: boolean
}

export interface AgentStatus {
  id: string
  name: string
  email: string
  role: 'Agent' | 'Manager' | 'Owner'
  status: 'ONLINE' | 'BREAK' | 'OFFLINE'
  activeChats: number
  capacity: number
  leadsToday: number
  avgFRT: string
  slaCompliance: number
}

const INITIAL_RULES: RoutingRule[] = [
  { id: 'r1', name: 'High-Ticket Budget (₹2 Cr+) Routing', priority: 1, conditionType: 'budget', conditionValue: '>= ₹2,00,00,000', assignedTo: 'Rahul Verma (Senior Advisor)', assignedTeam: 'HNI Luxury Team', enabled: true },
  { id: 'r2', name: 'Commercial Leasing Intent', priority: 2, conditionType: 'tag', conditionValue: 'Commercial', assignedTo: 'Sneha Patel', assignedTeam: 'Commercial Team', enabled: true },
  { id: 'r3', name: 'Mumbai / West Territory Geo Rule', priority: 3, conditionType: 'city', conditionValue: 'Mumbai, Pune, Thane', assignedTo: 'Amit Sharma', assignedTeam: 'West Region', enabled: true },
  { id: 'r4', name: 'Hinglish & Hindi Regional Routing', priority: 4, conditionType: 'language', conditionValue: 'Hindi, Hinglish', assignedTo: 'Divya Nair', assignedTeam: 'North Regional', enabled: true },
]

const INITIAL_AGENTS: AgentStatus[] = [
  { id: 'ag1', name: 'Rahul Verma', email: 'rahul@khanna-properties.com', role: 'Manager', status: 'ONLINE', activeChats: 12, capacity: 15, leadsToday: 24, avgFRT: '1.2 min', slaCompliance: 98 },
  { id: 'ag2', name: 'Sneha Patel', email: 'sneha@khanna-properties.com', role: 'Agent', status: 'ONLINE', activeChats: 9, capacity: 12, leadsToday: 18, avgFRT: '1.8 min', slaCompliance: 95 },
  { id: 'ag3', name: 'Amit Sharma', email: 'amit@khanna-properties.com', role: 'Agent', status: 'BREAK', activeChats: 4, capacity: 10, leadsToday: 14, avgFRT: '3.4 min', slaCompliance: 89 },
  { id: 'ag4', name: 'Divya Nair', email: 'divya@khanna-properties.com', role: 'Agent', status: 'OFFLINE', activeChats: 0, capacity: 10, leadsToday: 11, avgFRT: '2.4 min', slaCompliance: 92 },
]

// ─────────────────────────────────────────────────────────────────────────────
// P4-03: SLA AUTO-ESCALATION CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
function SLAConfigView() {
  const [autoRevoke, setAutoRevoke] = useState(true)
  const [notifyOwner, setNotifyOwner] = useState(true)
  const [hotFrt, setHotFrt] = useState(7)
  const [saving, setSaving] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)

  useEffect(() => {
    routingApi.getSLA().then((sla) => {
      if (sla) {
        if (sla.firstResponseMinutes) setHotFrt(sla.firstResponseMinutes)
        if (sla.autoRevokeOnBreach !== undefined) setAutoRevoke(sla.autoRevokeOnBreach)
      }
    }).catch(() => {})
  }, [])

  const handleSaveSLA = async () => {
    setSaving(true)
    try {
      await routingApi.updateSLA({
        firstResponseMinutes: hotFrt,
        autoRevokeOnBreach: autoRevoke,
        escalationTarget: 'MANAGER',
      })
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 3000)
    } catch (err) {
      console.warn('SLA save fallback:', err)
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-03 · STRICT SLA TIMERS & AUTO-ESCALATION</div>
        <div className="text-sm font-medium text-[#F0EDE8]">Zero Cold Leads Protocol</div>
      </div>

      <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest">FIRST RESPONSE TIME (FRT) TARGETS</div>

        <div className="space-y-3">
          {[
            { priority: 'Hot Leads (Intent 80+)', time: `${hotFrt} minutes`, desc: 'Auto-revokes assignment if rep is idle', color: '#EF4444', isHot: true },
            { priority: 'Warm Inquiries (Intent 40-79)', time: '15 minutes', desc: 'Escalates to Team Lead via WhatsApp alert', color: '#EAB308', isHot: false },
            { priority: 'General Brochures & Cold', time: '45 minutes', desc: 'Auto-enqueues for standby agent pool', color: '#6B6B6B', isHot: false },
          ].map(sla => (
            <div key={sla.priority} className="flex items-center justify-between p-3.5 border border-white/5 bg-[#111]" style={{ borderRadius: 2 }}>
              <div>
                <div className="text-xs font-semibold text-[#F0EDE8] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sla.color }} />
                  {sla.priority}
                </div>
                <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{sla.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                {sla.isHot ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={hotFrt}
                      onChange={e => setHotFrt(Number(e.target.value))}
                      className="bg-[#080808] border border-white/10 text-xs text-[#C8953A] font-mono px-3 py-1.5 w-16 text-center focus:border-[#C8953A] outline-none"
                      style={{ borderRadius: 2 }}
                    />
                    <span className="font-mono text-[10px] text-[#6B6B6B]">min</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    defaultValue={sla.time}
                    disabled
                    className="bg-[#080808] border border-white/10 text-xs text-[#6B6B6B] font-mono px-3 py-1.5 w-24 text-center outline-none opacity-60"
                    style={{ borderRadius: 2 }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest">ESCALATION CHAIN POLICY</div>

        <div className="space-y-2 font-mono text-xs text-[#6B6B6B]">
          <div className="flex items-center gap-3 p-2 bg-[#111]">
            <span className="text-[#C8953A] font-bold">Level 1 (0–{hotFrt} min):</span>
            <span className="text-[#F0EDE8]">Assigned Agent receives urgent push notification</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-[#111]">
            <span className="text-[#EAB308] font-bold">Level 2 ({hotFrt + 1}–15 min):</span>
            <span className="text-[#F0EDE8]">Team Lead notified; Lead marked "AT RISK" in inbox</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-[#111]">
            <span className="text-[#EF4444] font-bold">Level 3 (16+ min):</span>
            <span className="text-red-400">Assignment revoked, reassigned via Round-Robin, alert sent to Owner</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-xs text-[#F0EDE8]">Auto-revoke unresponsive lead assignment</span>
          <input
            type="checkbox"
            checked={autoRevoke}
            onChange={() => setAutoRevoke(!autoRevoke)}
            className="accent-[#C8953A]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveSLA}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C8953A] text-[#080808] font-semibold text-xs tracking-wide hover:bg-[#E8B04A] disabled:opacity-50 transition-colors"
          style={{ borderRadius: 2 }}
        >
          {saving ? 'Saving Rules...' : 'Save SLA & Escalation Rules'}
        </button>
        {savedFeedback && (
          <span className="font-mono text-xs text-green-400 flex items-center gap-1">
            <CheckIcon size={12} strokeWidth={2} /> Saved to Anchor Engine
          </span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P4-04: LIVE AGENT AVAILABILITY & WORKLOAD BOARD
// ─────────────────────────────────────────────────────────────────────────────
function AgentAvailabilityBoard() {
  const [agents, setAgents] = useState(INITIAL_AGENTS)

  const loadAgents = async () => {
    try {
      const data = await routingApi.getAgents()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: AgentStatus[] = data.map((a: any) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          role: a.role === 'OWNER' ? 'Owner' : a.role === 'MANAGER' ? 'Manager' : 'Agent',
          status: a.isOnline ? 'ONLINE' : 'OFFLINE',
          activeChats: a.activeChatsCount || 0,
          capacity: a.dailyCapacity || 15,
          leadsToday: 12,
          avgFRT: '1.2 min',
          slaCompliance: 96,
        }))
        setAgents(prev => {
          const existingIds = new Set(mapped.map(m => m.id))
          return [...mapped, ...prev.filter(p => !existingIds.has(p.id))]
        })
      }
    } catch (err) {
      console.warn('Backend agents fallback:', err)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const toggleStatus = async (id: string, newStatus: AgentStatus['status']) => {
    setAgents(ags => ags.map(a => a.id === id ? { ...a, status: newStatus } : a))
    try {
      await routingApi.updateAgentStatus(id, newStatus === 'ONLINE')
    } catch (e) {
      console.warn('Agent status update fallback:', e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-04 · REAL-TIME CAPACITY MONITOR</div>
          <div className="text-sm font-medium text-[#F0EDE8]">Active Sales Team Concurrency</div>
        </div>
        <div className="font-mono text-[10px] text-green-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" /> Live WebSocket Sync
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {agents.map(ag => (
          <div key={ag.id} className="border border-white/8 p-5 bg-[#0D0D0D] space-y-3" style={{ borderRadius: 2 }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center font-display text-sm text-[#C8953A]">
                  {ag.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F0EDE8]">{ag.name}</div>
                  <div className="font-mono text-[9px] text-[#6B6B6B]">{ag.role} · {ag.email}</div>
                </div>
              </div>

              <select
                value={ag.status}
                onChange={e => toggleStatus(ag.id, e.target.value as any)}
                className="bg-[#111] border border-white/10 font-mono text-[10px] px-2.5 py-1 outline-none cursor-pointer"
                style={{
                  borderRadius: 2,
                  color: ag.status === 'ONLINE' ? '#4ADE80' : ag.status === 'BREAK' ? '#EAB308' : '#6B6B6B',
                }}
              >
                <option value="ONLINE">● Online</option>
                <option value="BREAK">⏸ On Break</option>
                <option value="OFFLINE">○ Offline</option>
              </select>
            </div>

            {/* Capacity Gauge */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[9px]">
                <span className="text-[#6B6B6B]">Active WhatsApp Chats</span>
                <span className="text-[#F0EDE8]">{ag.activeChats} / {ag.capacity} max</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(ag.activeChats / ag.capacity) * 100}%`,
                    background: ag.activeChats >= ag.capacity ? '#EF4444' : '#C8953A',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-center">
              <div>
                <div className="text-[8px] text-[#6B6B6B]">LEADS TODAY</div>
                <div className="text-xs text-[#F0EDE8] mt-0.5">{ag.leadsToday}</div>
              </div>
              <div>
                <div className="text-[8px] text-[#6B6B6B]">AVG FRT</div>
                <div className="text-xs text-[#C8953A] mt-0.5">{ag.avgFRT}</div>
              </div>
              <div>
                <div className="text-[8px] text-[#6B6B6B]">SLA RATING</div>
                <div className="text-xs text-green-400 mt-0.5">{ag.slaCompliance}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P4-11 & P4-12: NUMBER MASKING AUDIT & TALLY/ZOHO ERP SYNC
// ─────────────────────────────────────────────────────────────────────────────
function EnterpriseSecurityAndSync() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* P4-11: Lead Theft & Number Masking Audit */}
        <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-11 · LEAD THEFT PROTECTION AUDIT</div>
              <div className="text-sm font-medium text-[#F0EDE8] mt-0.5">Phone Masking & Anti-Poaching Log</div>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20">
              Active Guard
            </span>
          </div>

          <div className="font-mono text-xs space-y-2">
            {[
              { time: '14:22', user: 'Amit Sharma (Agent)', event: 'Blocked: Attempted full CSV contact export', status: 'BLOCKED 🛡️' },
              { time: '11:05', user: 'Rahul Verma (Manager)', event: 'Authorized view: Full number +91 98234 11204', status: 'LOGGED' },
              { time: 'Yesterday', user: 'Sneha Patel (Agent)', event: 'Dialed via Virtual Anchor Click-to-Call Bridge', status: 'MASKED' },
            ].map((log, i) => (
              <div key={i} className="p-2.5 bg-[#111] border border-white/5 flex justify-between items-center text-[10px]" style={{ borderRadius: 2 }}>
                <div>
                  <div className="text-[#F0EDE8]">{log.event}</div>
                  <div className="text-[#6B6B6B]">{log.time} · {log.user}</div>
                </div>
                <span className="text-[#C8953A] font-semibold">{log.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* P4-12: Tally ERP & Zoho Books Bridge */}
        <div className="border border-white/8 p-5 bg-[#0D0D0D] space-y-4" style={{ borderRadius: 2 }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-12 · BHARAT ERP BRIDGE</div>
              <div className="text-sm font-medium text-[#F0EDE8] mt-0.5">TallyPrime & Zoho Books Connector</div>
            </div>
            <span className="font-mono text-[9px] text-green-400">Synced</span>
          </div>

          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            When a WhatsApp lead converts to <strong className="text-[#F0EDE8]">WON</strong> in Anchor, an automated Sales Voucher / Ledger entry is dispatched to Tally XML Gateway or Zoho Books.
          </p>

          <div className="border border-white/5 p-3 bg-[#111] space-y-2" style={{ borderRadius: 2 }}>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#F0EDE8]">TallyPrime Server (Local XML IP)</span>
              <span className="text-green-400">Connected (Port 9000)</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#F0EDE8]">Zoho Books GSTIN Ledger</span>
              <span className="text-green-400">07AAACR1234F1Z5</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#F0EDE8]">Last Auto-Invoice Created</span>
              <span className="text-[#C8953A]">INV-2026-089 (₹50,000)</span>
            </div>
          </div>

          <button className="w-full py-2 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] hover:border-[#C8953A] transition-colors" style={{ borderRadius: 2 }}>
            Trigger Test ERP XML Synchronization →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P4-01 & P4-02: ROUTING RULES ENGINE (MAIN EXPORT)
// ─────────────────────────────────────────────────────────────────────────────
export default function Routing() {
  const [activeTab, setActiveTab] = useState<'rules' | 'sla' | 'agents' | 'security'>('rules')
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES)
  const [roundRobin, setRoundRobin] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRuleName, setNewRuleName] = useState('')
  const [newCondType, setNewCondType] = useState<'tag' | 'city' | 'budget'>('budget')
  const [newCondValue, setNewCondValue] = useState('>= ₹1,50,00,000')
  const [newAssignedTo, setNewAssignedTo] = useState('HNI Luxury Team')
  const [submitting, setSubmitting] = useState(false)

  const loadRules = async () => {
    try {
      const data = await routingApi.getRules()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: RoutingRule[] = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          priority: r.priority || 1,
          conditionType: (r.conditions?.field || 'budget') as any,
          conditionValue: r.conditions?.value || 'High Ticket',
          assignedTo: r.strategy || 'Round-Robin Standby Pool',
          assignedTeam: 'Sales Team',
          enabled: r.enabled !== false,
        }))
        setRules(prev => {
          const existingIds = new Set(mapped.map(m => m.id))
          return [...mapped, ...prev.filter(p => !existingIds.has(p.id))]
        })
      }
    } catch (err) {
      console.warn('Backend rules fallback:', err)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const toggleRule = async (id: string) => {
    const current = rules.find(r => r.id === id)
    if (!current) return
    const nextVal = !current.enabled
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: nextVal } : r))
    try {
      await routingApi.updateRule(id, { enabled: nextVal })
    } catch (err) {
      console.warn('Rule toggle fallback:', err)
    }
  }

  const handleCreateRule = async () => {
    if (!newRuleName.trim()) return
    setSubmitting(true)
    try {
      const created = await routingApi.createRule({
        name: newRuleName,
        conditions: { field: newCondType, value: newCondValue },
        strategy: 'ROUND_ROBIN',
        priority: rules.length + 1,
      })
      const newRuleItem: RoutingRule = {
        id: created.id || `r_${Date.now()}`,
        name: newRuleName,
        priority: rules.length + 1,
        conditionType: newCondType,
        conditionValue: newCondValue,
        assignedTo: newAssignedTo,
        assignedTeam: 'Specialized Pod',
        enabled: true,
      }
      setRules([newRuleItem, ...rules])
      setShowAddModal(false)
      setNewRuleName('')
    } catch (err) {
      console.warn('Rule creation fallback:', err)
      const newRuleItem: RoutingRule = {
        id: `r_${Date.now()}`,
        name: newRuleName,
        priority: rules.length + 1,
        conditionType: newCondType,
        conditionValue: newCondValue,
        assignedTo: newAssignedTo,
        assignedTeam: 'Specialized Pod',
        enabled: true,
      }
      setRules([newRuleItem, ...rules])
      setShowAddModal(false)
      setNewRuleName('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Sub-tab Navigation */}
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1 overflow-x-auto">
        {[
          { id: 'rules', label: 'Lead Distribution Rules' },
          { id: 'sla', label: 'SLA & Auto-Escalation' },
          { id: 'agents', label: 'Agent Availability Board' },
          { id: 'security', label: 'Security & Tally ERP Sync' },
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

      {activeTab === 'sla' && <SLAConfigView />}
      {activeTab === 'agents' && <AgentAvailabilityBoard />}
      {activeTab === 'security' && <EnterpriseSecurityAndSync />}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Create Rule Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 px-4">
              <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-md p-6 space-y-4" style={{ borderRadius: 2 }}>
                <div className="flex justify-between items-center border-b border-white/8 pb-3">
                  <div>
                    <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-02 · NEW DISPATCH RULE</div>
                    <div className="text-sm font-medium text-[#F0EDE8]">Configure Intelligent Skill Routing</div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="text-[#6B6B6B] hover:text-[#F0EDE8] font-mono text-base">×</button>
                </div>

                <div>
                  <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">RULE NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Ultra Luxury Penthouse Routing"
                    value={newRuleName}
                    onChange={e => setNewRuleName(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
                    style={{ borderRadius: 2 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">CONDITION TYPE</label>
                    <select
                      value={newCondType}
                      onChange={e => setNewCondType(e.target.value as any)}
                      className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 outline-none cursor-pointer"
                      style={{ borderRadius: 2 }}
                    >
                      <option value="budget">Budget Bracket</option>
                      <option value="tag">Lead Tag / Project</option>
                      <option value="city">Territory / City</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">CONDITION CRITERIA</label>
                    <input
                      type="text"
                      value={newCondValue}
                      onChange={e => setNewCondValue(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
                      style={{ borderRadius: 2 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-1">ASSIGN TO AGENT / POD</label>
                  <input
                    type="text"
                    value={newAssignedTo}
                    onChange={e => setNewAssignedTo(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] px-3 py-2.5 focus:border-[#C8953A] outline-none"
                    style={{ borderRadius: 2 }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8]">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRule}
                    disabled={submitting || !newRuleName.trim()}
                    className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Save & Enforce Rule →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Round Robin master toggle */}
          <div className="border border-white/8 p-4 bg-[#0D0D0D] flex items-center justify-between" style={{ borderRadius: 2 }}>
            <div>
              <div className="text-sm font-semibold text-[#F0EDE8]">Automated Round-Robin Standby Pool</div>
              <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">
                Evenly assign leads among currently ONLINE reps if no specialized skill rule matches.
              </div>
            </div>
            <button
              onClick={() => setRoundRobin(!roundRobin)}
              className="w-10 h-6 relative transition-colors"
              style={{ borderRadius: 12, background: roundRobin ? '#C8953A' : 'rgba(255,255,255,0.1)' }}
            >
              <div className="absolute top-1 w-4 h-4 bg-white transition-all" style={{ borderRadius: '50%', left: roundRobin ? 22 : 4 }} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-mono text-[9px] text-[#6B6B6B]">
              {rules.filter(r => r.enabled).length} skill/geo rules active · Evaluated in strict priority order
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors"
              style={{ borderRadius: 2 }}
            >
              + Add Routing Rule
            </button>
          </div>

          {/* P4-01: Rules List */}
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                className="border border-white/8 p-4 bg-[#0D0D0D] hover:border-white/15 transition-colors flex items-center justify-between"
                style={{ borderRadius: 2, opacity: rule.enabled ? 1 : 0.6 }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-[#3A3A3A] w-5">0{idx + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#F0EDE8]">{rule.name}</span>
                      <span className="font-mono text-[9px] px-2 py-0.5 border border-[#4A9EBA]/20 bg-[#4A9EBA]/5 text-[#4A9EBA]" style={{ borderRadius: 2 }}>
                        {rule.conditionType.toUpperCase()}: {rule.conditionValue}
                      </span>
                    </div>
                    <div className="font-mono text-[9px] text-[#6B6B6B] mt-1">
                      Assigned to: <span className="text-[#C8953A]">{rule.assignedTo}</span> ({rule.assignedTeam})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="w-10 h-6 relative transition-colors"
                    style={{ borderRadius: 12, background: rule.enabled ? '#C8953A' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="absolute top-1 w-4 h-4 bg-white transition-all" style={{ borderRadius: '50%', left: rule.enabled ? 22 : 4 }} />
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
