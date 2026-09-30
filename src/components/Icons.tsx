interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
  color?: string
}

const base = (size: number, sw: number, children: React.ReactNode, extra?: string) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={extra}
    aria-hidden
  >
    {children}
  </svg>
)

// ── Brand
export const AnchorIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="12" cy="8" r="3" />
    <line x1="12" y1="11" x2="12" y2="21" />
    <path d="M5 16c0 2 3 5 7 5s7-3 7-5" />
    <line x1="5" y1="16" x2="19" y2="16" />
  </>, className
)

// ── Speed / Auto-reply
export const BoltIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <path d="M13 2L4.09 12.96a.5.5 0 0 0 .41.8H11l-1 8.24L20 11.04a.5.5 0 0 0-.41-.8H13L13 2z" />, className
)

// ── Location / Site visit
export const PinIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M12 21C12 21 5 14 5 9a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </>, className
)

// ── Measurements / Carpet area
export const RulerIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <rect x="2" y="6" width="20" height="12" rx="1" />
    <line x1="6" y1="10" x2="6" y2="14" />
    <line x1="10" y1="10" x2="10" y2="13" />
    <line x1="14" y1="10" x2="14" y2="13" />
    <line x1="18" y1="10" x2="18" y2="14" />
  </>, className
)

// ── Home / Ready to move
export const HomeIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" />
    <path d="M9 21V12h6v9" />
  </>, className
)

// ── Payment / Cheque
export const ChequeIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <rect x="2" y="5" width="20" height="14" rx="1.5" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
    <line x1="14" y1="15" x2="18" y2="15" />
  </>, className
)

// ── Budget / Rupee
export const RupeeIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <line x1="7" y1="6" x2="17" y2="6" />
    <line x1="7" y1="11" x2="17" y2="11" />
    <line x1="7" y1="6" x2="7" y2="18" />
    <path d="M7 11c5 0 9 0 9-2.5S12 6 7 6" />
    <line x1="7" y1="11" x2="17" y2="18" />
  </>, className
)

// ── Inbox / Messages
export const InboxIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M2 12l3-7h14l3 7" />
    <rect x="2" y="12" width="20" height="9" rx="1" />
    <path d="M8 17h8" />
  </>, className
)

// ── Analytics / Chart
export const AnalyticsIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <line x1="4" y1="20" x2="4" y2="10" />
    <line x1="9" y1="20" x2="9" y2="4" />
    <line x1="14" y1="20" x2="14" y2="14" />
    <line x1="19" y1="20" x2="19" y2="8" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </>, className
)

// ── Drip / Flow sequence
export const FlowIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="5" cy="6" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="18" r="2" />
    <line x1="7" y1="7" x2="10" y2="11" />
    <line x1="14" y1="13" x2="17" y2="17" />
  </>, className
)

// ── Templates / Document
export const TemplateIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="12" y2="15" />
  </>, className
)

// ── Team / Person
export const TeamIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="9" cy="7" r="3" />
    <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
    <circle cx="18" cy="7" r="2" />
    <path d="M20 16h2a3 3 0 0 1 0 6" />
  </>, className
)

// ── Settings / Gear
export const SettingsIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </>, className
)

// ── Bell / Notification
export const BellIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>, className
)

// ── Lock / Security
export const LockIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <rect x="5" y="11" width="14" height="11" rx="1" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1.5" />
  </>, className
)

// ── Send / Arrow
export const SendIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
  </>, className
)

// ── Search
export const SearchIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" />
  </>, className
)

// ── Check / Verified
export const CheckIcon = ({ size = 16, strokeWidth = 2, className = '' }: IconProps) => base(size, strokeWidth,
  <polyline points="20 6 9 17 4 12" />, className
)

// ── Arrow right
export const ArrowRightIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>, className
)

// ── Tag
export const TagIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </>, className
)

// ── Transfer / Assign
export const TransferIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </>, className
)

// ── Clock / Time
export const ClockIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>, className
)

// ── Warning / Alert
export const WarningIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>, className
)

// ── India flag block (text, not emoji)
export const IndiaFlagBlock = () => (
  <span className="inline-flex items-center gap-1 font-mono text-sm text-[#6B6B6B]">
    <span className="inline-flex w-5 h-4 overflow-hidden flex-shrink-0" style={{ borderRadius: 1 }}>
      <span className="flex-1 bg-[#FF9933]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[#138808]" />
    </span>
    +91
  </span>
)

// ── Rupee symbol (text)
export const RupeeSymbol = ({ className = '' }: { className?: string }) => (
  <span className={className}>₹</span>
)

// ── Flame / Hot lead indicator (geometric)
export const HotIcon = ({ size = 10, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" className={className} aria-hidden>
    <path d="M6 1C6 1 4 3.5 4 5.5C4 4.5 5 4 5 4C5 5 3.5 6.5 3.5 8C3.5 9.93 4.57 11 6 11C7.93 11 9 9.5 9 8C9 5.5 6 1 6 1Z"
      opacity="0.9" />
  </svg>
)

// ── Checkmark double (WhatsApp delivered)
export const DoubleCheck = ({ className = '' }: { className?: string }) => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden>
    <polyline points="1 5 4 8 10 2" />
    <polyline points="5 5 8 8 14 2" />
  </svg>
)

// ── Keyboard shortcut key
export const CmdIcon = ({ size = 12, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className={className} aria-hidden>
    <path d="M3 1.5a1.5 1.5 0 1 0 0 3H4.5V3A1.5 1.5 0 0 0 3 1.5zM4.5 7.5H3a1.5 1.5 0 1 0 1.5 1.5V7.5zM7.5 4.5H9a1.5 1.5 0 1 0-1.5-1.5V4.5zM9 7.5H7.5V9A1.5 1.5 0 1 0 9 7.5zM4.5 4.5h3v3h-3z" />
  </svg>
)

// ── Globe / Map pin for location
export const MapPinIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <path d="M12 22C12 22 3 16 3 9a9 9 0 0 1 18 0c0 7-9 13-9 13z" />
    <circle cx="12" cy="9" r="3" />
  </>, className
)

// ── Payment card
export const CardIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="9" y2="15" />
  </>, className
)

// ── Slash command
export const SlashIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <line x1="16" y1="4" x2="8" y2="20" />, className
)

// ── Quote open (for testimonials)
export const QuoteIcon = ({ size = 24, className = '' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4 4h5v5H4v5H0V9C0 6.2 1.8 4 4 4zm12 0h5v5h-5v5h-4V9c0-2.8 1.8-5 4-5z" opacity="0.9" />
  </svg>
)

// ── Shield / Security
export const ShieldIcon = ({ size = 16, strokeWidth = 1.5, className = '' }: IconProps) => base(size, strokeWidth,
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, className
)

