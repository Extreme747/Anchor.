import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WarningIcon, ArrowRightIcon, CheckIcon, AnalyticsIcon, TeamIcon } from '../components/Icons'
import { analyticsApi, messagesApi } from '../api/client'
import { cn } from '@/lib/utils'
import { InteractiveLineChart } from '@/components/ui/chart'
import { BentoOverview } from '@/components/analytics/BentoOverview'
import { RevenueLeakage } from '@/components/analytics/RevenueLeakage'
import { AgentLeaderboard } from '@/components/analytics/AgentLeaderboard'

// ── Interactive SVG charts
function LineChart({ data, color = '#C8953A', height = 120, labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }: { data: number[]; color?: string; height?: number; labels?: string[] }) {
  const chartData = data.map((v, i) => ({
    label: labels[i] || `P${i + 1}`,
    value: v,
  }))
  return <InteractiveLineChart data={chartData} color={color} height={height} />
}

function BarChart({ data, labels, color = '#C8953A' }: { data: number[]; labels: string[]; color?: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full transition-all duration-700" style={{ height: `${(v / max) * 80}%`, background: color, borderRadius: 2, opacity: 0.8 }} />
          <span className="font-mono text-[8px] text-[#6B6B6B]">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function HeatmapRow({ label, data }: { label: string; data: number[] }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[8px] text-[#6B6B6B] w-8 flex-shrink-0 text-right">{label}</span>
      {data.map((v, i) => (
        <div key={i} className="w-5 h-5 flex-shrink-0" style={{ borderRadius: 2, background: `rgba(200,149,58,${(v / max) * 0.8})`, border: '1px solid rgba(255,255,255,0.04)' }} title={`${v} leads`} />
      ))}
    </div>
  )
}



// ── P4-08 Agent Performance Detail
function AgentDetail() {
  const [agent] = useState('Rahul Verma')
  const weekData = [82, 91, 78, 95, 88, 97, 84]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center font-display text-2xl text-[#C8953A]">
          {agent[0]}
        </div>
        <div>
          <div className="font-display text-2xl text-[#F0EDE8]">{agent}</div>
          <div className="font-mono text-[9px] text-[#6B6B6B]">Manager · Online · 12 active conversations</div>
        </div>
        <select className="ml-auto bg-[#111] border border-white/10 text-[#6B6B6B] text-xs px-3 py-2 focus:outline-none cursor-pointer" style={{ borderRadius: 2 }}>
          <option>Rahul Verma</option>
          <option>Sneha Patel</option>
          <option>Amit Sharma</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Avg FRT', value: '1.2 min' },
          { label: 'SLA Compliance', value: '98%' },
          { label: 'Leads Handled', value: '89' },
          { label: 'Revenue Attributed', value: '₹14.2 Cr' },
        ].map(k => (
          <div key={k.label} className="border border-white/8 p-3" style={{ borderRadius: 2 }}>
            <div className="font-display text-xl text-[#C8953A]">{k.value}</div>
            <div className="font-mono text-[9px] text-[#6B6B6B] mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">SLA COMPLIANCE — 7 DAYS</div>
          <LineChart data={weekData} color="#4ADE80" height={80} />
          <div className="flex justify-between font-mono text-[8px] text-[#3A3A3A] mt-1 px-1">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">RESOLUTION DONUT</div>
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#C8953A" strokeWidth="12"
                strokeDasharray={`${2*Math.PI*32*0.98} ${2*Math.PI*32*0.02}`}
                strokeDashoffset={2*Math.PI*32*0.25} strokeLinecap="round" />
              <text x="40" y="44" textAnchor="middle" fill="#F0EDE8" fontSize="13" fontFamily="DM Serif Display, serif">98%</text>
            </svg>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <div className="w-2 h-2 bg-[#C8953A]" style={{ borderRadius: 1 }} />
                <span className="text-[#6B6B6B]">On-time: <span className="text-[#F0EDE8]">87 leads</span></span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <div className="w-2 h-2 bg-red-500/40" style={{ borderRadius: 1 }} />
                <span className="text-[#6B6B6B]">SLA breach: <span className="text-[#F0EDE8]">2 leads</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── P4-10 Trend Analytics
function TrendAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">WEEKLY LEAD VOLUME</div>
          <BarChart data={[142, 168, 155, 189, 201, 178, 215]} labels={['W1','W2','W3','W4','W5','W6','W7']} />
        </div>
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">REVENUE TREND</div>
          <LineChart data={[28, 34, 29, 41, 38, 47, 52]} color="#C8953A" height={112} />
          <div className="flex justify-between font-mono text-[8px] text-[#3A3A3A] mt-1 px-1">
            {['W1','W2','W3','W4','W5','W6','W7'].map(w => <span key={w}>{w}</span>)}
          </div>
        </div>
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">CONVERSION FUNNEL</div>
          {[
            { label: 'Leads Received', value: 1203, pct: 100 },
            { label: 'Responded', value: 1132, pct: 94 },
            { label: 'Intent Score 50+', value: 412, pct: 34 },
            { label: 'Site Visit Booked', value: 189, pct: 16 },
            { label: 'Deals Closed', value: 47, pct: 4 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 mb-1.5">
              <div className="w-28 font-mono text-[9px] text-[#6B6B6B] flex-shrink-0">{s.label}</div>
              <div className="flex-1 h-5 bg-white/5 relative overflow-hidden" style={{ borderRadius: 2 }}>
                <div className="h-full transition-all" style={{ width: `${s.pct}%`, background: i === 4 ? '#C8953A' : 'rgba(200,149,58,0.25)' }} />
                <span className="absolute left-2 top-0 h-full flex items-center font-mono text-[9px] text-[#F0EDE8]">{s.value.toLocaleString()}</span>
              </div>
              <span className="font-mono text-[9px] text-[#6B6B6B] w-6">{s.pct}%</span>
            </div>
          ))}
        </div>
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">AGENT PERFORMANCE COMPARISON</div>
          <BarChart
            data={[89, 74, 67, 54, 42]}
            labels={['Rahul', 'Sneha', 'Amit', 'Divya', 'Karan']}
            color="#4A9EBA"
          />
        </div>
      </div>
    </div>
  )
}

// ── P4-09 Executive Daily Report (The 8:00 AM WhatsApp Morning Briefing)
function ExecutiveDailyReport() {
  const [simulated, setSimulated] = useState(false)
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    analyticsApi.getExecutiveReport().then((data) => {
      if (data) setReport(data)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-09 · EXECUTIVE DAILY DISPATCH (8:00 AM)</div>
          <div className="text-sm font-medium text-[#F0EDE8]">Morning Operational Briefing for Founders</div>
        </div>
        <button
          onClick={() => {
            setSimulated(true)
            setTimeout(() => setSimulated(false), 3000)
          }}
          className="px-3 py-1.5 bg-[#C8953A]/10 border border-[#C8953A]/30 text-[#C8953A] font-mono text-[9px] hover:bg-[#C8953A]/20 transition-colors"
          style={{ borderRadius: 2 }}
        >
          {simulated ? '✓ Sent to Founder WhatsApp' : 'Dispatch Test WhatsApp Push →'}
        </button>
      </div>

      {/* WhatsApp Message Bubble Simulation */}
      <div className="border border-[#128C7E]/30 bg-[#0b141a] p-5 space-y-4" style={{ borderRadius: 6 }}>
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-display text-sm text-white">
            ⚓
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e9edef]">Anchor Executive Intelligence Bot</div>
            <div className="font-mono text-[9px] text-[#8696a0]">WhatsApp Dispatch · Today, 08:00 AM IST</div>
          </div>
        </div>

        <div className="font-mono text-xs text-[#e9edef] space-y-3 leading-relaxed">
          <div className="text-[#C8953A] font-bold">
            ⚓ ANCHOR MORNING REVENUE REPORT — {(report?.organizationName || 'DLF PROPERTIES').toUpperCase()}
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-xs space-y-1">
            <div className="text-white font-semibold">📊 Pipeline Performance:</div>
            <div>• Inbound Leads: <strong className="text-white">{report?.leadsReceived || 84}</strong></div>
            <div>• Responded &lt; 2 mins: <strong className="text-green-400">{report?.respondedUnder2Min || 76} ({report?.respondedPct || '92.4%'})</strong></div>
            <div>• Leaked Leads (No reply 24h): <strong className="text-red-400">{report?.leakedLeadsCount || 4}</strong></div>
            <div>• Revenue At Risk: <strong className="text-red-400">{report?.revenueAtRiskINR || '₹18,50,000'}</strong></div>
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-xs space-y-1">
            <div className="text-white font-semibold">⚡ Speed & SLA Leaderboard:</div>
            <div>🥇 Rahul Verma: 1.2 min FRT · 100% SLA</div>
            <div>🥈 Sneha Patel: 1.8 min FRT · 95% SLA</div>
            <div>⭐ Top Performer: <strong className="text-green-400">{report?.topAgent || 'Simran Kaur (FRT: 45s)'}</strong></div>
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-xs space-y-1">
            <div className="text-white font-semibold">💰 Meta Cloud API Cost Pass-Through:</div>
            <div>• WhatsApp Pass-Through: {report?.whatsappSpendINR || '₹42.30'}</div>
            <div>• Anchor Markup: <strong className="text-green-400">₹0.00</strong> (100% Pass-Through)</div>
          </div>

          <div className="text-[#8696a0] text-[10px] pt-1">
            ⏰ Action Required: Qualified inquiries will hit the Meta 24-hour conversational gate before 12:00 PM today.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── P4-14 Custom Report Builder
function CustomReportBuilder() {
  const [selectedMetrics, setSelectedMetrics] = useState(['leads', 'frt', 'revenue'])
  const [groupBy, setGroupBy] = useState('agent')
  const [dateRange, setDateRange] = useState('Last 30 Days')

  const toggleMetric = (m: string) => {
    setSelectedMetrics(ms => ms.includes(m) ? ms.filter(x => x !== m) : [...ms, m])
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">P4-14 · BESPOKE REPORT GENERATOR</div>
        <div className="text-sm font-medium text-[#F0EDE8]">Export Board & Operational Analytics</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 border border-white/8 p-5 bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-2">1. SELECT METRICS</label>
          <div className="space-y-1.5 font-mono text-[10px]">
            {[
              { id: 'leads', label: 'Lead Inbound Volume' },
              { id: 'frt', label: 'First Response Time (FRT)' },
              { id: 'sla', label: 'SLA Breach Counts' },
              { id: 'revenue', label: 'Attributed Revenue ₹' },
              { id: 'spend', label: 'Meta API Cost Breakdown' },
            ].map(m => (
              <label key={m.id} className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#F0EDE8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(m.id)}
                  onChange={() => toggleMetric(m.id)}
                  className="accent-[#C8953A]"
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-2">2. GROUPING & PIVOT</label>
          <div className="space-y-2">
            {['agent', 'campaign', 'channel', 'day'].map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className="w-full py-1.5 text-left px-3 font-mono text-[10px] border transition-colors capitalize"
                style={{
                  borderRadius: 2,
                  borderColor: groupBy === g ? '#C8953A' : 'rgba(255,255,255,0.08)',
                  background: groupBy === g ? 'rgba(200,149,58,0.08)' : 'transparent',
                  color: groupBy === g ? '#F0EDE8' : '#6B6B6B',
                }}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[9px] text-[#6B6B6B] tracking-widest block mb-2">3. DATE RANGE</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full bg-[#111] border border-white/10 text-xs text-[#F0EDE8] p-2 outline-none cursor-pointer"
            style={{ borderRadius: 2 }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter (Q4)</option>
            <option>Custom FY 2026-27</option>
          </select>

          <div className="pt-6 space-y-2">
            <button className="w-full py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] font-semibold tracking-wide hover:bg-[#E8B04A] transition-colors" style={{ borderRadius: 2 }}>
              Download PDF Report
            </button>
            <button className="w-full py-2 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors" style={{ borderRadius: 2 }}>
              Export CSV / Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Analytics export
type AnalyticsTab = 'overview' | 'leaderboard' | 'leakage' | 'agent' | 'trends' | 'executive' | 'reports'

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')

  const tabs: Array<{ id: AnalyticsTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'leakage', label: 'Revenue Leakage' },
    { id: 'leaderboard', label: 'Agent Leaderboard' },
    { id: 'agent', label: 'Agent Detail' },
    { id: 'trends', label: 'Trends' },
    { id: 'executive', label: 'Executive 8AM Dispatch' },
    { id: 'reports', label: 'Report Builder' },
  ]

  return (
    <div>
      <div className="flex gap-1.5 p-1 bg-surface-sub rounded-md border border-border mb-6 -mt-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => {
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative z-10 px-3.5 py-1.5 font-mono text-[11px] font-medium rounded-sm transition-colors whitespace-nowrap",
                isActive ? "text-black font-semibold" : "text-tertiary hover:text-primary hover:bg-surface-hover/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-analytics-tab"
                  className="absolute inset-0 bg-accent rounded-sm -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              {t.label}
            </button>
          )
        })}
      </div>
      {activeTab === 'overview' && <BentoOverview />}
      {activeTab === 'leakage' && <RevenueLeakage />}
      {activeTab === 'leaderboard' && <AgentLeaderboard />}
      {activeTab === 'agent' && <AgentDetail />}
      {activeTab === 'trends' && <TrendAnalytics />}
      {activeTab === 'executive' && <ExecutiveDailyReport />}
      {activeTab === 'reports' && <CustomReportBuilder />}
    </div>
  )
}

