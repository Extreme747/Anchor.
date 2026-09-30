import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type Page =
  | 'home' | 'product' | 'changelog' | 'about' | 'blog'
  | 'login' | 'signup' | 'forgot-password' | 'otp'
  | 'onboarding'
  | 'dashboard'
  | 'dashboard/inbox' | 'dashboard/analytics' | 'dashboard/drip'
  | 'dashboard/templates' | 'dashboard/team' | 'dashboard/settings'
  | 'dashboard/leads' | 'dashboard/auto-reply' | 'dashboard/commerce'
  | 'dashboard/routing' | 'dashboard/integrations' | 'dashboard/protocol'
  | 'settings/profile' | 'settings/organization' | 'settings/billing'
  | 'settings/team' | 'settings/notifications'
  | 'leads' | 'leads/detail' | 'leads/import'
  | 'automations' | 'automations/builder' | 'automations/templates'
  | 'analytics' | 'analytics/revenue' | 'analytics/agents' | 'analytics/attribution'
  | 'flows' | 'flows/builder'
  | 'payments'
  | 'integrations'
  | 'terms' | 'privacy' | 'refunds' | 'contact'
  | 'error'

const VALID: Page[] = [
  'home', 'product', 'changelog', 'about', 'blog',
  'login', 'signup', 'forgot-password', 'otp',
  'onboarding',
  'dashboard', 'dashboard/inbox', 'dashboard/analytics', 'dashboard/drip',
  'dashboard/templates', 'dashboard/team', 'dashboard/settings',
  'dashboard/leads', 'dashboard/auto-reply', 'dashboard/commerce',
  'dashboard/routing', 'dashboard/integrations', 'dashboard/protocol',
  'settings/profile', 'settings/organization', 'settings/billing',
  'settings/team', 'settings/notifications',
  'leads', 'leads/detail', 'leads/import',
  'automations', 'automations/builder', 'automations/templates',
  'analytics', 'analytics/revenue', 'analytics/agents', 'analytics/attribution',
  'flows', 'flows/builder',
  'payments',
  'integrations',
  'terms', 'privacy', 'refunds', 'contact',
  'error',
]

interface RouterCtx {
  page: Page
  params: Record<string, string>
  navigate: (p: Page, params?: Record<string, string>) => void
}

const Ctx = createContext<RouterCtx>({ page: 'home', params: {}, navigate: () => {} })

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#/', '') as Page
    return VALID.includes(hash) ? hash : 'home'
  })
  const [params, setParams] = useState<Record<string, string>>({})

  const navigate = useCallback((p: Page, ps: Record<string, string> = {}) => {
    setPage(p)
    setParams(ps)
    window.location.hash = p === 'home' ? '' : `/${p}`
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as Page
      if (VALID.includes(hash)) setPage(hash)
      else setPage('home')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return <Ctx.Provider value={{ page, params, navigate }}>{children}</Ctx.Provider>
}

export function useRouter() {
  return useContext(Ctx)
}

export function Link({
  to, children, className, style,
}: {
  to: Page; children: ReactNode; className?: string; style?: React.CSSProperties
}) {
  const { navigate } = useRouter()
  return (
    <a
      href={`#${to === 'home' ? '' : `/${to}`}`}
      className={className}
      style={style}
      onClick={e => { e.preventDefault(); navigate(to) }}
    >
      {children}
    </a>
  )
}
