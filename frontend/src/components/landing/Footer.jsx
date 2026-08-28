export const Footer = () => {
  return (
    <footer style={{background:'#0A0A0A', padding:'64px 0'}}>
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{background:'#5E17EB'}}>α</div>
              <span className="font-semibold" style={{color:'#FFFFFB'}}>Alpha Agency OS</span>
            </div>
            <p className="text-sm mt-3" style={{color:'#9CA3AF'}}>The invisible OS for modern agencies. Quietly excellent.</p>
            <p className="text-xs mt-3" style={{color:'#6B7280'}}>© {new Date().getFullYear()} AlphaTekx • alphatekx.name.ng</p>
          </div>
          <div>
            <div className="label" style={{color:'#9CA3AF'}}>Product</div>
            <ul className="mt-3 space-y-2 text-sm" style={{color:'#9CA3AF'}}>
              <li><a href="/platform" className="hover:underline">Platform</a></li>
              <li><a href="/pricing" className="hover:underline">Pricing</a></li>
              <li><a href="/dashboard" className="hover:underline">Open OS</a></li>
            </ul>
          </div>
          <div>
            <div className="label" style={{color:'#9CA3AF'}}>Proof</div>
            <ul className="mt-3 space-y-2 text-sm" style={{color:'#9CA3AF'}}>
              <li><a href="/outcomes" className="hover:underline">Outcomes</a></li>
              <li><a href="/client" className="hover:underline">Client view</a></li>
              <li><a href="/analytics" className="hover:underline">Analytics</a></li>
            </ul>
          </div>
          <div>
            <div className="label" style={{color:'#9CA3AF'}}>Company</div>
            <ul className="mt-3 space-y-2 text-sm" style={{color:'#9CA3AF'}}>
              <li><a href="mailto:alphatekxcompany@gmail.com">alphatekxcompany@gmail.com</a></li>
              <li><a href="/legal/privacy">Privacy</a> • <a href="/legal/terms">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
