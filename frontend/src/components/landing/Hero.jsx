import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* bg gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/[0.07] via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#FFD700]/[0.06] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-violet-500/[0.06] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur text-[11px] tracking-widest uppercase font-black text-white/60">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live on alphatekx.name.ng • 342 agencies onboarded
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-[#FFD700] text-[#0B0215]">NEW • Outcome proof layer</span>
          </div>

          <h1 className="text-[40px] sm:text-[64px] font-black tracking-[-0.04em] leading-[0.9] text-white mt-6">
            The Invisible OS for
            <br />
            <span className="bg-gradient-to-r from-[#FFD700] via-amber-400 to-[#FFD700] bg-clip-text text-transparent">Modern Agencies</span>
          </h1>

          <p className="text-[17px] sm:text-[19px] text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            Run <span className="text-white font-bold">multiple companies</span>, create content with AI, find real leads without API keys, send outreach, and <span className="text-[#FFD700] font-bold">prove ROI</span> — all from one premium OS.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/dashboard" className="btn-primary text-[13px] px-8 py-4 shadow-gold hover:shadow-gold/20 flex items-center justify-center gap-2">
              🚀 Start free — open Command Hub
            </Link>
            <a href="#features" className="btn-secondary px-8 py-4 flex items-center justify-center gap-2">
              See 90 sec demo <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">▶</span>
            </a>
          </div>

          <p className="text-white/30 text-xs mt-3 tracking-wide">No credit card • Free for early adopters • Cancel anytime • <span className="text-white/50">2-min setup</span></p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs">
            <span className="flex items-center gap-1.5 text-white/40"><span className="text-[#FFD700]">✓</span> 12,400+ leads found</span>
            <span className="flex items-center gap-1.5 text-white/40"><span className="text-[#FFD700]">✓</span> $184k revenue tracked</span>
            <span className="flex items-center gap-1.5 text-white/40"><span className="text-[#FFD700]">✓</span> 4.9/5 avg ROI proof</span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-2 sm:p-3 shadow-2xl">
            <div className="rounded-[16px] overflow-hidden border border-white/5 bg-[#0B0215]">
              {/* fake browser bar */}
              <div className="h-8 sm:h-10 bg-white/[0.03] border-b border-white/5 flex items-center gap-2 px-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                <span className="ml-3 text-[11px] tracking-widest uppercase font-bold text-white/20">alpha agency • command hub</span>
                <span className="ml-auto hidden sm:inline text-[11px] text-white/20">alphatekx.name.ng/dashboard — Live</span>
              </div>
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-12 lg:col-span-8 p-4 sm:p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ['Revenue', '$84,240', '+23%', 'emerald'],
                      ['Leads', '1,240', '+18%', 'gold'],
                      ['ROI', '312%', '+41%', 'violet'],
                    ].map(([k,v,d,c])=> (
                      <div key={k} className="glass p-3 sm:p-4 rounded-2xl">
                        <div className="text-[10px] tracking-widest uppercase font-black text-white/30">{k}</div>
                        <div className={`text-lg sm:text-xl font-black ${c==='emerald'?'text-emerald-400':c==='gold'?'text-[#FFD700]':'text-violet-400'}`}>{v}</div>
                        <div className="text-[11px] text-white/30">{d} this month</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black tracking-widest uppercase text-white/50">Revenue over time</div>
                      <div className="text-[11px] text-white/20">Last 7 days • live</div>
                    </div>
                    <div className="mt-4 flex items-end gap-1.5 h-20">
                      {[30,45,28,60,52,78,65,90,72,88].map((h,i)=>(
                        <div key={i} className={`flex-1 rounded-t ${i===7?'bg-[#FFD700]':'bg-white/10'} ${i===7?'shadow-gold':''}`} style={{height: `${h}%`}} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/5 p-4 sm:p-6">
                  <div className="text-xs font-black tracking-widest uppercase text-white/30">Live outreach</div>
                  <div className="mt-3 space-y-2">
                    {[
                      ['Adebayo O.','Paystack • Hot','2m'],
                      ['Chioma E.','Flutterwave • Reply','8m'],
                      ['Tunde A.','Kuda • Meeting','1h'],
                    ].map(([n,s,t])=>(
                      <div key={n} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black text-xs">{n.slice(0,2)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white leading-none truncate">{n}</div>
                          <div className="text-[11px] text-white/40 truncate">{s}</div>
                        </div>
                        <div className="text-[11px] text-white/20">{t}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 glass rounded-xl p-3">
                    <div className="text-[11px] font-black tracking-widest uppercase text-white/30">Lead finder — free</div>
                    <div className="text-xs text-white/40 mt-1">Port Harcourt • hotel → <span className="text-[#FFD700] font-bold">23 businesses</span> (no API key)</div>
                  </div>
                </div>
              </div>
            </div>
            {/* floating card */}
            <div className="absolute -bottom-6 left-4 sm:left-8 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">✓</div>
              <div>
                <div className="text-xs font-black text-white leading-none">Proof delivered</div>
                <div className="text-[11px] text-white/40">Client saw 3.2x ROI in 14 days</div>
              </div>
            </div>
            <div className="absolute -top-4 right-4 sm:right-8 glass rounded-2xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-white">System live</span>
            </div>
          </div>
          <p className="text-center text-white/20 text-xs mt-8">Trusted by agencies in Lagos, London, Accra • Real data, no mock • Built for $5k/mo agencies</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
