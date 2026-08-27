import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

const statusCfg = {
  hot: { label: "Hot Lead", dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  warm: { label: "Warm", dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  meeting: { label: "Meeting", dot: "bg-sky-400", badge: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  cold: { label: "Cold", dot: "bg-white/20", badge: "bg-white/5 text-white/40 border-white/10" },
}

export default function ReplyTracker() {
  const [filter, setFilter] = useState("all")
  const [items, setItems] = useLocalStorage("alpha.replies", [])

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter)
  const markDone = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">💬</div>
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Reply Tracker</h3>
          <p className="text-xs text-white/30">When someone replies, it appears here. No fake replies — only real ones you log.</p>
        </div>
        <span className="ml-auto text-xs text-white/30">{filtered.length} replies</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["hot", "Hot"],
          ["warm", "Warm"],
          ["meeting", "Meeting"],
          ["cold", "Cold"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border transition ${filter === id ? "bg-[#FFD700] text-[#0B0215] border-[#FFD700]" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
          <div className="text-3xl">💬</div>
          <p className="text-sm text-white/60 mt-2 font-bold">No replies yet — real ones will appear here</p>
          <p className="text-xs text-white/30 mt-1 max-w-md mx-auto">Usefulness: you send outreach → when they reply, mark as Hot/Warm/Meeting. Follow-ups due and meetings booked show here. No fake data, only when you log a reply.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((r) => {
            const cfg = statusCfg[r.status]
            return (
              <div key={r.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black text-white shrink-0">{r.avatar || r.from?.slice(0,2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{r.from}</span>
                      <span className="text-xs text-white/50 truncate">{r.company}</span>
                      <span className="ml-auto text-xs text-white/30">{r.time}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1 line-clamp-2">{r.snippet}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${cfg.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} /> {cfg.label}
                      </span>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => markDone(r.id)} className="px-3 py-1.5 rounded-full bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase">Done</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <p className="text-center text-sm text-white/30 py-4">No replies in this filter.</p>}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/40">Follow-ups Due</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{items.filter(i=>i.status!=="meeting").length}</div>
          <div className="text-xs text-white/30">Real count</div>
        </div>
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/40">Meetings Booked</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{items.filter(i=>i.status==="meeting").length}</div>
          <div className="text-xs text-white/30">Real count</div>
        </div>
      </div>
    </div>
  )
}
