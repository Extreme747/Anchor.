import { useRouter } from '../router'

export default function Footer() {
  const { navigate } = useRouter()

  return (
    <footer className="border-t border-white/8 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <button onClick={() => navigate('home')} className="font-display text-2xl text-[#F0EDE8] mb-3 text-left">
              Anchor<span className="text-[#C8953A]">.</span>
            </button>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs">
              The WhatsApp follow-up and revenue recovery machine for India's fastest sales teams.
            </p>
            <div className="mt-6 font-mono text-xs text-[#6B6B6B]">Made for India's high-ticket SMBs.</div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest uppercase mb-4">Product</div>
            <div className="space-y-2">
              {[
                { label: 'Dashboard', page: 'dashboard' as const },
                { label: 'Product Deep-Dive', page: 'product' as const },
                { label: 'Onboarding', page: 'onboarding' as const },
              ].map(l => (
                <button key={l.label} onClick={() => navigate(l.page)} className="block text-sm text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest uppercase mb-4">Company</div>
            <div className="space-y-2">
              {[
                { label: 'About', page: 'about' as const },
                { label: 'Blog', page: 'blog' as const },
                { label: 'Changelog', page: 'changelog' as const },
              ].map(l => (
                <button key={l.label} onClick={() => navigate(l.page)} className="block text-sm text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] text-[#6B6B6B] tracking-widest uppercase mb-4">Legal</div>
            <div className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Meta Partner Program'].map(item => (
                <a key={item} href="#" className="block text-sm text-[#6B6B6B] hover:text-[#F0EDE8] transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs text-[#6B6B6B]">© 2026 Anchor Technologies Pvt Ltd. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#6B6B6B]">
            <span>Meta Cloud API Partner</span>
            <span className="w-px h-3 bg-white/10" />
            <span>0% Markup on Meta Fees</span>
            <span className="w-px h-3 bg-white/10" />
            <span>ISO 27001 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
