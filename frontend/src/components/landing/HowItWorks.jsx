export const HowItWorks = () => {
  return (
    <section className="py-12 px-6" style={{background:'#FFFCF8'}}>
      <div className="max-w-[1040px] mx-auto card rounded-[16px] p-6 sm:p-8" style={{background:'#FFFFFF', border:'1px solid #EDEDED'}}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight" style={{color:'#0A0A0A'}}>From find to proof in 10 minutes.</h2>
          <div className="text-xs" style={{color:'#6B7280'}}>No onboarding calls. No implementation.</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative">
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-[1px]" style={{background:'#EDEDED'}} />
          {[
            { n:'1', t:'Find 20 businesses', d:'City + niche. Overpass in 30s. Save to α•leads. No key.' },
            { n:'2', t:'Send 3 personal emails', d:'AI draft → Resend. Tracked in messages, reply-aware.' },
            { n:'3', t:'Share the proof link', d:'Outcomes calculate ROI. Client sees live dashboard. Read-only.' },
          ].map(s=>(
            <div key={s.n} className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative z-10" style={{background:'#5E17EB', color:'#FFFFFF'}}>{s.n}</div>
              <h3 className="text-sm font-bold mt-3" style={{color:'#0A0A0A'}}>{s.t}</h3>
              <p className="text-xs leading-5 mt-1 max-w-[28ch]" style={{color:'#6B7280'}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
