export const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0B0215]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-amber-500 flex items-center justify-center text-[#0B0215] font-black">α</div>
              <span className="font-black tracking-tight text-white">ALPHA AGENCY</span>
            </div>
            <p className="text-white/40 mt-3 leading-relaxed text-xs">The invisible OS for modern agencies. Find • Create • Send • Prove.</p>
            <p className="text-white/20 text-xs mt-2">alphatekx.name.ng • Built with 🧠</p>
          </div>
          <div>
            <div className="font-black tracking-widest uppercase text-xs text-white/60">Product</div>
            <ul className="mt-3 space-y-2 text-white/40 text-xs">
              <li><a href="#features" className="hover:text-gold">Features</a></li>
              <li><a href="#pricing" className="hover:text-gold">Pricing</a></li>
              <li><a href="/dashboard" className="hover:text-gold">Dashboard</a></li>
              <li><a href="/outreach" className="hover:text-gold">Outreach</a></li>
            </ul>
          </div>
          <div>
            <div className="font-black tracking-widest uppercase text-xs text-white/60">Proof</div>
            <ul className="mt-3 space-y-2 text-white/40 text-xs">
              <li><a href="/outcomes" className="hover:text-gold">Outcomes</a></li>
              <li><a href="/client" className="hover:text-gold">Client dashboard</a></li>
              <li><a href="/analytics" className="hover:text-gold">Analytics</a></li>
              <li><a href="/deals" className="hover:text-gold">Deal Desk</a></li>
            </ul>
          </div>
          <div>
            <div className="font-black tracking-widest uppercase text-xs text-white/60">Company</div>
            <ul className="mt-3 space-y-2 text-white/40 text-xs">
              <li><a href="mailto:hello@alphatekx.name.ng" className="hover:text-gold">Contact</a></li>
              <li><a href="#" className="hover:text-gold">Privacy</a></li>
              <li><a href="#" className="hover:text-gold">Terms</a></li>
              <li><span className="text-white/20">© {new Date().getFullYear()} AlphaTekx</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
