export const Footer = () => {
  return (
    <footer style={{background:'#FFFCF8', borderTop:'1px solid #EDEDED', padding:'80px 0 64px'}}>
      <div className="max-w-[1040px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{background:'#5E17EB'}}>α</div>
              <span className="font-semibold" style={{color:'#0A0A0A', fontSize:'15px'}}>Alpha Agency OS</span>
            </div>
            <p className="mt-3" style={{color:'#6B7280', fontSize:'14px', lineHeight:'1.6'}}>The invisible OS for modern agencies. Quietly excellent. Built to scale for millions.</p>
            <p className="mt-3" style={{color:'#9CA3AF', fontSize:'12px'}}>© {new Date().getFullYear()} AlphaTekx • alphatekx.name.ng</p>
          </div>
          <div>
            <div style={{color:'#0A0A0A', fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>Product</div>
            <ul className="mt-3 space-y-2" style={{color:'#6B7280', fontSize:'13px'}}>
              <li><a href="/platform" className="hover:underline" style={{color:'#6B7280'}}>Platform</a></li>
              <li><a href="/pricing" className="hover:underline" style={{color:'#6B7280'}}>Pricing</a></li>
              <li><a href="/dashboard" className="hover:underline" style={{color:'#0A0A0A', fontWeight:500}}>Open OS →</a></li>
            </ul>
          </div>
          <div>
            <div style={{color:'#0A0A0A', fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>Proof</div>
            <ul className="mt-3 space-y-2" style={{color:'#6B7280', fontSize:'13px'}}>
              <li><a href="/outcomes" className="hover:underline" style={{color:'#6B7280'}}>Outcomes</a></li>
              <li><a href="/client" className="hover:underline" style={{color:'#6B7280'}}>Client view</a></li>
              <li><a href="/analytics" className="hover:underline" style={{color:'#6B7280'}}>Analytics</a></li>
            </ul>
          </div>
          <div>
            <div style={{color:'#0A0A0A', fontSize:'11px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>Company</div>
            <ul className="mt-3 space-y-2" style={{color:'#6B7280', fontSize:'13px'}}>
              <li><a href="mailto:alphatekxcompany@gmail.com" className="hover:underline" style={{color:'#6B7280'}}>alphatekxcompany@gmail.com</a></li>
              <li><a href="/legal/privacy" className="hover:underline" style={{color:'#6B7280'}}>Privacy</a> • <a href="/legal/terms" className="hover:underline" style={{color:'#6B7280'}}>Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
