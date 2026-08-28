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
    <section id="features" className="py-14 sm:py-16 px-6" style={{background:'#FFFFFB', borderTop:'1px solid #EAEAEA'}}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest uppercase" style={{color:'#5E17EB'}}>Platform • 6 modules • One OS</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2" style={{color:'#0A0A0A'}}>Built for operators, <span style={{color:'#5E17EB', fontStyle:'italic', fontWeight:400}}>not tourists.</span></h2>
          </div>
          <p className="text-sm leading-6 max-w-md" style={{color:'#777777'}}>Each module is quiet, fast and empty until you add. No sample data. No theatre. When you act, it compounds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {items.map(it=>(
            <div key={it.n} className="card hover-lift" style={{background:'#FFFFFB', border:'1px solid #EAEAEA'}}>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{background:'#5E17EB', color:'#FFFFFB'}}>{it.n}</span>
                <span className="text-xs font-bold tracking-widest uppercase" style={{color:'#5E17EB'}}>{it.k}</span>
              </div>
              <h3 className="text-sm font-bold mt-3" style={{color:'#0A0A0A'}}>{it.t}</h3>
              <p className="text-sm leading-6 mt-2" style={{color:'#555555'}}>{it.d}</p>
              <ul className="mt-4 space-y-1.5">
                {it.points.map(p=>(
                  <li key={p} className="flex items-center gap-2 text-xs" style={{color:'#777777'}}><span className="w-1 h-1 rounded-full" style={{background:'#5E17EB'}} />{p}</li>
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
