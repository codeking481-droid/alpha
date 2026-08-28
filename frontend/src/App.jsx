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
import Approvals from "./pages/Approvals.jsx"
import CommandPalette from "./components/ui/CommandPalette.jsx"
import Onboarding from "./components/ui/Onboarding.jsx"
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx"
import { Toast } from "./components/ui/Toast.jsx"
import { Spinner } from "./components/ui/Spinner.jsx"
import { logger } from "./lib/logger.js"

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
  const base = "relative px-3 sm:px-4 py-2.5 text-xs font-medium transition min-h-[44px] flex items-center"
  const fullLinks = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/content", label: "Content" },
    { to: "/outreach", label: "Outreach" },
    { to: "/approvals", label: "Approvals" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/analytics", label: "Analytics" },
    { to: "/deals", label: "Deals" },
  ];
  const publicLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/auth", label: "Sign up" },
    { to: "/access-code", label: "Access" },
  ];
  const links = hasAccess ? fullLinks : publicLinks;
  return (
    <nav className="sticky top-0 z-50 border-b" style={{background:'#FFFFFB', borderColor:'#EAEAEA'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0" style={{background:'#5E17EB'}}>α</div>
          <span className="font-bold tracking-tight text-sm truncate" style={{color:'#0A0A0A'}}>ALPHA</span>
          <span className="hidden lg:inline text-xs font-medium px-2 py-1 rounded-full" style={{background:'rgba(94,23,235,0.08)', color:'#5E17EB'}}>OS • v1.0</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 ml-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `${base} rounded-lg ${isActive ? "text-white" : "hover:bg-gray-50"}`} style={({ isActive }) => isActive ? {background:'#5E17EB', color:'#FFFFFB'} : {color:'#555555'}}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasAccess ? <CommandPalette /> : <a href="/auth" className="hidden sm:inline-flex px-4 py-2 rounded-lg font-semibold text-sm" style={{background:'#0A0A0A', color:'#FFFFFB'}}>Sign up →</a>}
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium" style={{color:'#5E17EB'}}><span className="w-2 h-2 rounded-full" style={{background:'#5E17EB'}}/> {hasAccess ? 'Private' : 'Public'}</span>
          {!hasAccess && <a href="/checkout?price=50" className="hidden sm:inline-flex px-4 py-2 rounded-lg font-bold text-xs" style={{background:'#5E17EB', color:'#FFFFFB'}}>Buy $50</a>}
          <button onClick={() => setOpen(!open)} className="lg:hidden w-11 h-11 rounded-lg flex items-center justify-center border" style={{borderColor:'#EAEAEA', color:'#0A0A0A'}} aria-label="Menu">
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t" style={{background:'#FFFFFB', borderColor:'#EAEAEA'}}>
          <div className="px-4 py-3 grid gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium flex items-center" style={({ isActive }) => isActive ? {background:'#5E17EB', color:'#FFFFFB'} : {background:'#FAFAFA', color:'#555555', border:'1px solid #EAEAEA'}}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default function App() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type='success') => setToast({ message, type });
  const hideToast = () => setToast(null);
  useEffect(()=>{ window.showAlphaToast = showToast; window.AlphaLogger = logger; }, []);
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
          window.location.reload()
        }
      }
    } catch {
      keys.forEach((k) => localStorage.removeItem(k))
    }
    logger.log('Alpha Agency mounted', { hasAccess: !!localStorage.getItem('alpha.token') });
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen" style={{background:'#FFFFFB'}}>
          <TopNav />
          <Onboarding />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/access-code" element={<AccessCode />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/content" element={<ProtectedRoute><ContentStudio /></ProtectedRoute>} />
              <Route path="/outreach" element={<ProtectedRoute><OutreachEngine /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/deals" element={<ProtectedRoute><DealDesk /></ProtectedRoute>} />
              <Route path="/outcomes" element={<ProtectedRoute><Outcomes /></ProtectedRoute>} />
              <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
              <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminCodes /></AdminRoute>} />
            </Routes>
          {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
