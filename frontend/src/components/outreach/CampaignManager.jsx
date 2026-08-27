import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

export default function CampaignManager({ onCreate }) {
  const [campaigns, setCampaigns] = useLocalStorage("alpha.campaigns", [])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: "", company: "" })

  const create = () => {
    if (!form.name.trim()) return
    const c = { id: Date.now(), name: form.name.trim(), company: form.company.trim() || "—", leads: 0, sent: 0, replied: 0, meetings: 0, status: "draft" }
    const next = [c, ...campaigns]
    setCampaigns(next)
    onCreate?.(c)
    setForm({ name: "", company: "" })
    setShowNew(false)
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Campaign Manager</h3>
          <p className="text-xs text-white/30 mt-1">Group leads → send outreach → track replies. No fakes — only your campaigns.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="px-4 py-2 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase">+ New Campaign</button>
      </div>

      {showNew && (
        <div className="mt-4 bg-[#0B0215] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-3 animate-fadeIn">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Campaign name — e.g. Lagos Fintech Q3" className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company — e.g. Genesis" className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <button onClick={create} className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase">Create</button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
          <div className="text-3xl">📊</div>
          <p className="text-sm text-white/60 mt-2 font-bold">No campaigns yet — real ones you create will appear here</p>
          <p className="text-xs text-white/30 mt-1 max-w-md mx-auto">Campaigns group your leads. Create one, add leads from Lead Finder, then track sent → replied → meetings. Usefulness: you see what's working.</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black text-xs tracking-widest uppercase">Create First Campaign</button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {campaigns.map((c) => {
            const sentPct = c.leads ? Math.round((c.sent / c.leads) * 100) : 0
            const replyPct = c.sent ? Math.round((c.replied / c.sent) * 100) : 0
            return (
              <div key={c.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4">
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
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" style={{ width: `${sentPct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-white/30"><span>{c.sent}/{c.leads} sent</span><span>Real data</span></div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
