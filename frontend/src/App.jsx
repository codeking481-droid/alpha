import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, NavLink, Link, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx"
import ContentStudio from "./pages/ContentStudio.jsx"
import OutreachEngine from "./pages/OutreachEngine.jsx"
import Analytics from "./pages/Analytics.jsx"
import DealDesk from "./pages/DealDesk.jsx"
import Outcomes from "./pages/Outcomes.jsx"
import ClientDashboard from "./pages/ClientDashboard.jsx"
import Landing from "./pages/Landing.jsx"
import Platform from "./pages/Platform.jsx"
import PricingPage from "./pages/PricingPage.jsx"
import Auth from "./pages/Auth.jsx"
import AccessCode from "./pages/AccessCode.jsx"
import Signup from "./pages/Signup.jsx"
import Legal from "./pages/Legal.jsx"
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
  // Brand law: 12px uppercase, gray, violet dot on active
  const publicLinks = [
    { to: "/platform", label: "Platform" },
    { to: "/pricing", label: "Pricing" },
    { to: "/access", label: "Access" },
  ];
  const privateLinks = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/platform", label: "Platform" },
    { to: "/pricing", label: "Pricing" },
  ];
  const links = hasAccess ? privateLinks : publicLinks;
  return (
    <nav className="sticky top-0 z-50 border-b flex items-center" style={{height:'64px', background:'rgba(255,252,248,0.8)', borderColor:'#EDEDED', backdropFilter:'blur(8px)'}}>
      <div className="max-w-[1040px] mx-auto w-full px-6 flex items-center">
        <Link to="/" className="flex items-center gap-2" style={{textDecoration:'none'}}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{background:'#5E17EB', width:'32px', height:'32px', flexShrink:0}}>α</div>
          <span className="font-semibold" style={{color:'#0A0A0A', fontSize:'15px'}}>Alpha</span>
          <span className="hidden sm:inline-flex items-center gap-1.5" style={{color:'#6B7280', fontSize:'12px'}}><span style={{width:'4px', height:'4px', borderRadius:'999px', background:'#5E17EB', display:'inline-block'}} /> OS v1.0</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 mx-auto">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="flex items-center gap-1.5" style={({ isActive }) => ({color: isActive ? '#0A0A0A' : '#6B7280', fontSize:'11px', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em'})}>
              {({ isActive }) => (<><span className={isActive ? 'dot-violet' : ''} style={{width:isActive?'6px':'0', height:'6px', borderRadius:'999px'}} />{l.label}</>)}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {hasAccess ? <CommandPalette /> : <Link to="/access" className="hidden sm:inline-flex items-center justify-center" style={{color:'#6B7280', fontSize:'13px', fontWeight:500, padding:'0 12px', height:'36px', textDecoration:'none'}}>Sign in</Link>}
          <Link to={hasAccess ? "/dashboard" : "/signup"} className="inline-flex items-center justify-center font-semibold" style={{background:'#5E17EB', color:'#FFFFFF', borderRadius:'8px', height:'36px', padding:'0 16px', fontSize:'13px', textDecoration:'none'}}>
            Get Access
          </Link>
          <button onClick={() => setOpen(!open)} className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center" style={{border:'1px solid #EDEDED', color:'#0A0A0A'}} aria-label="Menu">
            <span className="text-base">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 border-b" style={{background:'#FFFCF8', borderColor:'#EDEDED'}}>
          <div className="px-6 py-3 grid gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-sm font-medium" style={({ isActive }) => isActive ? {background:'#5E17EB', color:'#FFFFFB'} : {color:'#6B7280'}}>
                {l.label}
              </NavLink>
            ))}
            <a href="/signup" className="mt-2 text-center font-semibold" style={{background:'#0A0A0A', color:'#FFFFFB', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px'}}>Get Access Token →</a>
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
        <div className="min-h-screen" style={{background:'#FFFCF8', overflowX:'hidden'}}>
          <TopNav />
          <Onboarding />
            <Routes>
              {/* New pure architecture */}
              <Route path="/" element={<Landing />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/access" element={<AccessCode />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/legal/:type" element={<Legal />} />
              {/* Legacy aliases */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/access-code" element={<AccessCode />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Protected OS */}
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
