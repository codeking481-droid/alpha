export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0B0215]">
      <div className="max-w-[1160px] mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white text-[#0B0215] flex items-center justify-center font-black text-xs">α</div>
              <span className="eyebrow text-white">Alpha Agency</span>
              <span className="text-[11px] text-white/20">• alphatekx.name.ng</span>
            </div>
            <p className="text-sm leading-6 text-white/40 mt-3">The invisible OS for modern agencies. Find. Create. Send. Prove. Quietly excellent.</p>
            <p className="text-xs text-white/20 mt-3">© {new Date().getFullYear()} AlphaTekx • Built in Lagos & London • SOC-2 ready • Real data only</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-xs flex-1 lg:justify-end">
            <div>
              <div className="eyebrow text-white/40">Product</div>
              <ul className="mt-3 space-y-2 text-white/40">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-white">Open OS →</a></li>
              </ul>
            </div>
            <div>
              <div className="eyebrow text-white/40">Proof</div>
              <ul className="mt-3 space-y-2 text-white/40">
                <li><a href="/outcomes" className="hover:text-white">Outcomes</a></li>
                <li><a href="/client" className="hover:text-white">Client view</a></li>
                <li><a href="/analytics" className="hover:text-white">Analytics</a></li>
              </ul>
            </div>
            <div>
              <div className="eyebrow text-white/40">Company</div>
              <ul className="mt-3 space-y-2 text-white/40">
                <li><a href="mailto:alphatekxcompany@gmail.com" className="hover:text-white">alphatekxcompany@gmail.com</a></li>
                <li><a href="#" className="hover:text-white">Privacy • Terms</a></li>
                <li><span className="text-white/20">30-day refund</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
