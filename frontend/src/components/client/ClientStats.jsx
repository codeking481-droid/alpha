export const ClientStats = ({ summary }) => {
  if (!summary) return null;
  const stats = [
    { label: 'Revenue', value: `$${Number(summary.totalRevenue||0).toLocaleString()}`, icon: '💰' },
    { label: 'ROI', value: `${Number(summary.averageROI||0).toFixed(1)}%`, icon: '📈', color: Number(summary.averageROI||0) >= 0 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'Views', value: Number(summary.totalViews||0).toLocaleString(), icon: '👁️' },
    { label: 'Conversions', value: Number(summary.totalConversions||0).toLocaleString(), icon: '🎯' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="glass p-6 text-center">
          <div className="text-3xl mb-2">{stat.icon}</div>
          <p className={`text-2xl font-bold ${stat.color || 'text-gold'}`}>{stat.value}</p>
          <p className="text-gray-400 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientStats;
