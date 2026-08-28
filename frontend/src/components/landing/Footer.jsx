export const Footer = () => {
  return (
    <footer style={{background:'#0A0A0A', borderTop:'1px solid #1A1A1A'}}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs" style={{background:'#5E17EB', color:'#FFFFFB'}}>α</div>
              <span className="text-sm font-bold" style={{color:'#FFFFFB'}}>Alpha Agency</span>
              <span className="text-xs" style={{color:'#777777'}}>• alphatekx.name.ng</span>
            </div>
            <p className="text-sm leading-6 mt-3" style={{color:'#999999'}}>The invisible OS for modern agencies. Find. Create. Send. Prove. Quietly excellent.</p>
            <p className="text-xs mt-3" style={{color:'#555555'}}>© {new Date().getFullYear()} AlphaTekx • Built in Lagos & London • SOC-2 ready • Real data only</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-xs flex-1 lg:justify-end">
            <div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{color:'#FFFFFB'}}>Product</div>
              <ul className="mt-3 space-y-2" style={{color:'#999999'}}>
                <li><a href="#features" className="hover:underline" style={{color:'#999999'}}>Features</a></li>
                <li><a href="#pricing" className="hover:underline" style={{color:'#999999'}}>Pricing</a></li>
                <li><a href="/dashboard" className="hover:underline" style={{color:'#5E17EB'}}>Open OS →</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{color:'#FFFFFB'}}>Proof</div>
              <ul className="mt-3 space-y-2" style={{color:'#999999'}}>
                <li><a href="/outcomes" className="hover:underline" style={{color:'#999999'}}>Outcomes</a></li>
                <li><a href="/client" className="hover:underline" style={{color:'#999999'}}>Client view</a></li>
                <li><a href="/analytics" className="hover:underline" style={{color:'#999999'}}>Analytics</a></li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{color:'#FFFFFB'}}>Company</div>
              <ul className="mt-3 space-y-2" style={{color:'#999999'}}>
                <li><a href="mailto:alphatekxcompany@gmail.com" className="hover:underline" style={{color:'#999999'}}>alphatekxcompany@gmail.com</a></li>
                <li><a href="#" className="hover:underline" style={{color:'#999999'}}>Privacy • Terms</a></li>
                <li><span style={{color:'#555555'}}>30-day refund</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
