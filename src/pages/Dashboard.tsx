import { useState, useEffect } from 'react'
import { Link, useRouter, type Page } from '../router'
import {
  Inbox as InboxIcon,
  BarChart3,
  GitBranch,
  FileText,
  Users,
  Settings as SettingsIcon,
  Bell,
  Anchor,
  Zap,
  CreditCard,
  ArrowLeft,
  Command,
} from 'lucide-react'
import Inbox from './Inbox'
import Settings from './Settings'
import Templates from './Templates'
import DripSequences from './Drip'
import Analytics from './Analytics'
import LeadsPage from './Leads'
import AutoReply from './AutoReply'
import Commerce from './Commerce'
import Routing from './Routing'
import Integrations from './Integrations'
import Protocol from './Protocol'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Kbd } from '@/components/ui/kbd'
import { CommandPalette } from '@/components/ui/command-palette'
import { KeyboardHint } from '@/components/ui/keyboard-hint'
import { ShortcutsModal } from '@/components/ui/shortcuts-modal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

// ── Sidebar nav items
const sidebarItems = [
  { id: 'inbox', icon: InboxIcon, label: 'Inbox', badge: '12' },
  { id: 'leads', icon: Users, label: 'Leads', badge: '4' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'drip', icon: GitBranch, label: 'Drip Engine', badge: '3' },
  { id: 'templates', icon: FileText, label: 'Templates' },
  { id: 'auto-reply', icon: Zap, label: 'Auto-Reply' },
  { id: 'commerce', icon: CreditCard, label: 'Flows & Commerce' },
  { id: 'routing', icon: Users, label: 'Routing & SLA' },
  { id: 'integrations', icon: Zap, label: 'Integrations Hub' },
  { id: 'protocol', icon: Anchor, label: 'Meta Protocol' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
]

// ── Tab content mapping
const tabContent: Record<string, React.ReactNode> = {
  leads: <LeadsPage />,
  analytics: <Analytics />,
  drip: <DripSequences />,
  templates: <Templates />,
  'auto-reply': <AutoReply />,
  commerce: <Commerce />,
  routing: <Routing />,
  integrations: <Integrations />,
  protocol: <Protocol />,
  settings: <Settings />,
}

export default function Dashboard() {
  const { page, navigate } = useRouter()

  const getTabFromPage = (p: string) => {
    if (p.startsWith('dashboard/')) {
      const tab = p.replace('dashboard/', '')
      if (tab === 'inbox' || tabContent[tab]) return tab
    }
    return 'inbox'
  }

  const [activeNav, setActiveNavState] = useState(() => getTabFromPage(page))
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)

  // Sync state if URL hash changes externally
  useEffect(() => {
    const tab = getTabFromPage(page)
    setActiveNavState(tab)
  }, [page])

  const setActiveNav = (tab: string) => {
    setActiveNavState(tab)
    navigate(('dashboard/' + tab) as Page)
  }

  // Global Keyboard Shortcuts (Cmd+K, Cmd+N, chords G->I, G->L, G->A, G->S, G->D)
  useKeyboardShortcuts({
    onNavigate: setActiveNav,
    onOpenCommandPalette: () => setIsCommandOpen(true),
  })

  // Listen for ? key to open keyboard shortcuts modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setIsShortcutsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Ambient mesh gradient background */}
      <div className="ambient-mesh" />

      {/* Sidebar */}
      <div className="relative z-10 w-14 md:w-52 flex-shrink-0 border-r border-border flex flex-col bg-surface-sub/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link to="home" className="font-display text-lg text-primary hidden md:block">
            Anchor<span className="text-accent">.</span>
          </Link>
          <span className="md:hidden text-accent">
            <Anchor size={20} strokeWidth={1.5} />
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {sidebarItems.map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-2.5 py-2 rounded-sm transition-all duration-150',
                  'text-left focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none',
                  isActive
                    ? 'bg-surface-hover text-primary'
                    : 'text-tertiary hover:text-secondary hover:bg-surface-hover/50'
                )}
              >
                <Icon size={16} strokeWidth={1.5} className="flex-shrink-0" />
                <span className="hidden md:block text-xs font-medium truncate">{item.label}</span>
                {item.badge && (
                  <span className="hidden md:flex ml-auto">
                    <Badge variant="gold" className="text-[8px] px-1.5 py-0">{item.badge}</Badge>
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Cmd+K hint */}
        <div 
          onClick={() => setIsCommandOpen(true)}
          className="hidden md:flex items-center gap-2 mx-3 mb-2 px-2.5 py-2 rounded-sm bg-surface-hover/50 border border-border cursor-pointer hover:border-border-strong transition-colors"
        >
          <Command size={12} className="text-tertiary" />
          <span className="text-[11px] text-tertiary">Search...</span>
          <span className="ml-auto"><Kbd keys={["⌘", "K"]} /></span>
        </div>

        {/* Agent avatar */}
        <div className="p-3 border-t border-border flex items-center gap-2.5">
          <Avatar name="Rahul Verma" status="online" size="sm" />
          <div className="hidden md:block min-w-0">
            <div className="text-xs text-primary truncate">Rahul Verma</div>
            <div className="font-mono text-[9px] text-tertiary">Agent · Online</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-canvas/80 backdrop-blur-xl">
          <div>
            <div className="text-sm font-medium text-primary capitalize">
              {activeNav.replace('-', ' ')}
            </div>
            <div className="font-mono text-[9px] text-tertiary">
              Anchor Dashboard · Beta
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Back link */}
            <Link to="home" className="flex items-center gap-1.5 font-mono text-[10px] text-tertiary hover:text-secondary transition-colors">
              <ArrowLeft size={12} />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            {/* Notification */}
            <button
              aria-label="Notifications (3 unread)"
              className="relative w-8 h-8 flex items-center justify-center rounded-sm border border-border text-tertiary hover:text-primary hover:bg-surface-hover transition-colors"
            >
              <Bell size={16} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent font-mono text-[8px] text-black flex items-center justify-center font-bold rounded-sm">
                3
              </span>
            </button>
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 border border-border rounded-sm px-2.5 py-1">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-success opacity-60 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-success" />
              </div>
              <span className="font-mono text-[9px] text-primary">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content area with AnimatePresence */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {activeNav === 'inbox' ? (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                <Inbox />
              </motion.div>
            ) : (
              <motion.div 
                key={activeNav}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="flex-1 overflow-y-auto p-4"
              >
                {tabContent[activeNav]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        onNavigate={setActiveNav}
      />

      {/* Keyboard Cheatsheet Modal (?) */}
      <ShortcutsModal
        open={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Keyboard Shortcuts Hint */}
      <KeyboardHint onOpenCommandPalette={() => setIsCommandOpen(true)} />
    </div>
  )
}
