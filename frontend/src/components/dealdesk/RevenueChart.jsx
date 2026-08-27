export default function RevenueChart({ mrrData, byClient, projected }) {
  const maxMRR = Math.max(...mrrData.map((d) => d.value)) || 1
  const maxClient = Math.max(...byClient.map((d) => d.value)) || 1

  // MRR SVG
  const width = 420
  const height = 160
  const pad = 18
  const stepX = (width - pad * 2) / (mrrData.length - 1 || 1)
  const pts = mrrData.map((d, i) => {
    const x = pad + i * stepX
    const y = height - pad - (d.value / maxMRR) * (height - pad * 2)
    return { x, y, ...d }
  })
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const area = `${path} L ${pts[pts.length - 1].x} ${height - pad} L ${pts[0].x} ${height - pad} Z`

  return (
    <div className="space-y-6">
      {/* MRR Trend */}
      <div className="glass rounded-2xl p-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">MRR Trend</h3>
            <p className="text-xs text-white/40 mt-1">Monthly recurring revenue • last 6 months</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">+12.4%</span>
        </div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Client */}
        <div className="glass rounded-2xl p-8 animate-slideUp">
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Revenue by Client</h3>
          <p className="text-xs text-white/40 mt-1">Top contributors • MRR</p>
          <div className="mt-6 space-y-4">
            {byClient.map((c) => (
              <div key={c.label} className="group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white group-hover:text-[#FFD700] transition">{c.label}</span>
                  <span className="text-sm font-black text-[#FFD700]">${c.value.toLocaleString()}</span>
                </div>
                <div className="mt-2 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full transition-all duration-700" style={{ width: `${(c.value / maxClient) * 100}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-white/30"><span>{c.share}</span><span>MRR</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Projected */}
        <div className="gold-card rounded-2xl p-8 animate-slideUp">
          <h3 className="text-sm font-bold tracking-widest uppercase text-[#FFD700]/80">Projected Revenue</h3>
          <p className="text-xs text-white/40 mt-1">Next 90 days • based on active contracts</p>
          <div className="mt-6">
            <div className="text-5xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent">{projected.total}</div>
            <div className="text-xs text-white/40 mt-1">Projected total • {projected.period}</div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {projected.breakdown.map((b) => (
              <div key={b.label} className="bg-[#0B0215]/60 border border-white/10 rounded-xl p-3 text-center backdrop-blur">
                <div className="text-xs tracking-widest uppercase font-bold text-white/30">{b.label}</div>
                <div className="text-lg font-black text-white mt-1">{b.value}</div>
                <div className={`text-xs font-bold mt-1 ${b.trend.startsWith("+") ? "text-emerald-400" : "text-white/30"}`}>{b.trend}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 bg-[#0B0215]/50 rounded-full overflow-hidden border border-white/5">
            <div className="h-full w-[78%] bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-white/30 mt-2">78% of target • on track</p>
        </div>
      </div>
    </div>
  )
}
