import { useState, useEffect } from 'react'
import {
  Check as CheckIcon,
  Lock as LockIcon,
  Bell as BellIcon,
  Users as TeamIcon,
  ArrowRight as ArrowRightIcon,
  Zap as BoltIcon,
  AlertTriangle as WarningIcon,
  Upload,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { authApi } from '../api/client'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const inp = 'w-full bg-surface-sub border border-border text-primary text-xs px-3.5 py-2.5 rounded-sm placeholder-tertiary focus:outline-none focus:border-accent transition-colors font-mono'
const lbl = 'font-mono text-[10px] text-tertiary tracking-widest block mb-1.5 uppercase font-medium'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button 
      type="button"
      onClick={onToggle}
      className={cn(
        "w-10 h-6 relative flex-shrink-0 transition-colors rounded-full",
        on ? "bg-accent" : "bg-surface-hover border border-border"
      )}
      aria-pressed={on}
    >
      <div 
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full transition-all",
          on ? "bg-black left-[22px]" : "bg-secondary left-1"
        )} 
      />
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
    toast.success('Advisor profile updated successfully')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <div className={lbl}>AVATAR</div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-surface-hover border border-border flex items-center justify-center font-display text-2xl text-accent rounded-sm shadow-inner">
            {firstName.charAt(0) || 'A'}
          </div>
          <button className="font-mono text-[10px] text-tertiary hover:text-primary border border-border hover:bg-surface-hover px-3 py-1.5 transition-colors rounded-sm flex items-center gap-1.5">
            <Upload size={12} />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>FIRST NAME</label>
          <input className={inp} value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className={lbl}>LAST NAME</label>
          <input className={inp} value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={lbl}>WORK EMAIL</label>
        <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>PHONE (WHATSAPP)</label>
        <input className={inp} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>CURRENT PASSWORD</label>
        <input className={inp} type="password" placeholder="Enter to change password" />
      </div>
      <div className="border border-border p-4 space-y-3 bg-surface-card rounded-md shadow-sm">
        <div className="font-mono text-[10px] text-tertiary tracking-widest mb-3 uppercase">NOTIFICATION PREFERENCES</div>
        {Object.entries(notifs).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-primary capitalize">{key === 'whatsapp' ? 'WhatsApp' : key} notifications</div>
              <div className="font-mono text-[9px] text-tertiary">
                {key === 'whatsapp' ? 'New leads, SLA breaches' : key === 'email' ? 'Daily summary, reports' : 'Browser push alerts'}
              </div>
            </div>
            <Toggle on={val} onToggle={() => setNotifs(n => ({ ...n, [key]: !val }))} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-accent text-black font-semibold text-xs rounded-sm hover:bg-accent-light transition-colors">
          Save Changes
        </button>
        {saved && (
          <span className="font-mono text-[10px] text-success flex items-center gap-1">
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
      toast.success('Workspace settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <label className={lbl}>ORGANIZATION NAME</label>
        <input className={inp} value={orgName} onChange={e => setOrgName(e.target.value)} />
      </div>
      <div>
        <label className={lbl}>LOGO</label>
        <div className="border border-dashed border-border p-6 text-center rounded-sm bg-surface-sub">
          <div className="font-mono text-[10px] text-tertiary">Drop logo here or <span className="text-accent cursor-pointer hover:underline">browse</span></div>
          <div className="font-mono text-[9px] text-tertiary mt-1">PNG/SVG · Max 1MB</div>
        </div>
      </div>
      <div>
        <label className={lbl}>TIMEZONE</label>
        <select className={inp + ' cursor-pointer'}>
          <option>Asia/Kolkata (IST, UTC+5:30)</option>
          <option>Asia/Dubai (GST, UTC+4:00)</option>
        </select>
      </div>
      <div>
        <label className={lbl}>WORKING DAYS</label>
        <div className="flex gap-2">
          {days.map(d => (
            <button key={d} onClick={() => setWorkDays(wd => wd.includes(d) ? wd.filter(x => x !== d) : [...wd, d])}
              className={cn(
                "w-10 h-10 font-mono text-[10px] border transition-colors rounded-sm",
                workDays.includes(d) 
                  ? "border-accent text-accent bg-accent/10 font-semibold" 
                  : "border-border text-tertiary hover:border-border-strong hover:text-primary"
              )}>
              {d.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl}>WORKING HOURS START</label>
          <input className={inp} type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className={lbl}>WORKING HOURS END</label>
          <input className={inp} type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      <div className="space-y-3 border border-border p-4 bg-surface-card rounded-md shadow-sm">
        {[
          { label: 'Default auto-reply', sub: 'Fire auto-reply on every new conversation', state: autoReply, set: setAutoReply },
          { label: 'Phone number masking', sub: 'Agents see +91 98XXX XX210 instead of full number', state: masking, set: setMasking },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-primary">{item.label}</div>
              <div className="font-mono text-[9px] text-tertiary">{item.sub}</div>
            </div>
            <Toggle on={item.state} onToggle={() => item.set(!item.state)} />
          </div>
        ))}
      </div>

      {/* Meta WhatsApp Cloud API Section */}
      <div className="border border-accent/30 bg-accent/5 p-5 space-y-4 rounded-md shadow-sm shadow-[inset_0_1px_0_0_rgba(200,149,58,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] text-accent tracking-widest font-semibold">OFFICIAL META WHATSAPP CLOUD API</div>
            <div className="text-sm font-medium text-primary">Direct Meta Credentials (Zero Per-Message Markup)</div>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-sm">
            Connected
          </span>
        </div>

        <div>
          <label className={lbl}>WHATSAPP BUSINESS ACCOUNT ID (WABA ID)</label>
          <input
            className={inp}
            value={wabaId}
            onChange={e => setWabaId(e.target.value)}
            placeholder="e.g. 109283746592817"
          />
        </div>

        <div>
          <label className={lbl}>PHONE NUMBER ID</label>
          <input
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
              className="font-mono text-[9px] text-accent hover:underline"
            >
              {showToken ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            className={inp}
            type={showToken ? 'text' : 'password'}
            value={metaAccessToken}
            onChange={e => setMetaAccessToken(e.target.value)}
            placeholder="EAAB..."
          />
          <div className="font-mono text-[9px] text-tertiary mt-1.5">
            Anchor communicates directly with Meta Graph API servers without third-party proxies.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-accent text-black font-semibold text-xs rounded-sm hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Organization Settings'}
        </button>
        {saved && (
          <span className="font-mono text-[10px] text-success flex items-center gap-1">
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
      <div className="border border-accent/30 bg-accent/5 p-4 flex items-center justify-between rounded-md shadow-sm">
        <div>
          <div className="font-mono text-[10px] text-accent tracking-widest mb-1 font-semibold">CURRENT PLAN</div>
          <div className="font-display text-2xl text-primary">Growth</div>
          <div className="font-mono text-[9px] text-tertiary">Renews on 1 Nov 2026 · ₹2,499/month</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-tertiary mb-1">META WALLET</div>
          <div className="font-display text-xl text-accent">₹4,820</div>
          <button onClick={() => toast.success('Redirecting to Meta Cloud Wallet payment gateway...')} className="font-mono text-[9px] text-accent hover:text-accent-light">Recharge →</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {plans.map(p => (
          <div key={p.name}
            className={cn(
              "border p-4 flex flex-col rounded-md transition-colors",
              p.current 
                ? "border-accent bg-accent/5 shadow-xs" 
                : "border-border bg-surface-card hover:border-border-strong"
            )}>
            <div className="font-mono text-[9px] text-tertiary tracking-widest mb-1 uppercase font-semibold">{p.name}</div>
            <div className="font-display text-xl text-primary mb-1">
              {p.price ? `₹${p.price.toLocaleString()}` : 'Custom'}
            </div>
            {p.price && <div className="font-mono text-[9px] text-tertiary mb-3">/month</div>}
            <div className="space-y-1 text-[10px] text-secondary flex-1 font-mono">
              <div>{p.leads ? `${p.leads.toLocaleString()} leads` : 'Unlimited leads'}</div>
              <div>{p.agents ? `${p.agents} agents` : 'Unlimited agents'}</div>
            </div>
            {!p.current && (
              <button 
                onClick={() => toast.success(`Selected ${p.name} plan upgrade`)}
                className="mt-3 w-full py-1.5 border border-border font-mono text-[9px] text-tertiary hover:border-accent hover:text-accent transition-colors rounded-sm"
              >
                {p.price ? 'Upgrade' : 'Contact Sales'}
              </button>
            )}
            {p.current && (
              <div className="mt-3 flex items-center gap-1 font-mono text-[9px] text-accent font-semibold">
                <CheckIcon size={10} strokeWidth={2.5} /> Current Plan
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <div className="font-mono text-[10px] text-tertiary tracking-widest mb-3 uppercase">PAYMENT HISTORY</div>
        <div className="border border-border overflow-hidden rounded-md bg-surface-card shadow-sm">
          {[
            { date: '1 Oct 2026', amount: '₹2,499', desc: 'Growth Plan — Monthly', status: 'Paid' },
            { date: '1 Sep 2026', amount: '₹2,499', desc: 'Growth Plan — Monthly', status: 'Paid' },
            { date: '5 Sep 2026', amount: '₹5,000', desc: 'Meta Wallet Recharge', status: 'Paid' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm text-primary">{row.desc}</div>
                <div className="font-mono text-[9px] text-tertiary">{row.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-accent font-semibold">{row.amount}</span>
                <span className="font-mono text-[9px] px-2 py-0.5 text-success border border-success/20 bg-success/10 rounded-sm">
                  {row.status}
                </span>
                <button onClick={() => toast.success(`Downloading tax invoice for ${row.date}`)} className="font-mono text-[9px] text-tertiary hover:text-primary">PDF</button>
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
    Owner: 'text-accent', OWNER: 'text-accent',
    Manager: 'text-info', MANAGER: 'text-info',
    Agent: 'text-secondary', AGENT: 'text-secondary',
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
      toast.error('Please enter advisor name and email address')
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
      toast.success(`Advisor invited! Temporary password: ${res.temporaryPassword || 'anchor123'}`)
      setInviteSuccess(`Invited! Temp password: ${res.temporaryPassword || 'anchor123'}`)
      setTimeout(() => {
        setInviteSuccess(null)
        setShowInviteModal(false)
        setInviteName('')
        setInviteEmail('')
        setInvitePhone('')
      }, 3000)
    } catch (err: any) {
      toast.error('Failed to invite member: ' + err.message)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 px-4">
          <div className="bg-surface-card border border-border-strong w-full max-w-md p-6 space-y-4 rounded-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="font-mono text-[10px] text-accent tracking-widest font-semibold">INVITE TEAM ADVISOR</div>
              <button onClick={() => setShowInviteModal(false)} className="text-tertiary hover:text-primary font-mono text-sm">×</button>
            </div>

            <div>
              <label className={lbl}>FULL NAME</label>
              <input className={inp} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Divya Nair" />
            </div>

            <div>
              <label className={lbl}>WORK EMAIL</label>
              <input className={inp} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="e.g. divya@business.com" />
            </div>

            <div>
              <label className={lbl}>PHONE NUMBER (WHATSAPP)</label>
              <input className={inp} type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} placeholder="+91 98000 12345" />
            </div>

            <div>
              <label className={lbl}>ROLE & PERMISSIONS</label>
              <select className={inp + ' cursor-pointer'} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="AGENT">Sales Agent (Masked Numbers, Assigned Chats)</option>
                <option value="MANAGER">Sales Manager (Team Routing, Full Reports)</option>
                <option value="OWNER">Organization Owner (Full Admin & Billing)</option>
              </select>
            </div>

            {inviteSuccess && (
              <div className="p-3 bg-success/10 border border-success/20 font-mono text-[10px] text-success rounded-sm">
                {inviteSuccess}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-border font-mono text-[10px] text-tertiary hover:text-primary transition-colors rounded-sm">Cancel</button>
              <button onClick={handleInvite} disabled={isInviting} className="flex-1 py-2.5 bg-accent text-black font-mono text-[10px] font-semibold tracking-wide hover:bg-accent-light transition-colors rounded-sm flex items-center justify-center gap-1.5">
                {isInviting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] text-tertiary">{members.length} members · Unlimited seats on Growth Plan</div>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-accent text-black font-mono text-[10px] font-semibold tracking-wide hover:bg-accent-light transition-colors flex items-center gap-1.5 rounded-sm">
          <TeamIcon size={12} strokeWidth={2} /> Invite Member
        </button>
      </div>

      <div className="border border-border overflow-hidden rounded-md bg-surface-card shadow-sm">
        <div className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-2.5 border-b border-border font-mono text-[9px] text-tertiary tracking-widest gap-4 uppercase bg-surface-sub">
          <span>MEMBER</span><span>ROLE</span><span>ACTIVE LEADS</span><span>STATUS</span>
        </div>
        {members.map((m, i) => (
          <div key={m.id || i} className="grid grid-cols-[1fr_auto_auto_auto] px-4 py-3 border-b border-border/50 last:border-0 items-center gap-4">
            <div>
              <div className="text-xs font-medium text-primary">{m.name}</div>
              <div className="font-mono text-[9px] text-tertiary">{m.email}</div>
            </div>
            <select
              className={cn("bg-surface-sub border border-border font-mono text-[10px] px-2 py-1 focus:outline-none focus:border-accent cursor-pointer rounded-sm", roleColors[m.role] || 'text-primary')}
              defaultValue={m.role}
            >
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Agent">Agent</option>
            </select>
            <span className="font-mono text-xs text-primary text-center font-semibold">{m.leads}</span>
            <span className={cn(
              "font-mono text-[9px] px-2 py-0.5 rounded-sm border",
              m.status === 'Active' 
                ? "text-success border-success/20 bg-success/10" 
                : "text-warning border-warning/20 bg-warning/10"
            )}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Settings export
type SettingsTab = 'profile' | 'organization' | 'billing' | 'team'

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
      {/* Vercel-style sliding pill tabs */}
      <div className="flex gap-1.5 p-1 bg-surface-sub rounded-md border border-border mb-6 -mt-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => {
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative z-10 px-4 py-1.5 font-mono text-[11px] font-medium rounded-sm transition-colors whitespace-nowrap",
                isActive ? "text-black font-semibold" : "text-tertiary hover:text-primary hover:bg-surface-hover/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-settings-tab"
                  className="absolute inset-0 bg-accent rounded-sm -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              {t.label}
            </button>
          )
        })}
      </div>
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'organization' && <OrgSettings />}
      {activeTab === 'billing' && <Billing />}
      {activeTab === 'team' && <TeamManagement />}
    </div>
  )
}
