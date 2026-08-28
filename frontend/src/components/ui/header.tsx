import { NavLink, Link } from "react-router-dom"
import { useState, useEffect } from "react"

export function Header() {
  const [hasAccess, setHasAccess] = useState(false)
  useEffect(()=>{
    const check=()=> setHasAccess(!!localStorage.getItem('alpha.token') && localStorage.getItem('alpha.access_granted')==='1')
    check(); const id=setInterval(check,1000); return()=>clearInterval(id)
  },[])
  const isActive = (path:string) => window.location.pathname===path
  return (
    <header className="sticky top-0 z-50 h-16 border-b flex items-center" style={{background:'rgba(255,252,248,0.8)', borderColor:'#EDEDED', backdropFilter:'blur(8px)'}}>
      <div className="max-w-[1120px] mx-auto w-full px-6 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{background:'#5E17EB'}}>α</div>
          <span className="font-semibold" style={{color:'#0A0A0A'}}>Alpha</span>
          <span className="text-xs" style={{color:'#6B7280'}}>• OS v1.0</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 mx-auto">
          {[
            {to:'/platform', label:'Platform'},
            {to:'/pricing', label:'Pricing'},
            {to:'/access', label:'Access'},
          ].map(l=>(
            <NavLink key={l.to} to={l.to} className="text-xs font-medium uppercase tracking-wide flex items-center gap-1.5" style={{color: isActive(l.to) ? '#0A0A0A' : '#6B7280', letterSpacing:'0.08em'}}>
              {isActive(l.to) && <span className="dot-violet" />}
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {!hasAccess && <Link to="/access" className="btn-ghost hidden sm:inline-flex">Sign in</Link>}
          <Link to={hasAccess ? "/dashboard" : "/signup"} className="btn-primary" style={{background:'#0A0A0A', height:'36px', borderRadius:'8px', padding:'0 16px', fontSize:'13px'}}>
            Get Access
          </Link>
        </div>
      </div>
    </header>
  )
}
export default Header
