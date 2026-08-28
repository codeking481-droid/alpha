import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 mature-grid opacity-40 pointer-events-none" />
      <div className="absolute -top-40 right-0 w-[720px] h-[480px] bg-white/[0.03] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-[1160px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white text-[#0B0215] flex items-center justify-center font-black text-xs">α</div>
            <span className="eyebrow text-white/40">Alpha Agency • Est. Lagos & London</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-white/30">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Systems operational
            <span className="ml-3 px-2.5 py-1 rounded-full bg-white text-[#0B0215]">alphatekx.name.ng</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 mt-10 sm:mt-14 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03] text-[11px] font-bold tracking-widest uppercase text-white/50">
              For agencies billing $5k — $50k / month
              <span className="px-2 py-0.5 rounded-full bg-[#FFD700] text-[#0B0215]">Proof, not promises</span>
            </div>

            <h1 className="text-[42px] sm:text-[58px] font-black tracking-[-0.04em] leading-[0.92] text-white mt-6">
              The operating system
              <span className="mature-serif font-normal italic text-white/60"> agencies </span>
              <br />
              <span className="bg-gradient-to-r from-[#E6C87A] via-[#D4AF37] to-[#E6C87A] bg-clip-text text-transparent">actually run on.</span>
            </h1>

            <p className="text-[15px] sm:text-[16px] leading-7 text-white/55 mt-5 max-w-[560px] font-medium">
              One invisible OS to find real businesses, craft outreach that gets replies, and prove revenue to clients. No suites. No seat fees. Just work that compounds.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link to="/auth" className="bg-white text-[#0B0215] px-7 py-3.5 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 transition inline-flex items-center justify-center gap-2">
                Get access — $50 code <span className="w-5 h-5 rounded-full bg-[#0B0215] text-white flex items-center justify-center text-[10px]">→</span>
              </Link>
              <Link to="/dashboard" className="hairline px-7 py-3.5 rounded-full font-black text-xs tracking-widest uppercase text-white/70 hover:text-white hover:bg-white/[0.04] transition inline-flex items-center justify-center">Preview dashboard →</Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-6 text-xs">
              <span className="text-white/30">No credit card</span>
              <span className="text-white/20">•</span>
              <span className="text-white/30">2-minute setup</span>
              <span className="text-white/20">•</span>
              <span className="text-white/30">Cancel anytime</span>
              <span className="text-emerald-400 font-bold">30-day refund</span>
            </div>

            <div className="flex items-center gap-3 mt-8 border-t border-white/5 pt-6">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i=>(
                  <div key={i} className="w-7 h-7 rounded-full bg-white/10 border border-[#0B0215] flex items-center justify-center text-[10px] font-black text-white/60">{String.fromCharCode(64+i)}</div>
                ))}
              </div>
              <div className="text-xs leading-none">
                <div className="font-bold text-white">Trusted by 300+ operators</div>
                <div className="text-white/30">Lagos • Accra • London • Remote</div>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-1 text-amber-400 text-xs">★★★★★ <span className="text-white/30 ml-1">4.9 avg</span></div>
            </div>
          </div>

          {/* preview — mature, quiet */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[20px] hairline bg-white/[0.04] p-2">
              <div className="rounded-[14px] overflow-hidden bg-[#0B0215] hairline">
                <div className="h-9 border-b border-white/5 flex items-center gap-2 px-3 bg-white/[0.02]">
                  <span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" /><span className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="ml-3 text-[10px] tracking-widest uppercase font-bold text-white/20">Command Hub • Live</span>
                  <span className="ml-auto text-[10px] text-white/15">12:41 PM — synced</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      ['Revenue', '$84,240', '+12.3%'],
                      ['Leads', '1,240', '+8.1%'],
                      ['ROI', '3.1×', 'proof'],
                    ].map(([k,v,d])=>(
                      <div key={k} className="mature-card rounded-xl p-3">
                        <div className="eyebrow text-white/25">{k}</div>
                        <div className="text-[15px] font-black text-white mt-1">{v}</div>
                        <div className="text-[11px] text-white/30 mt-0.5">{d}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 mature-card rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="eyebrow text-white/30">Revenue — 14 days</div>
                      <div className="text-[11px] text-white/20">Real • D1</div>
                    </div>
                    <div className="mt-4 flex items-end gap-1 h-[72px]">
                      {[22,30,18,36,42,28,52,48,64,58,72,68].map((h,i)=>(
                        <div key={i} className={`flex-1 rounded-sm ${i===10?'bg-white':'bg-white/12'}`} style={{height: `${h}%`}} />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-white/30">
                      <span className="w-2 h-2 bg-white rounded-full" /> Outcomes proof layer enabled
                      <span className="ml-auto text-white/20">/outcomes</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <div className="mature-card rounded-xl p-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#0B0215] font-black text-[11px]">IN</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white leading-none">Inbox — 3 new</div>
                        <div className="text-[11px] text-white/35 truncate">Tunde A. → “Let’s book Tuesday”</div>
                      </div>
                      <span className="text-[11px] text-white/20">now</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-6 right-6 h-6 bg-black/40 blur-xl rounded-full pointer-events-none" />
            </div>
            <p className="text-center text-[11px] tracking-wide text-white/25 mt-4">Real data. No demos. Empty until you add.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
