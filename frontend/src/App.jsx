import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx"
import ContentStudio from "./pages/ContentStudio.jsx"
import OutreachEngine from "./pages/OutreachEngine.jsx"
import Analytics from "./pages/Analytics.jsx"
import DealDesk from "./pages/DealDesk.jsx"

function TopNav() {
  const base = "relative px-4 py-2 text-xs font-black tracking-widest uppercase transition-all duration-300"
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0215]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-amber-500 flex items-center justify-center text-[#0B0215] font-black text-sm shadow-gold">α</div>
          <span className="hidden sm:inline font-black tracking-tight text-white text-sm">ALPHA AGENCY</span>
          <span className="hidden lg:inline text-xs text-white/20 tracking-widest uppercase font-bold ml-2">• $5K/MO TOOL</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
            {({ isActive }) => (
              <span className="relative">
                🚀 Command Hub
                {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
              </span>
            )}
          </NavLink>
          <NavLink to="/content" className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
            {({ isActive }) => (
              <span className="relative">
                ✍️ Content
                {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
              </span>
            )}
          </NavLink>
          <NavLink to="/outreach" className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
            {({ isActive }) => (
              <span className="relative">
                📧 Outreach
                {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
              </span>
            )}
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
            {({ isActive }) => (
              <span className="relative">
                📊 Analytics
                {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
              </span>
            )}
          </NavLink>
          <NavLink to="/deals" className={({ isActive }) => `${base} ${isActive ? "text-[#FFD700]" : "text-white/60 hover:text-[#FFD700]"}`}>
            {({ isActive }) => (
              <span className="relative">
                💰 Deal Desk
                {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#FFD700] rounded-full shadow-gold"></span>}
              </span>
            )}
          </NavLink>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/> Online</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-sm border border-white/10">👑</div>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0215] animate-fadeIn">
        <TopNav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content" element={<ContentStudio />} />
          <Route path="/outreach" element={<OutreachEngine />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/deals" element={<DealDesk />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
