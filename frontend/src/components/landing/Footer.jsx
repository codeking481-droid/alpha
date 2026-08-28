export const Footer = () => {
  return (
    <footer style={{background:'#0A0A0A', padding:'64px 0'}}>
      <div className="max-w-[1040px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{background:'#5E17EB'}}>α</div>
              <span className="font-semibold" style={{color:'#FFFFFB', fontSize:'14px'}}>Alpha Agency OS</span>
            </div>
            <p className="mt-3" style={{color:'#9CA3AF', fontSize:'13px', lineHeight:'1.6'}}>The invisible OS for modern agencies. Quietly excellent.</p>
            <p className="mt-3" style={{color:'#6B7280', fontSize:'12px'}}>© {new Date().getFullYear()} AlphaTekx • alphatekx.name.ng</p>
          </div>
          <div>
            <div style={{color:'#FFFFFF', fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>Product</div>
            <ul className="mt-3 space-y-2" style={{color:'#9CA3AF', fontSize:'13px'}}>
              <li><a href="/platform" className="hover:text-white hover:underline">Platform</a></li>
              <li><a href="/pricing" className="hover:text-white hover:underline">Pricing</a></li>
              <li><a href="/dashboard" className="hover:text-white hover:underline">Open OS</a></li>
            </ul>
          </div>
          <div>
            <div style={{color:'#FFFFFF', fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>Proof</div>
            <ul className="mt-3 space-y-2" style={{color:'#9CA3AF', fontSize:'13px'}}>
              <li><a href="/outcomes" className="hover:text-white hover:underline">Outcomes</a></li>
              <li><a href="/client" className="hover:text-white hover:underline">Client view</a></li>
              <li><a href="/analytics" className="hover:text-white hover:underline">Analytics</a></li>
            </ul>
          </div>
          <div>
            <div style={{color:'#FFFFFF', fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase'}}>Company</div>
            <ul className="mt-3 space-y-2" style={{color:'#9CA3AF', fontSize:'13px'}}>
              <li><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-white hover:underline">alphatekxcompany@gmail.com</a></li>
              <li><a href="/legal/privacy" className="hover:text-white hover:underline">Privacy</a> • <a href="/legal/terms" className="hover:text-white hover:underline">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
