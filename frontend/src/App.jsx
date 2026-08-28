import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx"
import ContentStudio from "./pages/ContentStudio.jsx"
import OutreachEngine from "./pages/OutreachEngine.jsx"
import Analytics from "./pages/Analytics.jsx"
import DealDesk from "./pages/DealDesk.jsx"
import Outcomes from "./pages/Outcomes.jsx"
import ClientDashboard from "./pages/ClientDashboard.jsx"
import Landing from "./pages/Landing.jsx"
import Auth from "./pages/Auth.jsx"
import AccessCode from "./pages/AccessCode.jsx"
import Checkout from "./pages/Checkout.jsx"
import AdminCodes from "./pages/AdminCodes.jsx"
import Campaigns from "./pages/Campaigns.jsx"
import CommandPalette from "./components/ui/CommandPalette.jsx"
import Onboarding from "./components/ui/Onboarding.jsx"

function ProtectedRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('alpha.token') : null;
  const granted = typeof window !== 'undefined' ? localStorage.getItem('alpha.access_granted') === '1' : false;
  if (!token) return <Navigate to="/auth" replace />;
  if (!granted) return <Navigate to="/access-code" replace />;
  return children;
}
function AdminRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('alpha.token') : null;
  const granted = typeof window !== 'undefined' ? localStorage.getItem('alpha.access_granted') === '1' : false;
  if (!token) return <Navigate to="/auth" replace />;
  if (!granted) return <Navigate to="/access-code" replace />;
  // allow only admin email additionally? keep simple: any granted can see admin, but backend enforces
  return children;
}

function TopNav() {
  const [open, setOpen] = useState(false)
  const [hasAccess, setHasAccess] = useState(false);
  useEffect(()=>{
    const check = () => {
      const t = localStorage.getItem('alpha.token');
      const g = localStorage.getItem('alpha.access_granted') === '1';
      setHasAccess(!!t && !!g);
    };
    check();
    window.addEventListener('storage', check);
    const id = setInterval(check, 1000);
    return ()=> { window.removeEventListener('storage', check); clearInterval(id); };
  }, []);
  const base = "relative px-3 sm:px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 min-h-[44px] flex items-center"
  const fullLinks = [
    { to: "/dashboard", label: "🚀 Command Hub", end: true },
    { to: "/content", label: "✍️ Content" },
    { to: "/outreach", label: "📧 Outreach" },
    { to: "/analytics", label: "📊 Analytics" },
    { to: "/deals", label: "💰 Deal Desk" },
    { to: "/outcomes", label: "📊 Outcomes" },
    { to: "/client", label: "👁️ Client" },
    { to: "/campaigns", label: "⬢ Campaigns" },
  ];
  const publicLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/auth", label: "Sign up" },
    { to: "/access-code", label: "Access" },
  ];
  const links = hasAccess ? fullLinks : publicLinks;
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0215]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-amber-500 flex items-center justify-center text-[#0B0215] font-black text-sm shadow-gold shrink-0">α</div>
          <span className="font-black tracking-tight text-white text-sm truncate">ALPHA</span>
          <span className="hidden lg:inline text-xs text-white/20 tracking-widest uppercase font-bold ml-1">• $5K/MO</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 ml-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
              {({ isActive }) => (
                <span className="relative whitespace-nowrap">
                  {l.label}
                  {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          {hasAccess ? <CommandPalette /> : <a href="/auth" className="hidden sm:inline-flex px-4 py-2 rounded-full bg-white text-[#0B0215] font-black text-xs tracking-widest uppercase">Sign up →</a>}
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> {hasAccess ? 'Private' : 'Public'}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-sm border border-white/10 shrink-0">👑</div>
          {!hasAccess && <a href="/checkout?price=50" className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase">Buy $50</a>}
          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden w-11 h-11 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition shrink-0" aria-label="Menu">
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#0B0215] animate-fadeIn">
          <div className="px-4 py-3 grid gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-black tracking-widest uppercase flex items-center transition min-h-[48px] ${isActive ? "bg-[#FFD700] text-[#0B0215]" : "bg-white/[0.04] text-white/70 border border-white/5 hover:bg-white/[0.08]"}`}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
              <span>5 badges • Premium OS</span>
              <span className="text-emerald-400 font-bold">● System Live</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default function App() {
  // 🧹 Kill ALL mock data forever — clears old Genesis/Dominion/AlphaTekX on load
  useEffect(() => {
    const keys = ['alpha.companies', 'alpha.content', 'alpha.campaigns', 'alpha.invoices', 'alpha.contracts', 'alpha.clients', 'alpha.leads', 'alpha.replies', 'alpha.drafts', 'alpha.activities', 'alpha.team']
    try {
      const raw = localStorage.getItem('alpha.companies')
      if (raw) {
        const parsed = JSON.parse(raw)
        const hasMock = parsed.some && parsed.some((c) => ['Genesis', 'Dominion', 'AlphaTek X', 'AlphaTek', 'Venture Labs', 'Paystack Alumni Co', 'Dominion Labs'].includes(c.name) || ['Genesis', 'Dominion', 'AlphaTek X'].includes(c.company))
        if (hasMock) {
          keys.forEach((k) => localStorage.removeItem(k))
          localStorage.removeItem('alpha.onboardingDismissed')
          // also clear any mock with launch
          window.location.reload()
        }
      }
    } catch {
      // if parsing fails, clear everything
      keys.forEach((k) => localStorage.removeItem(k))
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0215] animate-fadeIn overflow-x-hidden">
        <TopNav />
        <Onboarding />
        <Routes>
          {/* Public — no auth needed */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/access-code" element={<AccessCode />} />
          <Route path="/checkout" element={<Checkout />} />
          {/* Protected — requires login + access token */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute><ContentStudio /></ProtectedRoute>} />
          <Route path="/outreach" element={<ProtectedRoute><OutreachEngine /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/deals" element={<ProtectedRoute><DealDesk /></ProtectedRoute>} />
          <Route path="/outcomes" element={<ProtectedRoute><Outcomes /></ProtectedRoute>} />
          <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminCodes /></AdminRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
