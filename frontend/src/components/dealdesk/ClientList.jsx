const statusCfg = {
  Active: { dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", label: "Active" },
  Paused: { dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", label: "Paused" },
  "At Risk": { dot: "bg-red-400 animate-pulse", badge: "bg-red-500/15 text-red-400 border-red-500/20", label: "At Risk" },
  Churned: { dot: "bg-white/20", badge: "bg-white/5 text-white/40 border-white/10", label: "Churned" },
}

export default function ClientList({ clients, onSelect }) {
  return (
    <div className="glass rounded-2xl p-8 animate-slideUp">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Client Overview</h3>
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold">{clients.length} clients</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Click to view details • status + billing</p>

      <div className="mt-6 space-y-3">
        {clients.map((c) => {
          const cfg = statusCfg[c.status] || statusCfg.Active
          return (
            <button key={c.id} onClick={() => onSelect?.(c)} className="w-full text-left group bg-[#0B0215] border border-white/10 rounded-2xl p-4 hover:border-[#FFD700]/20 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-[#0B0215] font-black text-sm shrink-0">
                {c.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-[#FFD700] transition truncate">{c.name}</span>
                  <span className="text-xs text-white/40 truncate">• {c.company}</span>
                  <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${cfg.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span> {cfg.label}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-white/30">Total Billed</div>
                    <div className="text-sm font-black text-white mt-1">{c.totalBilled}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-white/30">MRR</div>
                    <div className="text-sm font-black text-[#FFD700] mt-1">{c.mrr}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-white/30">Last Invoice</div>
                    <div className="text-sm font-bold text-white/70 mt-1 truncate">{c.lastInvoice}</div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button className="w-full mt-4 py-3 rounded-xl border border-white/10 text-white text-xs font-black tracking-widest uppercase hover:border-[#FFD700] hover:text-[#FFD700] transition">View All Clients →</button>
    </div>
  )
}
