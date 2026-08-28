const items = [
  { n:'01', k:'Command Hub', t:'See every company clearly.', d:'Revenue, projects and activity in one calm view. The single source of truth your team actually checks.', points:['Companies & revenue','Projects & owners','Live activity'] },
  { n:'02', k:'Content Studio', t:'Write at the speed of thought.', d:'Groq-powered drafts in your voice. Calendar, approvals and schedule without switching tools.', points:['AI drafts & edits','Calendar & queue','Brand voice'] },
  { n:'03', k:'Outreach Engine', t:'Find businesses — free. Contact — real.', d:'Nominatim + Overpass. No API key. Save, personalize with AI, send via Resend, track replies.', points:['Free OSM search','Resend sending','Reply inbox'] },
  { n:'04', k:'Analytics', t:'No vanity. Just signal.', d:'Views, engagement and revenue over time. Built for decisions, not screenshots.', points:['Engagement by source','Revenue attribution','Content performance'] },
  { n:'05', k:'Deal Desk', t:'Close without chaos.', d:'Invoices, contracts and client records that stay in sync with outcomes.', points:['Invoices + due dates','Contracts','Client records'] },
  { n:'06', k:'Proof Layer', t:'The only deliverable is “we made you $X”.', d:'Outcomes → ROI charts → client read-only dashboards. Share a link, not a PDF.', points:['Revenue & ROI','Read-only client view','Export-ready proof'] },
];

export const Features = () => {
  return (
    <section id="features" className="py-14 sm:py-16 px-4 border-t border-white/5">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="eyebrow text-white/30">Platform • 6 modules • One OS</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">Built for operators, <span className="text-white/40 font-normal mature-serif italic">not tourists.</span></h2>
          </div>
          <p className="text-sm leading-6 text-white/40 max-w-md">Each module is quiet, fast and empty until you add. No sample data. No theatre. When you act, it compounds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-10">
          {items.map(it=>(
            <div key={it.n} className="mature-card rounded-[16px] p-6 flex flex-col">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-white text-[#0B0215] flex items-center justify-center text-[11px] font-black">{it.n}</span>
                <span className="eyebrow text-white/30">{it.k}</span>
              </div>
              <h3 className="text-[15px] font-black tracking-tight text-white mt-3">{it.t}</h3>
              <p className="text-sm leading-6 text-white/45 mt-2">{it.d}</p>
              <ul className="mt-4 space-y-1.5">
                {it.points.map(p=>(
                  <li key={p} className="flex items-center gap-2 text-xs text-white/55"><span className="w-1 h-1 rounded-full bg-white/40" />{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
