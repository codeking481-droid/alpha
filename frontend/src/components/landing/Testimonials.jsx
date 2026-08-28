const items = [
  { name:'Tolu A.', role:'Founder, Lagos Agency — $18k/mo', quote:'We closed 3 clients in 11 days just from the free lead finder. No Apollo, no scraping hell.', metric:'3 clients • $4.2k' },
  { name:'Emeka C.', role:'Growth, Accra', quote:'The outcome badge finally lets me send a link instead of a PDF. Client said “this is pro”.', metric:'4.7% → 312% ROI' },
  { name:'Sarah K.', role:'London — Solo to 4 people', quote:'Content Studio drafts in my voice, Outreach does the hunting. I finally sleep.', metric:'22 posts • 8 replies' },
];

export const Testimonials = () => {
  return (
    <section className="py-14 px-4 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white text-center">Agencies that stopped guessing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {items.map(it=>(
            <div key={it.name} className="glass rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-1 text-[#FFD700] text-xs">★★★★★ <span className="text-white/20 ml-2 text-[11px]">{it.metric}</span></div>
              <p className="text-white text-sm leading-relaxed mt-3">“{it.quote}”</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black text-xs">{it.name.slice(0,2)}</div>
                <div>
                  <div className="text-xs font-black text-white">{it.name}</div>
                  <div className="text-[11px] text-white/40">{it.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
