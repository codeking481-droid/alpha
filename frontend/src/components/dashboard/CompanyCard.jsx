export default function CompanyCard({ company }) {
  const statusStyles = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    new: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  }

  const dotStyles = {
    active: "bg-emerald-400",
    paused: "bg-amber-400",
    new: "bg-sky-400",
  }

  return (
    <div className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-[#FFD700]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#FFD700]/5">
      {/* accent glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FFD700]/0 via-transparent to-[#FFD700]/0 group-hover:from-[#FFD700]/5 group-hover:to-transparent transition duration-500 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black text-sm">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur ${statusStyles[company.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[company.status]} animate-pulse`} />
            {company.status}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-white tracking-tight">{company.name}</h3>
        <p className="text-sm text-white/50">{company.industry}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3">
            <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">Projects</div>
            <div className="text-xl font-bold text-white mt-1">{company.projects}</div>
          </div>
          <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3">
            <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">Revenue</div>
            <div className="text-xl font-bold text-[#FFD700] mt-1">{company.revenue}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          Last activity: {company.lastActivity}
        </div>
      </div>
    </div>
  )
}
