export default function PerformanceChart({ title, subtitle, type = "line", data, color = "#FFD700" }) {
  // data: [{ label, value }], or for line: [{ x, y }]
  const max = Math.max(...data.map((d) => d.value)) || 1

  if (type === "bar") {
    return (
      <div className="glass rounded-2xl p-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">{title}</h3>
            {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-semibold">Bar</span>
        </div>
        <div className="mt-6 space-y-3">
          {data.map((d) => (
            <div key={d.label} className="group">
              <div className="flex justify-between text-xs font-bold tracking-widest uppercase">
                <span className="text-white/50 group-hover:text-white transition">{d.label}</span>
                <span className="text-white">{d.value.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-2.5 bg-white/5 rounded-full border border-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-90"
                  style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // line chart via SVG
  const width = 400
  const height = 140
  const padding = 16
  const stepX = (width - padding * 2) / (data.length - 1 || 1)
  const points = data.map((d, i) => {
    const x = padding + i * stepX
    const y = height - padding - (d.value / max) * (height - padding * 2)
    return { x, y, ...d }
  })
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`

  return (
    <div className="glass rounded-2xl p-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">{title}</h3>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-semibold">Live</span>
      </div>

      <div className="mt-4 -mx-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]">
          <defs>
            <linearGradient id={`grad-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* grid */}
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={padding} x2={width - padding} y1={padding + i * ((height - padding * 2) / 3)} y2={padding + i * ((height - padding * 2) / 3)} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          ))}
          <path d={areaPath} fill={`url(#grad-${title.replace(/\s/g, "")})`} />
          <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="#0B0215" strokeWidth={2} className="hover:r-6 transition-all" />
              <text x={p.x} y={height - 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.35)" fontWeight={700}>{p.label}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-xs text-white/30">
        <span>Min {Math.min(...data.map((d) => d.value)).toLocaleString()}</span>
        <span>Max {max.toLocaleString()}</span>
      </div>
    </div>
  )
}
