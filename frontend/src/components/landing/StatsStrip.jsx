export const StatsStrip = () => {
  return (
    <section className="px-6 border-y" style={{background:'#FFFFFF', borderColor:'#EDEDED'}}>
      <div className="max-w-[1040px] mx-auto py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ['$5k — $50k', 'Agencies it’s built for', 'Compounding operators'],
          ['342', 'Workspaces live', 'Lagos → London'],
          ['Zero mock', 'Empty until you add', 'Real data only'],
          ['30-day', 'Money-back', 'No questions'],
        ].map(([v,k,sub])=>(
          <div key={k} className="text-center lg:text-left flex lg:flex-col items-center lg:items-start gap-3 lg:gap-0">
            <div className="text-sm font-bold tracking-tight" style={{color:'#0A0A0A'}}>{v}</div>
            <div>
              <div style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', lineHeight:'1'}}>{k}</div>
              <div style={{color:'#9CA3AF', fontSize:'12px'}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default StatsStrip;
