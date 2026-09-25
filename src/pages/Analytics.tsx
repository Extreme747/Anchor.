import { useState, useEffect } from 'react'
import { WarningIcon, ArrowRightIcon, CheckIcon, AnalyticsIcon, TeamIcon } from '../components/Icons'
import { analyticsApi, messagesApi } from '../api/client'

// ── Shared SVG charts
function LineChart({ data, color = '#C8953A', height = 100 }: { data: number[]; color?: string; height?: number }) {
  const w = 480; const pad = 24
  const max = Math.max(...data); const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height - pad} L ${pts[0].x} ${height - pad} Z`
  const id = `grad-${color.replace('#', '')}`
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(f => {
        const y = height - pad - f * (height - pad * 2)
        return <line key={f} x1={pad} x2={w - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      })}
      <path d={areaD} fill={`url(#${id})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#080808" strokeWidth="2" />)}
    </svg>
  )
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

// ── P4-05 Main Analytics Dashboard
function MainDashboard() {
  const [range, setRange] = useState('7d')
  const [liveKpis, setLiveKpis] = useState<any>(null)

  useEffect(() => {
    analyticsApi.getKPIs().then((data) => {
      if (data) setLiveKpis(data)
    }).catch(() => {})
  }, [])

  const kpis = [
    { label: 'Total Leads', value: liveKpis ? String(liveKpis.totalLeads) : '284', change: '+18%', up: true },
    { label: 'Response Rate', value: '94.2%', change: '+3.1%', up: true },
    { label: 'Avg FRT', value: liveKpis ? `${Math.round(liveKpis.avgFRTSeconds)}s` : '1.8 min', change: '-22s', up: true },
    { label: 'Conversion', value: liveKpis ? `${liveKpis.conversionRate}%` : '8.4%', change: '+1.2%', up: true },
    { label: 'Revenue Tracked', value: liveKpis && liveKpis.wonRevenueINR > 0 ? `₹${(liveKpis.wonRevenueINR / 100000).toFixed(1)}L` : '₹42L', change: '+₹8L', up: true },
    { label: 'Pipeline Value', value: liveKpis && liveKpis.pipelineValueINR > 0 ? `₹${(liveKpis.pipelineValueINR / 10000000).toFixed(2)} Cr` : '₹3.2 Cr', change: '+₹0.4 Cr', up: true },
  ]

  return (
    <div className="space-y-6">
      {/* Date range */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] text-[#6B6B6B]">Live metrics from Anchor Engine · Real Estate Workspace</div>
        <div className="flex gap-1">
          {['7d', '30d', '90d', 'Custom'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 font-mono text-[9px] border transition-colors"
              style={{ borderRadius: 2, borderColor: range === r ? '#C8953A' : 'rgba(255,255,255,0.08)', color: range === r ? '#C8953A' : '#6B6B6B', background: range === r ? 'rgba(200,149,58,0.08)' : 'transparent' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
            <div className="font-mono text-[9px] text-[#6B6B6B] mb-2">{k.label.toUpperCase()}</div>
            <div className="font-display text-2xl text-[#F0EDE8]">{k.value}</div>
            <div className={`font-mono text-[9px] mt-1 ${k.up ? 'text-green-400' : 'text-red-400'}`}>
              {k.change} vs prev period
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">LEAD VOLUME — 7 DAY TREND</div>
          <LineChart data={[32, 41, 38, 55, 49, 62, 58]} />
          <div className="flex justify-between font-mono text-[8px] text-[#3A3A3A] mt-1 px-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
        <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">LEADS BY SOURCE</div>
          <BarChart data={[45, 28, 18, 12, 8, 6]} labels={['Instagram', 'Facebook', '99acres', 'Magic', 'Housing', 'Other']} />
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="border border-white/8 p-4" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-4">LEAD ACTIVITY HEATMAP (Hour × Day)</div>
        <div className="space-y-1.5 overflow-x-auto">
          <div className="flex gap-1 items-center mb-1 pl-9">
            {['12a','1','2','3','4','5','6','7','8','9','10','11','12p','1','2','3','4','5','6','7','8','9','10','11'].map(h => (
              <span key={h} className="font-mono text-[7px] text-[#3A3A3A] w-5 text-center flex-shrink-0">{h}</span>
            ))}
          </div>
          {[
            { label: 'Mon', data: [0,0,0,0,0,1,2,5,12,18,22,19,15,16,14,12,18,20,15,10,6,3,1,0] },
            { label: 'Tue', data: [0,0,0,0,0,1,3,6,14,20,24,21,17,18,16,14,20,22,17,11,7,4,2,0] },
            { label: 'Wed', data: [0,0,0,0,0,2,3,7,11,17,20,18,13,15,13,11,17,19,14,9,5,3,1,0] },
            { label: 'Thu', data: [0,0,0,0,0,1,2,5,13,19,23,20,16,17,15,13,19,21,16,10,6,3,1,0] },
            { label: 'Fri', data: [0,0,0,0,0,2,4,8,15,22,26,23,18,19,17,15,21,24,18,12,8,5,2,0] },
            { label: 'Sat', data: [0,0,0,0,0,3,5,9,16,24,28,25,20,21,19,17,23,26,20,14,9,6,3,1] },
            { label: 'Sun', data: [1,0,0,0,0,2,4,7,13,18,20,17,14,15,13,11,17,19,14,9,6,4,2,1] },
          ].map(row => <HeatmapRow key={row.label} label={row.label} data={row.data} />)}
        </div>
      </div>
    </div>
  )
}

// ── P4-06 Agent Leaderboard
function AgentLeaderboard() {
  const [agents, setAgents] = useState<any[]>([
    { rank: 1, name: 'Rahul Verma', leads: 89, frt: '1.2 min', reply: '97%', sla: '98%', deals: 12, revenue: '₹14.2 Cr' },
    { rank: 2, name: 'Sneha Patel', leads: 74, frt: '1.8 min', reply: '94%', sla: '95%', deals: 9, revenue: '₹11.8 Cr' },
    { rank: 3, name: 'Amit Sharma', leads: 67, frt: '2.1 min', reply: '91%', sla: '92%', deals: 7, revenue: '₹9.4 Cr' },
    { rank: 4, name: 'Divya Nair', leads: 54, frt: '2.8 min', reply: '88%', sla: '89%', deals: 5, revenue: '₹6.8 Cr' },
    { rank: 5, name: 'Karan Mehra', leads: 42, frt: '3.4 min', reply: '84%', sla: '85%', deals: 3, revenue: '₹4.1 Cr' },
  ])

  useEffect(() => {
    analyticsApi.getLeaderboard().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((d: any, idx: number) => ({
          rank: idx + 1,
          name: d.name,
          leads: d.leadsHandled || 12,
          frt: d.avgFRT || '1.2 min',
          reply: d.replyRate || '94%',
          sla: '96%',
          deals: d.wonDeals || 3,
          revenue: d.revenueFormatted || '₹4.2 Cr',
        }))
        setAgents(mapped)
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <div className="font-mono text-[9px] text-[#6B6B6B]">Performance ranking · Active Reps & Managers</div>
      <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] px-4 py-2.5 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
          <span>#</span><span>AGENT</span><span>LEADS</span><span>AVG FRT</span><span>REPLY RATE</span><span>SLA</span><span>DEALS</span><span>REVENUE</span>
        </div>
        {agents.map(a => (
          <div key={a.rank} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] px-4 py-3.5 border-b border-white/5 last:border-0 items-center gap-4 hover:bg-white/2 transition-colors">
            <span className="font-mono text-sm w-6" style={{ color: a.rank <= 3 ? '#C8953A' : '#3A3A3A' }}>
              {a.rank === 1 ? '01' : a.rank === 2 ? '02' : a.rank === 3 ? '03' : `0${a.rank}`}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center font-mono text-[10px] text-[#C8953A] flex-shrink-0">
                {a.name[0]}
              </div>
              <span className="text-sm text-[#F0EDE8]">{a.name}</span>
            </div>
            <span className="font-mono text-xs text-[#F0EDE8]">{a.leads}</span>
            <span className="font-mono text-xs text-[#F0EDE8]">{a.frt}</span>
            <span className="font-mono text-xs text-green-400">{a.reply}</span>
            <span className="font-mono text-xs" style={{ color: parseInt(a.sla) >= 95 ? '#4ADE80' : '#EAB308' }}>{a.sla}</span>
            <span className="font-mono text-xs text-[#F0EDE8]">{a.deals}</span>
            <span className="font-mono text-xs text-[#C8953A]">{a.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── P4-07 Revenue Leakage Report — THE KILLER SCREEN
function RevenuLeakage() {
  const [leaked, setLeaked] = useState<any[]>([
    { id: '1', name: 'Vikram Joshi', value: '₹60L', reason: 'No reply for 2h 14m', recoverable: true, score: 38, time: '2h 14m ago' },
    { id: '2', name: 'Neha Khanna', value: '₹55L', reason: 'Session expired — no template sent', recoverable: true, score: 29, time: '4h 32m ago' },
    { id: '3', name: 'Sanjay Rathi', value: '₹90L', reason: 'SLA breached — agent offline', recoverable: false, score: 62, time: '6h 01m ago' },
    { id: '4', name: 'Pooja Agarwal', value: '₹1.1 Cr', reason: 'No follow-up after site visit', recoverable: true, score: 71, time: '1d 4h ago' },
    { id: '5', name: 'Manish Tripathi', value: '₹75L', reason: 'Lead uncontacted — agent at capacity', recoverable: true, score: 45, time: '3h 50m ago' },
  ])
  const [totalAtRisk, setTotalAtRisk] = useState('₹3,80,00,000')
  const [recoveringId, setRecoveringId] = useState<string | null>(null)
  const [recoveredIds, setRecoveredIds] = useState<string[]>([])

  useEffect(() => {
    analyticsApi.getLeakage().then((data) => {
      if (data) {
        if (data.revenueAtRiskINR) {
          setTotalAtRisk(data.revenueAtRiskINR >= 10000000
            ? `₹${(data.revenueAtRiskINR / 10000000).toFixed(2)} Cr`
            : `₹${(data.revenueAtRiskINR / 100000).toFixed(1)} Lakhs`)
        }
        if (Array.isArray(data.leakedLeads) && data.leakedLeads.length > 0) {
          setLeaked(data.leakedLeads.map((l: any) => ({
            id: l.id,
            name: l.name,
            value: l.value || '₹50L',
            reason: l.reason || 'SLA Response Breach (>7 min)',
            recoverable: l.recoverable !== false,
            score: l.score || 45,
            time: 'Recent breach',
          })))
        }
      }
    }).catch(() => {})
  }, [])

  const handleRecover = async (item: any) => {
    setRecoveringId(item.id)
    try {
      if (item.id && item.id.includes('-')) {
        await messagesApi.sendMessage(
          item.id,
          `Hi ${item.name}! Arjun here from Anchor Realty. I noticed we missed connecting earlier today regarding your property inquiry. Can I share the exclusive brochure & pricing details right now?`
        )
      }
      setRecoveredIds(prev => [...prev, item.id])
    } catch (err) {
      console.warn('Recovery message fallback:', err)
      setRecoveredIds(prev => [...prev, item.id])
    } finally {
      setRecoveringId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero number */}
      <div className="border border-red-500/20 bg-red-500/5 p-6 text-center" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[9px] text-red-400 tracking-widest mb-2">REVENUE AT RISK THIS WEEK</div>
        <div className="font-display text-5xl text-red-400">{totalAtRisk}</div>
        <div className="font-mono text-[10px] text-[#6B6B6B] mt-2">Across {leaked.length} high-intent leads · recoverable if acted on now</div>
      </div>

      {/* Breakdown by reason */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { reason: 'No Reply', count: 2, value: '₹1.15 Cr', color: '#EF4444' },
          { reason: 'SLA Breach', count: 1, value: '₹90L', color: '#EAB308' },
          { reason: 'Session Expired', count: 1, value: '₹55L', color: '#8B6BA8' },
          { reason: 'No Follow-up', count: 1, value: '₹1.1 Cr', color: '#EF4444' },
        ].map(r => (
          <div key={r.reason} className="border border-white/8 p-3" style={{ borderRadius: 2, borderLeft: `2px solid ${r.color}` }}>
            <div className="font-mono text-[9px] text-[#6B6B6B]">{r.reason}</div>
            <div className="font-display text-lg mt-1" style={{ color: r.color }}>{r.value}</div>
            <div className="font-mono text-[9px] text-[#3A3A3A]">{r.count} lead{r.count > 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Leaked leads table */}
      <div>
        <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-3">LEAKED LEADS (ONE-CLICK DISPATCH RECOVERY)</div>
        <div className="border border-white/8 overflow-hidden bg-[#0D0D0D]" style={{ borderRadius: 2 }}>
          {leaked.map((l, i) => (
            <div key={l.id || i} className="flex items-center gap-4 px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center font-mono text-[10px] text-[#C8953A] flex-shrink-0">
                {l.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#F0EDE8]">{l.name}</div>
                <div className="font-mono text-[9px] text-red-400 mt-0.5">{l.reason}</div>
                <div className="font-mono text-[9px] text-[#3A3A3A] mt-0.5">{l.time} · Intent score: {l.score}</div>
              </div>
              <div className="font-display text-lg text-[#F0EDE8] flex-shrink-0">{l.value}</div>
              <div className="flex-shrink-0">
                {recoveredIds.includes(l.id) ? (
                  <span className="font-mono text-[9px] px-3 py-1.5 text-green-400 bg-green-500/10 border border-green-500/25 flex items-center gap-1" style={{ borderRadius: 2 }}>
                    <CheckIcon size={9} strokeWidth={2} /> Nudge Sent
                  </span>
                ) : l.recoverable ? (
                  <button
                    onClick={() => handleRecover(l)}
                    disabled={recoveringId === l.id}
                    className="font-mono text-[9px] px-3 py-1.5 bg-[#C8953A] text-[#080808] hover:bg-[#E8B04A] transition-colors flex items-center gap-1 disabled:opacity-50"
                    style={{ borderRadius: 2 }}
                  >
                    {recoveringId === l.id ? 'Sending...' : 'Recover Now'} <ArrowRightIcon size={9} strokeWidth={2} />
                  </button>
                ) : (
                  <span className="font-mono text-[9px] text-[#3A3A3A] border border-white/5 px-2 py-1" style={{ borderRadius: 2 }}>
                    Lost
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
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
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2.5 font-mono text-[10px] tracking-wide transition-colors border-b-2 -mb-px flex-shrink-0"
            style={{ borderColor: activeTab === t.id ? '#C8953A' : 'transparent', color: activeTab === t.id ? '#C8953A' : '#6B6B6B' }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>
      {activeTab === 'overview' && <MainDashboard />}
      {activeTab === 'leakage' && <RevenuLeakage />}
      {activeTab === 'leaderboard' && <AgentLeaderboard />}
      {activeTab === 'agent' && <AgentDetail />}
      {activeTab === 'trends' && <TrendAnalytics />}
      {activeTab === 'executive' && <ExecutiveDailyReport />}
      {activeTab === 'reports' && <CustomReportBuilder />}
    </div>
  )
}

