const items = [
  { n:'01', k:'COMMAND HUB', t:'See every company clearly.', d:'Revenue, projects and activity in one calm view. The single source of truth your team actually checks.', points:['Companies & revenue','Projects & owners','Live activity'] },
  { n:'02', k:'CONTENT STUDIO', t:'Write at the speed of thought.', d:'Groq-powered drafts in your voice. Calendar, approvals and schedule without switching tools.', points:['AI drafts & edits','Calendar & queue','Brand voice'] },
  { n:'03', k:'OUTREACH ENGINE', t:'Find businesses — free. Contact — real.', d:'Nominatim + Overpass. No API key. Save, personalize with AI, send via Resend, track replies.', points:['Free OSM search','Resend sending','Reply inbox'] },
  { n:'04', k:'ANALYTICS', t:'No vanity. Just signal.', d:'Views, engagement and revenue over time. Built for decisions, not screenshots.', points:['Engagement by source','Revenue attribution','Content performance'] },
  { n:'05', k:'DEAL DESK', t:'Close without chaos.', d:'Invoices, contracts and client records that stay in sync with outcomes.', points:['Invoices + due dates','Contracts','Client records'] },
  { n:'06', k:'PROOF LAYER', t:'The only deliverable is “we made you $X”.', d:'Outcomes → ROI charts → client read-only dashboards. Share a link, not a PDF.', points:['Revenue & ROI','Read-only client view','Export-ready proof'] },
];

export const Features = () => {
  return (
    <section id="platform" className="max-w-[1120px] mx-auto px-6 py-16" style={{background:'#FFFCF8'}}>
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-semibold" style={{color:'#0A0A0A', fontSize:'32px', letterSpacing:'-0.02em'}}>Built for operators, <span style={{color:'#6B7280', fontStyle:'italic', fontWeight:400}}>not tourists.</span></h2>
        <p className="mt-3" style={{color:'#6B7280', fontSize:'15px'}}>Each module is quiet, fast and empty until you add. No sample data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
        {items.map(it=>(
          <div key={it.n} className="card" style={{background:'#FFFCF8', border:'1px solid #EDEDED', borderRadius:'12px', padding:'24px'}}>
            <div className="label" style={{color:'#6B7280', fontSize:'12px', letterSpacing:'0.08em', fontWeight:500}}>{it.n} {it.k}</div>
            <h3 className="font-semibold mt-3" style={{color:'#0A0A0A', fontSize:'16px'}}>{it.t}</h3>
            <p className="mt-2" style={{color:'#6B7280', fontSize:'14px', lineHeight:'1.6'}}>{it.d}</p>
            <ul className="mt-4 space-y-1.5">
              {it.points.map(p=>(
                <li key={p} className="flex items-center gap-2" style={{color:'#6B7280', fontSize:'13px'}}><span style={{color:'#5E17EB'}}>•</span>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
