export const ClientChart = ({ outcomes }) => {
  if (!outcomes || outcomes.length === 0) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-gray-400">No data yet. Results will appear here as campaigns run.</p>
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
      <h3 className="text-xl font-bold text-white mb-4">📈 Revenue Over Time</h3>
      <div className="h-48 flex items-end gap-2">
        {dates.map((date, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <div
              className="w-full bg-gold/20 hover:bg-gold/40 transition rounded-t border border-gold/10"
              style={{ height: `${(values[i] / maxRevenue) * 100}%`, minHeight: values[i] ? '8px' : '2px' }}
              title={`${date}: $${values[i].toLocaleString()}`}
            ></div>
            <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">{date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientChart;
