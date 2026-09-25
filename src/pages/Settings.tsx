import { useState, useEffect } from 'react'
import { CheckIcon, LockIcon, BellIcon, TeamIcon, ArrowRightIcon, BoltIcon, WarningIcon } from '../components/Icons'
import { authApi } from '../api/client'

const inp = 'w-full bg-[#111] border border-white/10 text-[#F0EDE8] text-sm px-4 py-3 placeholder-[#444] focus:outline-none focus:border-[#C8953A] transition-colors'
const lbl = 'font-mono text-[10px] text-[#6B6B6B] tracking-widest block mb-1.5'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="w-10 h-6 relative flex-shrink-0 transition-colors"
      style={{ borderRadius: 12, background: on ? '#C8953A' : 'rgba(255,255,255,0.1)' }}>
      <div className="absolute top-1 w-4 h-4 bg-white transition-all" style={{ borderRadius: '50%', left: on ? 22 : 4 }} />
    </button>
  )
}

// ── G09 Profile Settings
function ProfileSettings() {
  const [firstName, setFirstName] = useState('Rahul')
  const [lastName, setLastName] = useState('Verma')
  const [email, setEmail] = useState('rahul@khanna-properties.com')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [notifs, setNotifs] = useState({ whatsapp: true, email: true, push: false })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    authApi.getMe()
      .then((res: any) => {
        if (res?.user) {
          const parts = (res.user.name || '').split(' ')
          if (parts[0]) setFirstName(parts[0])
          if (parts.slice(1).join(' ')) setLastName(parts.slice(1).join(' '))
          if (res.user.email) setEmail(res.user.email)
          if (res.user.phone) setPhone(res.user.phone)
        }
      })
      .catch((err: any) => console.log('Using default profile:', err.message))
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <div className={lbl}>AVATAR</div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#2A2A2A] flex items-center justify-center font-display text-2xl text-[#C8953A]" style={{ borderRadius: 2 }}>
            {firstName.charAt(0) || 'A'}
          </div>
          <button className="font-mono text-[10px] text-[#6B6B6B] hover:text-[#F0EDE8] border border-white/10 px-3 py-1.5 transition-colors" style={{ borderRadius: 2 }}>
            Upload Photo
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>FIRST NAME</label>
          <input style={{ borderRadius: 2 }} className={inp} value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className={lbl}>LAST NAME</label>
          <input style={{ borderRadius: 2 }} className={inp} value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={lbl}>WORK EMAIL</label>
        <input style={{ borderRadius: 2 }} className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>PHONE (WHATSAPP)</label>
        <input style={{ borderRadius: 2 }} className={inp} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>CURRENT PASSWORD</label>
        <input style={{ borderRadius: 2 }} className={inp} type="password" placeholder="Enter to change password" />
      </div>
      <div className="border border-white/8 p-4 space-y-3" style={{ borderRadius: 2 }}>
        <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest mb-3">NOTIFICATION PREFERENCES</div>
        {Object.entries(notifs).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#F0EDE8] capitalize">{key === 'whatsapp' ? 'WhatsApp' : key} notifications</div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">
                {key === 'whatsapp' ? 'New leads, SLA breaches' : key === 'email' ? 'Daily summary, reports' : 'Browser push alerts'}
              </div>
            </div>
            <Toggle on={val} onToggle={() => setNotifs(n => ({ ...n, [key]: !val }))} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-[#C8953A] text-[#080808] font-semibold text-sm hover:bg-[#E8B04A] transition-colors" style={{ borderRadius: 2 }}>
          Save Changes
        </button>
        {saved && (
          <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
            <CheckIcon size={12} strokeWidth={2} /> Profile updated!
          </span>
        )}
      </div>
    </div>
  )
}

// ── G10 Organization Settings
function OrgSettings() {
  const [orgName, setOrgName] = useState('Khanna Properties Pvt. Ltd.')
  const [industry, setIndustry] = useState('REAL_ESTATE')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('19:00')
  const [autoReply, setAutoReply] = useState(true)
  const [masking, setMasking] = useState(true)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const [workDays, setWorkDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

  // Meta Credentials
  const [wabaId, setWabaId] = useState('')
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [metaAccessToken, setMetaAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    authApi.getMe()
      .then((res: any) => {
        if (res?.user?.organization) {
          const org = res.user.organization
          if (org.name) setOrgName(org.name)
          if (org.industry) setIndustry(org.industry)
          if (org.numberMaskingEnabled !== undefined) setMasking(org.numberMaskingEnabled)
          if (org.workingHoursStart) setStartTime(org.workingHoursStart)
          if (org.workingHoursEnd) setEndTime(org.workingHoursEnd)
          if (org.wabaId) setWabaId(org.wabaId)
          if (org.phoneNumberId) setPhoneNumberId(org.phoneNumberId)
          if (org.metaAccessToken) setMetaAccessToken(org.metaAccessToken)
        }
      })
      .catch((err: any) => console.log('Using default org settings:', err.message))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await authApi.updateOrg({
        name: orgName,
        industry,
        workingHoursStart: startTime,
        workingHoursEnd: endTime,
        numberMaskingEnabled: masking,
        wabaId: wabaId || undefined,
        phoneNumberId: phoneNumberId || undefined,
        metaAccessToken: metaAccessToken || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <label className={lbl}>ORGANIZATION NAME</label>
        <input style={{ borderRadius: 2 }} className={inp} value={orgName} onChange={e => setOrgName(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>LOGO</label>
        <div className="border border-dashed border-white/10 p-6 text-center" style={{ borderRadius: 2 }}>
          <div className="font-mono text-[10px] text-[#6B6B6B]">Drop logo here or <span className="text-[#C8953A] cursor-pointer">browse</span></div>
          <div className="font-mono text-[9px] text-[#3A3A3A] mt-1">PNG/SVG · Max 1MB</div>
        </div>
      </div>
      <div>
        <label className={lbl}>TIMEZONE</label>
        <select style={{ borderRadius: 2 }} className={inp + ' cursor-pointer'}>
          <option>Asia/Kolkata (IST, UTC+5:30)</option>
          <option>Asia/Dubai (GST, UTC+4:00)</option>
        </select>
      </div>
      <div>
        <label className={lbl}>WORKING DAYS</label>
        <div className="flex gap-2">
          {days.map(d => (
            <button key={d} onClick={() => setWorkDays(wd => wd.includes(d) ? wd.filter(x => x !== d) : [...wd, d])}
              className="w-10 h-10 font-mono text-[10px] border transition-colors"
              style={{ borderRadius: 2, borderColor: workDays.includes(d) ? '#C8953A' : 'rgba(255,255,255,0.08)', color: workDays.includes(d) ? '#C8953A' : '#6B6B6B', background: workDays.includes(d) ? 'rgba(200,149,58,0.08)' : 'transparent' }}>
              {d.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl}>WORKING HOURS START</label>
          <input style={{ borderRadius: 2 }} className={inp} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className={lbl}>WORKING HOURS END</label>
          <input style={{ borderRadius: 2 }} className={inp} type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 border border-white/8 p-4" style={{ borderRadius: 2 }}>
        {[
          { label: 'Default auto-reply', sub: 'Fire auto-reply on every new conversation', state: autoReply, set: setAutoReply },
          { label: 'Phone number masking', sub: 'Agents see +91 98XXX XX210 instead of full number', state: masking, set: setMasking },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#F0EDE8]">{item.label}</div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">{item.sub}</div>
            </div>
            <Toggle on={item.state} onToggle={() => item.set(!item.state)} />
          </div>
        ))}
      </div>

      {/* Meta WhatsApp Cloud API Section */}
      <div className="border border-[#C8953A]/20 bg-[#C8953A]/5 p-5 space-y-4" style={{ borderRadius: 2 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] text-[#C8953A] tracking-widest">OFFICIAL META WHATSAPP CLOUD API</div>
            <div className="text-sm font-medium text-[#F0EDE8]">Direct Meta Credentials (Zero Per-Message Markup)</div>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20" style={{ borderRadius: 2 }}>
            Connected
          </span>
        </div>

        <div>
          <label className={lbl}>WHATSAPP BUSINESS ACCOUNT ID (WABA ID)</label>
          <input
            style={{ borderRadius: 2 }}
            className={inp}
            value={wabaId}
            onChange={e => setWabaId(e.target.value)}
            placeholder="e.g. 109283746592817"
          />
        </div>

        <div>
          <label className={lbl}>PHONE NUMBER ID</label>
          <input
            style={{ borderRadius: 2 }}
            className={inp}
            value={phoneNumberId}
            onChange={e => setPhoneNumberId(e.target.value)}
            placeholder="e.g. 102938475610293"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={lbl.replace(' mb-1.5', '')}>SYSTEM USER ACCESS TOKEN (PERMANENT)</label>
            <button
              onClick={() => setShowToken(!showToken)}
              className="font-mono text-[9px] text-[#C8953A] hover:underline"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            style={{ borderRadius: 2 }}
            className={inp}
            type={showToken ? 'text' : 'password'}
            value={metaAccessToken}
            onChange={e => setMetaAccessToken(e.target.value)}
            placeholder="EAAB..."
          />
          <div className="font-mono text-[9px] text-[#6B6B6B] mt-1.5">
            Anchor communicates directly with Meta Graph API servers without third-party proxies.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C8953A] text-[#080808] font-semibold text-sm hover:bg-[#E8B04A] transition-colors flex items-center justify-center gap-2"
          style={{ borderRadius: 2 }}
        >
          {saving ? 'Saving...' : 'Save Organization Settings'}
        </button>
        {saved && (
          <span className="font-mono text-[10px] text-green-400 flex items-center gap-1">
            <CheckIcon size={12} strokeWidth={2} /> Settings saved!
          </span>
        )}
      </div>
    </div>
  )
}

// ── G11 Billing
function Billing() {
  const plans = [
    { name: 'Starter', price: 999, leads: 500, agents: 2 },
    { name: 'Growth', price: 2499, leads: 2000, agents: 10, current: true },
    { name: 'Business', price: 5999, leads: 10000, agents: 50 },
    { name: 'Enterprise', price: null, leads: null, agents: null },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border border-[#C8953A]/20 bg-[#C8953A]/5 p-4 flex items-center justify-between" style={{ borderRadius: 2 }}>
        <div>
          <div className="font-mono text-[10px] text-[#C8953A] tracking-widest mb-1">CURRENT PLAN</div>
          <div className="font-display text-2xl text-[#F0EDE8]">Growth</div>
          <div className="font-mono text-[9px] text-[#6B6B6B]">Renews on 1 Nov 2026 · ₹2,499/month</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-[#6B6B6B] mb-1">META WALLET</div>
          <div className="font-display text-xl text-[#C8953A]">₹4,820</div>
          <button className="font-mono text-[9px] text-[#C8953A] hover:text-[#E8B04A]">Recharge →</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {plans.map(p => (
          <div key={p.name}
            className="border p-4 flex flex-col"
            style={{ borderRadius: 2, borderColor: p.current ? '#C8953A' : 'rgba(255,255,255,0.08)', background: p.current ? 'rgba(200,149,58,0.04)' : 'transparent' }}>
            <div className="font-mono text-[9px] text-[#6B6B6B] tracking-widest mb-1">{p.name.toUpperCase()}</div>
            <div className="font-display text-xl text-[#F0EDE8] mb-1">
              {p.price ? `₹${p.price.toLocaleString()}` : 'Custom'}
            </div>
            {p.price && <div className="font-mono text-[9px] text-[#6B6B6B] mb-3">/month</div>}
            <div className="space-y-1 text-[10px] text-[#6B6B6B] flex-1">
              <div>{p.leads ? `${p.leads.toLocaleString()} leads` : 'Unlimited leads'}</div>
              <div>{p.agents ? `${p.agents} agents` : 'Unlimited agents'}</div>
            </div>
            {!p.current && (
              <button className="mt-3 w-full py-1.5 border border-white/10 font-mono text-[9px] text-[#6B6B6B] hover:border-[#C8953A] hover:text-[#C8953A] transition-colors" style={{ borderRadius: 2 }}>
                {p.price ? 'Upgrade' : 'Contact Sales'}
              </button>
            )}
            {p.current && (
              <div className="mt-3 flex items-center gap-1 font-mono text-[9px] text-[#C8953A]">
                <CheckIcon size={10} strokeWidth={2.5} /> Current
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest mb-3">PAYMENT HISTORY</div>
        <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
          {[
            { date: '1 Oct 2026', amount: '₹2,499', desc: 'Growth Plan — Monthly', status: 'Paid' },
            { date: '1 Sep 2026', amount: '₹2,499', desc: 'Growth Plan — Monthly', status: 'Paid' },
            { date: '5 Sep 2026', amount: '₹5,000', desc: 'Meta Wallet Recharge', status: 'Paid' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
              <div>
                <div className="text-sm text-[#F0EDE8]">{row.desc}</div>
                <div className="font-mono text-[9px] text-[#6B6B6B]">{row.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[#C8953A]">{row.amount}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 text-green-400 border border-green-400/20 bg-green-400/5" style={{ borderRadius: 2 }}>
                  {row.status}
                </span>
                <button className="font-mono text-[9px] text-[#6B6B6B] hover:text-[#F0EDE8]">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── G12 Team Management
function TeamManagement() {
  const [members, setMembers] = useState<any[]>([
    { id: '1', name: 'Arjun Sharma', email: 'arjun@anchor.io', role: 'Owner', status: 'Active', leads: 142 },
    { id: '2', name: 'Vikram Singh', email: 'manager@anchor.io', role: 'Manager', status: 'Active', leads: 89 },
    { id: '3', name: 'Rahul Verma', email: 'sales@anchor.io', role: 'Agent', status: 'Active', leads: 67 },
  ])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState('AGENT')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  const roleColors: Record<string, string> = {
    Owner: '#C8953A', OWNER: '#C8953A',
    Manager: '#4A9EBA', MANAGER: '#4A9EBA',
    Agent: '#6B6B6B', AGENT: '#6B6B6B',
  }

  useEffect(() => {
    authApi.getTeam()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
            status: u.isActive ? 'Active' : 'Offline',
            leads: u.activeChatsCount || 0,
          }))
          setMembers(mapped)
        }
      })
      .catch((err: any) => console.log('Using default team:', err.message))
  }, [])

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      alert('Please fill out name and email')
      return
    }
    setIsInviting(true)
    try {
      const res = await authApi.inviteMember({
        name: inviteName,
        email: inviteEmail,
        phone: invitePhone || undefined,
        role: inviteRole,
      })
      setMembers(ms => [
        ...ms,
        {
          id: res.user?.id || Date.now().toString(),
          name: inviteName,
          email: inviteEmail,
          role: inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1).toLowerCase(),
          status: 'Active',
          leads: 0,
        },
      ])
      setInviteSuccess(`Invited! Temp password: ${res.temporaryPassword || 'anchor123'}`)
      setTimeout(() => {
        setInviteSuccess(null)
        setShowInviteModal(false)
        setInviteName('')
        setInviteEmail('')
        setInvitePhone('')
      }, 4000)
    } catch (err: any) {
      alert('Failed to invite member: ' + err.message)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0D0D0D] border border-white/10 w-full max-w-md p-6 space-y-4" style={{ borderRadius: 2 }}>
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="font-mono text-[10px] text-[#C8953A] tracking-widest">INVITE TEAM MEMBER</div>
              <button onClick={() => setShowInviteModal(false)} className="text-[#6B6B6B] hover:text-white font-mono text-sm">×</button>
            </div>

            <div>
              <label className={lbl}>FULL NAME</label>
              <input style={{ borderRadius: 2 }} className={inp} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Divya Nair" />
            </div>

            <div>
              <label className={lbl}>WORK EMAIL</label>
              <input style={{ borderRadius: 2 }} className={inp} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="e.g. divya@business.com" />
            </div>

            <div>
              <label className={lbl}>PHONE NUMBER (WHATSAPP)</label>
              <input style={{ borderRadius: 2 }} className={inp} type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="+91 98000 12345" />
            </div>

            <div>
              <label className={lbl}>ROLE & PERMISSIONS</label>
              <select style={{ borderRadius: 2 }} className={inp + ' cursor-pointer'} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="AGENT">Sales Agent (Masked Numbers, Assigned Chats)</option>
                <option value="MANAGER">Sales Manager (Team Routing, Full Reports)</option>
                <option value="OWNER">Organization Owner (Full Admin & Billing)</option>
              </select>
            </div>

            {inviteSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 font-mono text-[10px] text-green-400" style={{ borderRadius: 2 }}>
                {inviteSuccess}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-white/10 font-mono text-[10px] text-[#6B6B6B] hover:text-white transition-colors" style={{ borderRadius: 2 }}>Cancel</button>
              <button onClick={handleInvite} disabled={isInviting} className="flex-1 py-2.5 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center justify-center gap-1.5" style={{ borderRadius: 2 }}>
                {isInviting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] text-[#6B6B6B]">{members.length} members · Unlimited seats on Growth Plan</div>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-[#C8953A] text-[#080808] font-mono text-[10px] tracking-wide hover:bg-[#E8B04A] transition-colors flex items-center gap-1.5" style={{ borderRadius: 2 }}>
          <TeamIcon size={12} strokeWidth={2} /> Invite Member
        </button>
      </div>

      <div className="border border-white/8 overflow-hidden" style={{ borderRadius: 2 }}>
        <div className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-2 border-b border-white/8 font-mono text-[9px] text-[#6B6B6B] tracking-widest gap-4">
          <span>MEMBER</span><span>ROLE</span><span>ACTIVE LEADS</span><span>STATUS</span>
        </div>
        {members.map((m, i) => (
          <div key={m.id || i} className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-3 border-b border-white/5 last:border-0 items-center gap-4">
            <div>
              <div className="text-sm text-[#F0EDE8]">{m.name}</div>
              <div className="font-mono text-[9px] text-[#6B6B6B]">{m.email}</div>
            </div>
            <select
              className="bg-transparent border border-white/10 font-mono text-[10px] px-2 py-1 focus:outline-none focus:border-[#C8953A] cursor-pointer"
              style={{ borderRadius: 2, color: roleColors[m.role] || '#F0EDE8' }}
              defaultValue={m.role}
            >
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Agent">Agent</option>
            </select>
            <span className="font-mono text-xs text-[#F0EDE8] text-center">{m.leads}</span>
            <span className="font-mono text-[9px] px-2 py-0.5"
              style={{ borderRadius: 2, color: m.status === 'Active' ? '#4ADE80' : '#EAB308', background: m.status === 'Active' ? 'rgba(74,222,128,0.08)' : 'rgba(234,179,8,0.08)' }}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Settings export
type SettingsTab = 'profile' | 'organization' | 'billing' | 'team' | 'notifications'

export default function Settings({ tab = 'profile' }: { tab?: SettingsTab }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(tab)

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'organization', label: 'Organization' },
    { id: 'billing', label: 'Billing' },
    { id: 'team', label: 'Team' },
  ]

  return (
    <div>
      <div className="flex gap-1 border-b border-white/8 mb-6 -mt-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2.5 font-mono text-[10px] tracking-wide transition-colors border-b-2 -mb-px"
            style={{ borderColor: activeTab === t.id ? '#C8953A' : 'transparent', color: activeTab === t.id ? '#C8953A' : '#6B6B6B' }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'organization' && <OrgSettings />}
      {activeTab === 'billing' && <Billing />}
      {activeTab === 'team' && <TeamManagement />}
    </div>
  )
}
