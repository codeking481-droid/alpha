export default function KPICard({ label, value, change, icon, trend = "up", sub, loading = false }) {
  const isPositive = String(change).startsWith("+") || trend === "up"
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-shimmer h-[128px]">
        <div className="h-4 w-24 bg-white/10 rounded-full"></div>
        <div className="h-8 w-32 bg-white/10 rounded-lg mt-4"></div>
        <div className="h-3 w-20 bg-white/5 rounded-full mt-3"></div>
      </div>
    )
  }
  return (
    <div className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 animate-slideUp">
      <div className="flex items-start justify-between">
        <div className="text-xs font-bold tracking-widest uppercase text-white/40">{label}</div>
        <div className="w-9 h-9 rounded-xl bg-white/[0.06] group-hover:bg-[#FFD700] border border-white/10 group-hover:border-[#FFD700] flex items-center justify-center text-sm transition-colors duration-300">
          <span className="group-hover:scale-110 transition-transform">{icon}</span>
        </div>
      </div>
      <div className="mt-3 text-4xl font-black tracking-tight text-white group-hover:text-[#FFD700] transition-colors">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
      <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
        <span>{isPositive ? "↗" : "↘"}</span> {change}
        <span className="text-white/30 font-medium">vs last month</span>
      </div>
    </div>
  )
}
