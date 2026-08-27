import { useState } from "react"

const mockReplies = [
  { id: 1, from: "Adebayo Oke", company: "Paystack Alumni Co", subject: "Re: Quick idea for Paystack Alumni Co", snippet: "Love the loom idea. Can we do Tue 10am WAT? Send the teardown.", time: "2h ago", status: "hot", followUp: "2026-08-28", avatar: "AO" },
  { id: 2, from: "Sarah Chen", company: "Dominion Labs", subject: "Re: SaaS outreach system", snippet: "25% reply rate is wild. How do you handle follow-ups?", time: "5h ago", status: "warm", followUp: "2026-08-29", avatar: "SC" },
  { id: 3, from: "Emily Roth", company: "Venture Builders", subject: "Re: Agency OS", snippet: "Booked — see you Thu. Bring the case study.", time: "1d ago", status: "meeting", followUp: "2026-09-04", avatar: "ER" },
  { id: 4, from: "Chidi Nwosu", company: "Genesis Media", subject: "Re: Lagos fintech campaign", snippet: "Not now, but Q4. Keep me in loop.", time: "2d ago", status: "cold", followUp: "2026-10-01", avatar: "CN" },
]

const statusCfg = {
  hot: { label: "Hot Lead", dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  warm: { label: "Warm", dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  meeting: { label: "Meeting", dot: "bg-sky-400", badge: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  cold: { label: "Cold", dot: "bg-white/20", badge: "bg-white/5 text-white/40 border-white/10" },
}

export default function ReplyTracker() {
  const [filter, setFilter] = useState("all")
  const [items, setItems] = useState(mockReplies)

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter)

  const markDone = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">💬</div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Reply Tracker</h3>
        <span className="ml-auto text-xs text-white/30">{filtered.length} replies</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Inbox • follow-ups • meetings — never lose a hot lead</p>

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

      <div className="mt-4 space-y-3">
        {filtered.map((r) => {
          const cfg = statusCfg[r.status]
          return (
            <div key={r.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xs font-black text-white shrink-0">{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{r.from}</span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50 truncate">{r.company}</span>
                    <span className="ml-auto text-xs text-white/30">{r.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-white/70 truncate mt-0.5">{r.subject}</div>
                  <div className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">{r.snippet}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${cfg.badge}`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} /> {cfg.label}
                    </span>
                    <span className="text-xs text-white/30">Follow-up: <span className="text-white/60 font-semibold">{r.followUp}</span></span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => markDone(r.id)} className="px-3 py-1.5 rounded-full bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-white/90 transition">Done</button>
                      <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">Snooze</button>
                      <button className="px-3 py-1.5 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-[#ffdf33] transition">Book Meeting</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-sm text-white/30 py-8">No replies in this filter.</p>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3">
          <div className="text-xs tracking-widest uppercase font-bold text-white/40">Follow-ups Due</div>
          <div className="text-2xl font-black text-amber-400 mt-1">3</div>
          <div className="text-xs text-white/30">Next: tomorrow 10am WAT</div>
        </div>
        <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3">
          <div className="text-xs tracking-widest uppercase font-bold text-white/40">Meetings Booked</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">4</div>
          <div className="text-xs text-white/30">This week</div>
        </div>
      </div>
    </div>
  )
}
