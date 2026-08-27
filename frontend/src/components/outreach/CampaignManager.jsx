import { useState } from "react"

const initialCampaigns = [
  { id: 1, name: "Genesis — Lagos Fintechs", company: "Genesis", leads: 48, sent: 42, replied: 11, meetings: 4, status: "active" },
  { id: 2, name: "Dominion — SaaS Founders US", company: "Dominion", leads: 65, sent: 65, replied: 16, meetings: 6, status: "active" },
  { id: 3, name: "AlphaTek — Agency OS Beta", company: "AlphaTek X", leads: 24, sent: 12, replied: 2, meetings: 1, status: "draft" },
]

export default function CampaignManager({ campaigns: propCampaigns, onCreate }) {
  const [campaigns, setCampaigns] = useState(propCampaigns || initialCampaigns)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: "", company: "Genesis" })

  const create = () => {
    if (!form.name.trim()) return
    const c = { id: Date.now(), name: form.name, company: form.company, leads: 0, sent: 0, replied: 0, meetings: 0, status: "draft" }
    setCampaigns([c, ...campaigns])
    onCreate?.(c)
    setForm({ name: "", company: "Genesis" })
    setShowNew(false)
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">📊</div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Campaign Manager</h3>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="px-3 py-2 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-[#ffdf33] transition">+ New Campaign</button>
      </div>

      {showNew && (
        <div className="mt-4 bg-[#0B0215] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaign name — e.g. Genesis • Lagos Fintech Q3" className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50" />
          <select value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            <option>Genesis</option><option>Dominion</option><option>AlphaTek X</option><option>Venture Labs</option>
          </select>
          <button onClick={create} className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase">Create</button>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {campaigns.map((c) => {
          const sentPct = c.leads ? Math.round((c.sent / c.leads) * 100) : 0
          const replyPct = c.sent ? Math.round((c.replied / c.sent) * 100) : 0
          const meetPct = c.replied ? Math.round((c.meetings / c.replied) * 100) : 0
          return (
            <div key={c.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{c.name}</div>
                  <div className="text-xs text-white/40">{c.company} • {c.leads} leads • <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold tracking-widest uppercase ${c.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-white/10 text-white/50 border-white/10"}`}>{c.status}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold tracking-widest uppercase text-white/40">Reply Rate</div>
                  <div className="text-lg font-black text-[#FFD700]">{replyPct}%</div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {/* Sent */}
                <div>
                  <div className="flex justify-between text-xs font-bold tracking-widest uppercase text-white/40"><span>Sent</span><span className="text-white/60">{c.sent}/{c.leads}</span></div>
                  <div className="mt-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full transition-all" style={{ width: `${sentPct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-widest uppercase text-white/40"><span>Replied</span><span className="text-white/60">{c.replied}/{c.sent}</span></div>
                    <div className="mt-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${replyPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold tracking-widest uppercase text-white/40"><span>Meetings</span><span className="text-white/60">{c.meetings}/{c.replied || 1}</span></div>
                    <div className="mt-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full" style={{ width: `${meetPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-white/90 transition">View Leads</button>
                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">Analytics</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
