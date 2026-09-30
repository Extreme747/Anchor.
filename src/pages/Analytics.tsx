import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  BarChart3, 
  Users, 
  Calendar,
  Send,
  Download,
  FileSpreadsheet
} from 'lucide-react'
import { analyticsApi } from '../api/client'
import { cn } from '@/lib/utils'
import { InteractiveLineChart } from '@/components/ui/chart'
import { BentoOverview } from '@/components/analytics/BentoOverview'
import { RevenueLeakage } from '@/components/analytics/RevenueLeakage'
import { AgentLeaderboard } from '@/components/analytics/AgentLeaderboard'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

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
          <div className="w-full transition-all duration-700 rounded-xs" style={{ height: `${(v / max) * 80}%`, background: color, opacity: 0.85 }} />
          <span className="font-mono text-[9px] text-tertiary">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function HeatmapRow({ label, data }: { label: string; data: number[] }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-center gap-1">
      <span className="font-mono text-[9px] text-tertiary w-8 flex-shrink-0 text-right">{label}</span>
      {data.map((v, i) => (
        <div 
          key={i} 
          className="w-5 h-5 flex-shrink-0 rounded-xs border border-border" 
          style={{ background: `rgba(200,149,58,${(v / max) * 0.85})` }} 
          title={`${v} leads`} 
        />
      ))}
    </div>
  )
}

// ── P4-08 Agent Performance Detail
function AgentDetail() {
  const [agent, setAgent] = useState('Rahul Verma')
  const weekData = [82, 91, 78, 95, 88, 97, 84]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-surface-card p-4 rounded-md border border-border">
        <div className="w-12 h-12 rounded-full bg-surface-hover border border-border flex items-center justify-center font-display text-2xl text-accent">
          {agent[0]}
        </div>
        <div>
          <div className="font-display text-2xl text-primary">{agent}</div>
          <div className="font-mono text-[10px] text-tertiary">Senior Sales Advisor · Online · 12 active conversations</div>
        </div>
        <select 
          value={agent} 
          onChange={e => setAgent(e.target.value)}
          className="ml-auto bg-surface-sub border border-border text-primary text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-accent cursor-pointer font-mono"
        >
          <option>Rahul Verma</option>
          <option>Sneha Patel</option>
          <option>Amit Sharma</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg First Reply (FRT)', value: '1.2 min' },
          { label: 'SLA Compliance', value: '98%' },
          { label: 'Active Conversations', value: '89' },
          { label: 'Revenue Attributed', value: '₹14.2 Cr' },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <div className="font-display text-xl text-accent">{k.value}</div>
            <div className="font-mono text-[10px] text-tertiary mt-0.5">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">SLA COMPLIANCE — 7 DAYS</div>
          <LineChart data={weekData} color="#34D399" height={80} />
          <div className="flex justify-between font-mono text-[9px] text-tertiary mt-1 px-1">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">RESOLUTION DONUT</div>
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="#C8953A" strokeWidth="12"
                strokeDasharray={`${2*Math.PI*32*0.98} ${2*Math.PI*32*0.02}`}
                strokeDashoffset={2*Math.PI*32*0.25} strokeLinecap="round" />
              <text x="40" y="44" textAnchor="middle" fill="#F0EDE8" fontSize="13" fontFamily="DM Serif Display, serif">98%</text>
            </svg>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-xs" />
                <span className="text-secondary">On-time: <span className="text-primary font-semibold">87 leads</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-danger/80 rounded-xs" />
                <span className="text-secondary">SLA breach: <span className="text-danger font-semibold">2 leads</span></span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── P4-10 Trend Analytics
function TrendAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">WEEKLY LEAD VOLUME</div>
          <BarChart data={[142, 168, 155, 189, 201, 178, 215]} labels={['W1','W2','W3','W4','W5','W6','W7']} />
        </Card>

        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">REVENUE TREND</div>
          <LineChart data={[28, 34, 29, 41, 38, 47, 52]} color="#C8953A" height={112} />
          <div className="flex justify-between font-mono text-[9px] text-tertiary mt-1 px-1">
            {['W1','W2','W3','W4','W5','W6','W7'].map(w => <span key={w}>{w}</span>)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">CONVERSION FUNNEL</div>
          {[
            { label: 'Leads Received', value: 1203, pct: 100 },
            { label: 'Responded', value: 1132, pct: 94 },
            { label: 'Intent Score 50+', value: 412, pct: 34 },
            { label: 'Site Visit Booked', value: 189, pct: 16 },
            { label: 'Deals Closed', value: 47, pct: 4 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 mb-2 font-mono text-[10px]">
              <div className="w-28 text-tertiary flex-shrink-0">{s.label}</div>
              <div className="flex-1 h-5 bg-surface-sub rounded-sm relative overflow-hidden border border-border">
                <div className="h-full transition-all rounded-xs" style={{ width: `${s.pct}%`, background: i === 4 ? '#C8953A' : 'rgba(200,149,58,0.25)' }} />
                <span className="absolute left-2 top-0 h-full flex items-center text-primary font-medium">{s.value.toLocaleString()}</span>
              </div>
              <span className="text-secondary w-8 text-right font-medium">{s.pct}%</span>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <div className="font-mono text-[10px] text-tertiary tracking-widest uppercase mb-3 font-semibold">AGENT PERFORMANCE COMPARISON</div>
          <BarChart
            data={[89, 74, 67, 54, 42]}
            labels={['Rahul', 'Sneha', 'Amit', 'Divya', 'Karan']}
            color="#60A5FA"
          />
        </Card>
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

  const handleDispatch = () => {
    setSimulated(true)
    toast.success('Executive briefing dispatched to founder WhatsApp')
    setTimeout(() => setSimulated(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-[10px] text-accent tracking-widest font-semibold">P4-09 · EXECUTIVE DAILY DISPATCH (8:00 AM)</div>
          <div className="text-sm font-medium text-primary">Morning Operational Briefing for Founders</div>
        </div>
        <button
          onClick={handleDispatch}
          className="px-3.5 py-1.5 bg-accent text-black font-mono text-[10px] font-semibold rounded-sm hover:bg-accent-light transition-colors flex items-center gap-1.5"
        >
          <Send size={11} />
          <span>{simulated ? '✓ Dispatched to WhatsApp' : 'Dispatch Test Push →'}</span>
        </button>
      </div>

      {/* WhatsApp Message Bubble Simulation */}
      <div className="border border-border bg-[#0b141a] p-5 space-y-4 rounded-md shadow-lg">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-display text-sm text-white">
            ⚓
          </div>
          <div>
            <div className="text-xs font-semibold text-[#e9edef]">Anchor Executive Intelligence Bot</div>
            <div className="font-mono text-[9px] text-[#8696a0]">WhatsApp Dispatch · Today, 08:00 AM IST</div>
          </div>
        </div>

        <div className="font-mono text-xs text-[#e9edef] space-y-3 leading-relaxed">
          <div className="text-accent font-bold">
            ⚓ ANCHOR MORNING REVENUE REPORT — {(report?.organizationName || 'DLF PROPERTIES').toUpperCase()}
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-sm space-y-1">
            <div className="text-white font-semibold">📊 Pipeline Performance:</div>
            <div>• Inbound Leads: <strong className="text-white">{report?.leadsReceived || 84}</strong></div>
            <div>• Responded &lt; 2 mins: <strong className="text-success">{report?.respondedUnder2Min || 76} ({report?.respondedPct || '92.4%'})</strong></div>
            <div>• Leaked Leads (No reply 24h): <strong className="text-danger">{report?.leakedLeadsCount || 4}</strong></div>
            <div>• Revenue At Risk: <strong className="text-danger">{report?.revenueAtRiskINR || '₹18,50,000'}</strong></div>
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-sm space-y-1">
            <div className="text-white font-semibold">⚡ Speed & SLA Leaderboard:</div>
            <div>🥇 Rahul Verma: 1.2 min FRT · 100% SLA</div>
            <div>🥈 Sneha Patel: 1.8 min FRT · 95% SLA</div>
            <div>⭐ Top Performer: <strong className="text-success">{report?.topAgent || 'Simran Kaur (FRT: 45s)'}</strong></div>
          </div>

          <div className="bg-[#1f2c34] p-3 rounded-sm space-y-1">
            <div className="text-white font-semibold">💰 Meta Cloud API Cost Pass-Through:</div>
            <div>• WhatsApp Pass-Through: {report?.whatsappSpendINR || '₹42.30'}</div>
            <div>• Anchor Markup: <strong className="text-success">₹0.00</strong> (100% Pass-Through)</div>
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
        <div className="font-mono text-[10px] text-accent tracking-widest font-semibold uppercase">P4-14 · BESPOKE REPORT GENERATOR</div>
        <div className="text-sm font-medium text-primary">Export Board & Operational Analytics</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 border border-border p-5 bg-surface-card rounded-md shadow-sm">
        <div>
          <label className="font-mono text-[10px] text-tertiary tracking-widest block mb-2 uppercase font-semibold">1. SELECT METRICS</label>
          <div className="space-y-1.5 font-mono text-[11px]">
            {[
              { id: 'leads', label: 'Lead Inbound Volume' },
              { id: 'frt', label: 'First Response Time (FRT)' },
              { id: 'sla', label: 'SLA Breach Counts' },
              { id: 'revenue', label: 'Attributed Revenue ₹' },
              { id: 'spend', label: 'Meta API Cost Breakdown' },
            ].map(m => (
              <label key={m.id} className="flex items-center gap-2 text-secondary hover:text-primary cursor-pointer">
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
          <label className="font-mono text-[10px] text-tertiary tracking-widest block mb-2 uppercase font-semibold">2. GROUPING & PIVOT</label>
          <div className="space-y-2">
            {['agent', 'campaign', 'channel', 'day'].map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={cn(
                  "w-full py-1.5 text-left px-3 font-mono text-[11px] border rounded-sm transition-colors capitalize",
                  groupBy === g 
                    ? "border-accent bg-accent/10 text-primary font-medium" 
                    : "border-border text-tertiary hover:border-border-strong hover:text-primary"
                )}
              >
                By {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] text-tertiary tracking-widest block mb-2 uppercase font-semibold">3. DATE RANGE</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="w-full bg-surface-sub border border-border text-xs text-primary p-2 rounded-sm outline-none cursor-pointer font-mono"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter (Q4)</option>
            <option>Custom FY 2026-27</option>
          </select>

          <div className="pt-6 space-y-2">
            <button 
              onClick={() => toast.success('Bespoke PDF Report generated and downloading')} 
              className="w-full py-2 bg-accent text-black font-mono text-[11px] font-semibold tracking-wide hover:bg-accent-light transition-colors rounded-sm flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              <span>Download PDF Report</span>
            </button>
            <button 
              onClick={() => toast.success('CSV dataset exported successfully')} 
              className="w-full py-2 border border-border font-mono text-[11px] text-tertiary hover:text-primary hover:bg-surface-hover transition-colors rounded-sm flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet size={13} />
              <span>Export CSV / Excel</span>
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
  const [globalRange, setGlobalRange] = useState<'24h' | '7d' | '30d' | '90d' | 'YTD'>('7d')

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
    <div className="space-y-4">
      {/* Top Header Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-sub border border-border p-2.5 rounded-md">
        <div className="flex items-center gap-2 text-xs font-mono text-secondary">
          <Calendar size={13} className="text-accent" />
          <span className="font-medium">Analytics Range:</span>
          <span className="text-primary font-semibold">{globalRange.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-1 bg-canvas p-0.5 rounded border border-border">
          {(['24h', '7d', '30d', '90d', 'YTD'] as const).map(range => (
            <button
              key={range}
              onClick={() => {
                setGlobalRange(range)
                toast.success(`Analytics window set to ${range}`)
              }}
              className={cn(
                "px-2.5 py-1 font-mono text-[10px] rounded transition-colors uppercase font-medium",
                globalRange === range
                  ? "bg-accent text-black font-semibold shadow-xs"
                  : "text-tertiary hover:text-primary hover:bg-surface-hover/50"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Vercel-style sliding pill tabs */}
      <div className="flex gap-1.5 p-1 bg-surface-sub rounded-md border border-border overflow-x-auto scrollbar-hide">
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
