export const ROICalculator = ({ outcomes }) => {
  const calculateROI = () => {
    if (!outcomes || outcomes.length === 0) {
      return { totalRevenue: 0, totalCost: 0, roi: 0 };
    }
    const totalRevenue = outcomes.reduce((sum, o) => sum + (Number(o.revenue) || 0), 0);
    const totalCost = outcomes.reduce((sum, o) => sum + (Number(o.cost) || 0), 0);
    const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    return { totalRevenue, totalCost, roi };
  };

  const { totalRevenue, totalCost, roi } = calculateROI();

  return (
    <div className="glass p-6">
      <h3 className="text-sm font-bold tracking-widest uppercase text-white/60 mb-4">📈 ROI Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/40 text-sm">Total Revenue</span>
          <span className="text-[#FFD700] font-bold">${totalRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40 text-sm">Total Cost</span>
          <span className="text-white font-bold">${totalCost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-3">
          <span className="text-white/60 font-bold text-sm">ROI</span>
          <span className={`font-black ${(roi) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {roi.toFixed(1)}%
          </span>
        </div>
        {roi > 0 && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm text-center">
              🎉 Your campaigns are generating positive ROI!
            </p>
          </div>
        )}
        {roi < 0 && totalCost > 0 && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">ROI negative — review costs or targeting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROICalculator;
