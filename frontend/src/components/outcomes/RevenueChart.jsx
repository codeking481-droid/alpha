export const RevenueChart = ({ outcomes }) => {
  if (!outcomes || outcomes.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-white/40 text-sm">No revenue data yet. Add campaigns to start tracking.</p>
      </div>
    );
  }

  const revenueByDate = outcomes.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + (Number(item.revenue) || 0);
    return acc;
  }, {});

  const dates = Object.keys(revenueByDate);
  const values = Object.values(revenueByDate);
  const maxRevenue = Math.max(...values, 1);

  return (
    <div className="glass p-6">
      <h3 className="text-sm font-bold tracking-widest uppercase text-white/60 mb-4">💰 Revenue Over Time</h3>
      <div className="h-48 flex items-end gap-2">
        {dates.map((date, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="w-full bg-[#FFD700]/20 hover:bg-[#FFD700]/40 transition rounded-t border border-[#FFD700]/10"
              style={{ height: `${(values[i] / maxRevenue) * 100}%`, minHeight: values[i] ? '8px' : '2px' }}
              title={`${date}: $${values[i].toLocaleString()}`}
            ></div>
            <span className="text-[10px] text-white/30 mt-2 truncate w-full text-center">{date}</span>
            <span className="text-[10px] text-[#FFD700] font-bold">${values[i].toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
