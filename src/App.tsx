import { RouterProvider, useRouter } from './router'
import Nav from './components/Nav'
import Footer from './components/Footer'
import LiveDemoBar from './components/LiveDemoBar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import Product from './pages/Product'
import Changelog from './pages/Changelog'
import About from './pages/About'
import Blog from './pages/Blog'
import Auth from './pages/Auth'
import Legal from './pages/Legal'

function AppShell() {
  const { page } = useRouter()

  // Full-screen app pages (no nav/footer)
  if (page === 'login') return <Auth screen="login" />
  if (page === 'signup') return <Auth screen="signup" />
  if (page === 'forgot-password') return <Auth screen="forgot-password" />
  if (page === 'otp') return <Auth screen="otp" />
  if (page === 'onboarding') return <Onboarding />
  if (page === 'dashboard' || page.startsWith('dashboard/')) return <Dashboard />

  return (
    <div className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <Nav />
      <main>
        {page === 'home' && <Home />}
        {page === 'product' && <Product />}
        {page === 'changelog' && <Changelog />}
        {page === 'about' && <About />}
        {page === 'blog' && <Blog />}
        {(page === 'terms' || page === 'privacy' || page === 'refunds' || page === 'contact') && (
          <Legal section={page as any} />
        )}
      </main>
      <Footer />
      {page === 'home' && <LiveDemoBar />}
    </div>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AppShell />
    </RouterProvider>
  )
}
