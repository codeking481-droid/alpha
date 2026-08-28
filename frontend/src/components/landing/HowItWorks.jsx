export const HowItWorks = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-[1160px] mx-auto mature-card rounded-[16px] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-xl font-black tracking-tight text-white">From find to proof in 10 minutes.</h2>
          <div className="text-xs text-white/30">No onboarding calls. No implementation.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative">
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-[1px] bg-white/5" />
          {[
            { n:'1', t:'Find 20 businesses', d:'City + niche. Overpass in 30s. Save to α•leads. No key.' },
            { n:'2', t:'Send 3 personal emails', d:'AI draft → Resend. Tracked in messages, reply-aware.' },
            { n:'3', t:'Share the proof link', d:'Outcomes calculate ROI. Client sees live dashboard. Read-only.' },
          ].map(s=>(
            <div key={s.n} className="relative">
              <div className="w-10 h-10 rounded-full bg-white text-[#0B0215] flex items-center justify-center font-black text-sm relative z-10">{s.n}</div>
              <h3 className="text-sm font-black text-white mt-3">{s.t}</h3>
              <p className="text-xs leading-5 text-white/40 mt-1 max-w-[28ch]">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
