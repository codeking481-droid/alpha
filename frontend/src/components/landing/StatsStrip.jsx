export const StatsStrip = () => {
  return (
    <section className="px-4 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-[1160px] mx-auto py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          ['$5k — $50k', 'Agencies it’s built for', 'Compounding operators'],
          ['342', 'Workspaces live', 'Lagos → London'],
          ['Zero mock', 'Empty until you add', 'Real data only'],
          ['30-day', 'Money-back', 'No questions'],
        ].map(([v,k,sub])=>(
          <div key={k} className="text-center lg:text-left flex lg:flex-col items-center lg:items-start gap-3 lg:gap-0">
            <div className="text-sm font-black tracking-tight text-white">{v}</div>
            <div>
              <div className="eyebrow text-white/30 leading-none">{k}</div>
              <div className="text-xs text-white/25">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default StatsStrip;
