export default function RevenueChart({ mrrData, byClient, projected }) {
  const hasMRR = mrrData && mrrData.length > 0
  const hasClients = byClient && byClient.length > 0
  const maxMRR = hasMRR ? Math.max(...mrrData.map((d) => d.value)) : 1
  const maxClient = hasClients ? Math.max(...byClient.map((d) => d.value)) : 1

  const width = 420
  const height = 160
  const pad = 18
  const stepX = hasMRR ? (width - pad * 2) / (mrrData.length - 1 || 1) : 0
  const pts = hasMRR ? mrrData.map((d, i) => {
    const x = pad + i * stepX
    const y = height - pad - (d.value / maxMRR) * (height - pad * 2)
    return { x, y, ...d }
  }) : []
  const path = pts.length ? pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") : ""
  const area = pts.length ? `${path} L ${pts[pts.length - 1].x} ${height - pad} L ${pts[0].x} ${height - pad} Z` : ""

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 sm:p-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">MRR Trend — Real</h3>
            <p className="text-xs text-white/30 mt-1">Usefulness: see real monthly revenue trend. Empty until you create invoices.</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border font-bold ${hasMRR ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>{hasMRR ? "Live Real" : "No data yet"}</span>
        </div>
        {hasMRR ? (
          <div className="mt-4 -mx-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1={pad} x2={width - pad} y1={pad + i * ((height - pad * 2) / 3)} y2={pad + i * ((height - pad * 2) / 3)} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              ))}
              <path d={area} fill="url(#revGrad)" />
              <path d={path} fill="none" stroke="#FFD700" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p) => (
                <g key={p.label}>
                  <circle cx={p.x} cy={p.y} r={5} fill="#FFD700" stroke="#0B0215" strokeWidth={2} />
                  <text x={p.x} y={height - 2} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.4)" fontWeight={800}>{p.label}</text>
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={10} fill="#FFD700" fontWeight={900}>${(p.value / 1000).toFixed(0)}k</text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
            <div className="text-3xl">📈</div>
            <p className="text-sm text-white/60 mt-2 font-bold">No revenue history yet — real trend appears when you invoice</p>
            <p className="text-xs text-white/30 mt-1">Create a real invoice below. Usefulness: you see if revenue is growing or dropping, then fix.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Revenue by Client — Real</h3>
          <p className="text-xs text-white/30 mt-1">Usefulness: know which client pays most, focus there.</p>
          {hasClients ? (
            <div className="mt-6 space-y-4">
              {byClient.map((c) => (
                <div key={c.label} className="group">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{c.label}</span>
                    <span className="text-sm font-black text-[#FFD700]">${c.value.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full" style={{ width: `${(c.value / maxClient) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-center py-8 bg-[#0B0215] border border-white/5 rounded-xl">
              <p className="text-sm text-white/40">No clients with revenue yet</p>
              <p className="text-xs text-white/20 mt-1">Add clients in Command Hub, then invoices.</p>
            </div>
          )}
        </div>

        <div className="gold-card rounded-2xl p-6 sm:p-8">
          <h3 className="text-sm font-bold tracking-widest uppercase text-[#FFD700]/80">Projected Revenue — Real</h3>
          <p className="text-xs text-white/30 mt-1">Usefulness: forecast next 90 days from real contracts/invoices. Empty until you have data.</p>
          {projected.total !== "$0" ? (
            <>
              <div className="mt-6">
                <div className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent">{projected.total}</div>
                <div className="text-xs text-white/40 mt-1">{projected.period}</div>
              </div>
              <div className="mt-4 h-2 bg-[#0B0215]/50 rounded-full overflow-hidden border border-white/5">
                <div className="h-full w-[30%] bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full"></div>
              </div>
              <p className="text-xs text-white/30 mt-2">Real forecast — grows as you invoice.</p>
            </>
          ) : (
            <div className="mt-6 text-center py-8 bg-[#0B0215]/60 border border-white/5 rounded-xl">
              <p className="text-sm text-white/40">$0 projected — no invoices yet</p>
              <p className="text-xs text-white/20 mt-1">Create invoices to see real forecast.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
