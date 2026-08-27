import { useState } from "react"

const clients = ["Genesis", "Dominion", "AlphaTek X", "Venture Labs", "All Clients"]

export default function ClientReport() {
  const [client, setClient] = useState(clients[0])
  const [range, setRange] = useState("Last 30 days")
  const [format, setFormat] = useState("PDF")
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(null)

  const generate = async () => {
    setGenerating(true)
    setDone(null)
    await new Promise((r) => setTimeout(r, 1400))
    setGenerating(false)
    const report = {
      id: Date.now(),
      client,
      range,
      format,
      views: Math.floor(8000 + Math.random() * 6000),
      engagement: (4.2 + Math.random() * 2).toFixed(1),
    }
    setDone(report)
  }

  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black text-sm">◧</div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Client Reports</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/30">PDF / Email</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Generate branded reports for each client — one click</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold tracking-widest uppercase text-white/50">Client</label>
          <select value={client} onChange={(e) => setClient(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50">
            {clients.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold tracking-widest uppercase text-white/50">Date Range</label>
          <select value={range} onChange={(e) => setRange(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold tracking-widest uppercase text-white/50">Format</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["PDF", "Email"].map((f) => (
              <button key={f} onClick={() => setFormat(f)} className={format === f ? "py-2.5 rounded-xl text-xs font-black tracking-widest uppercase bg-[#FFD700] text-[#0B0215] border border-[#FFD700]" : "py-2.5 rounded-xl text-xs font-black tracking-widest uppercase bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={generate} disabled={generating} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 hover:from-[#ffdf33] hover:to-amber-400 disabled:opacity-40 text-[#0B0215] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition shadow-gold">
        {generating ? <><span className="w-4 h-4 border-2 border-[#0B0215]/30 border-t-[#0B0215] rounded-full animate-spin"></span> Generating {format}...</> : <>Generate Report — {client}</>}
      </button>

      {done && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-fadeIn">
          <div className="text-sm font-bold text-emerald-400">✓ {done.format} ready for {done.client}</div>
          <div className="text-xs text-white/60 mt-1">{done.range} • {done.views.toLocaleString()} views • {done.engagement}% engagement</div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-black tracking-widest uppercase">Download PDF</button>
            <button className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold">Send Email</button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/30">Reports Sent</div>
          <div className="text-lg font-black text-white mt-1">24</div>
        </div>
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/30">Avg Open</div>
          <div className="text-lg font-black text-[#FFD700] mt-1">68%</div>
        </div>
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/30">This Month</div>
          <div className="text-lg font-black text-emerald-400 mt-1">+8</div>
        </div>
      </div>
    </div>
  )
}
