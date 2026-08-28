export const StatsStrip = () => {
  const stats = [
    ['342', 'Agencies live', 'Active'],
    ['12.4k', 'Leads found', 'Free via OSM'],
    ['$184k', 'Revenue tracked', 'Real proofs'],
    ['4.9/5', 'Avg ROI proof', '312% median'],
  ];
  return (
    <section className="px-4 py-6">
      <div className="max-w-6xl mx-auto glass rounded-2xl py-4 px-2 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(([v,k,sub])=>(
          <div key={k} className="text-center py-2">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{v}</div>
            <div className="text-[11px] tracking-widest uppercase font-black text-white/40">{k}</div>
            <div className="text-[11px] text-[#FFD700]">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
export default StatsStrip;
