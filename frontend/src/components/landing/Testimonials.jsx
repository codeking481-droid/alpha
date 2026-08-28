const items = [
  { q:'We killed our lead list subscription. Overpass finds hotels in PH in seconds and outreach actually lands in inbox.', a:'Tolu A.', r:'Founder — Lagos • $18k/mo', m:'3 retainers in 18 days' },
  { q:'First time a client said “send the dashboard link, not the PDF.” Outcomes made retention obvious.', a:'Emeka C.', r:'Growth — Accra', m:'3.1× ROI shown live' },
  { q:'Content went from 3 hours to 12 minutes. Voice stays mine. The OS just removes drag.', a:'Sarah K.', r:'Solo → 4, London', m:'22 posts → 8 replies' },
];

export const Testimonials = () => {
  return (
    <section className="py-14 px-4">
      <div className="max-w-[1160px] mx-auto">
        <div className="eyebrow text-white/30">What operators say — quietly</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {items.map(it=>(
            <div key={it.a} className="mature-card rounded-[16px] p-6 flex flex-col">
              <p className="text-sm leading-7 text-white/70">“{it.q}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0B0215] font-black text-xs">{it.a.split(' ')[0].slice(0,2)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white leading-none">{it.a}</div>
                  <div className="text-[11px] text-white/35">{it.r}</div>
                </div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-white/25">{it.m}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
