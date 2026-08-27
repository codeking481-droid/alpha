import { useState } from "react"

const templates = [
  { id: "retainer", name: "Monthly Retainer", icon: "📄", desc: "Recurring monthly services", duration: "12 months" },
  { id: "project", name: "Project Contract", icon: "📋", desc: "Fixed scope + deliverables", duration: "3 months" },
  { id: "sla", name: "SLA Agreement", icon: "🛡️", desc: "Service level + uptime", duration: "Ongoing" },
]

const initialContracts = [
  { id: "CTR-2026-011", client: "Genesis", template: "Monthly Retainer", value: "$72k", status: "Signed", expiry: "2027-02-15", signed: true },
  { id: "CTR-2026-012", client: "Dominion", template: "Project Contract", value: "$28k", status: "Pending", expiry: "2026-11-30", signed: false },
  { id: "CTR-2026-010", client: "AlphaTek X", template: "SLA Agreement", value: "$18k", status: "Expiring Soon", expiry: "2026-09-12", signed: true },
]

export default function ContractManager() {
  const [contracts, setContracts] = useState(initialContracts)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ client: "Genesis", template: "retainer", value: "" })

  const create = () => {
    const tpl = templates.find((t) => t.id === form.template)
    const c = {
      id: `CTR-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random()*900)).padStart(3,"0")}`,
      client: form.client,
      template: tpl.name,
      value: form.value || "$0",
      status: "Pending",
      expiry: new Date(Date.now() + 90*24*60*60*1000).toISOString().slice(0,10),
      signed: false,
    }
    setContracts([c, ...contracts])
    setShowNew(false)
    setForm({ client: "Genesis", template: "retainer", value: "" })
  }

  const sign = (id) => setContracts((prev) => prev.map((c) => c.id === id ? { ...c, status: "Signed", signed: true } : c))

  const daysToExpiry = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000*60*60*24))
    return diff
  }

  return (
    <div className="glass rounded-2xl p-8 animate-slideUp">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-[#0B0215] font-black">✍️</div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Contract Manager</h3>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black text-xs font-black tracking-widest uppercase hover:scale-105 transition shadow-gold">{showNew ? "Cancel" : "+ New Contract"}</button>
      </div>

      {/* Templates */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => (
          <div key={t.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-[#FFD700]/20 transition">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{t.icon}</div>
            <div className="text-sm font-bold text-white mt-2">{t.name}</div>
            <div className="text-xs text-white/40 mt-1">{t.desc}</div>
            <div className="text-xs text-[#FFD700]/60 mt-2 font-bold tracking-widest uppercase">{t.duration}</div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="mt-4 bg-[#0B0215] border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fadeIn">
          <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            <option>Genesis</option><option>Dominion</option><option>AlphaTek X</option><option>Venture Labs</option>
          </select>
          <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value e.g. $24k" className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <button onClick={create} className="py-2.5 rounded-xl bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">Create</button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {contracts.map((c) => {
          const days = daysToExpiry(c.expiry)
          const expiring = days <= 30 && days >= 0
          const expired = days < 0
          return (
            <div key={c.id} className={`bg-[#0B0215] border rounded-2xl p-4 flex flex-wrap items-center gap-3 ${expired ? "border-red-500/20 bg-red-500/5" : expiring ? "border-amber-500/20 bg-amber-500/5" : "border-white/10"}`}>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{c.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black tracking-widest uppercase border ${c.signed ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : daysToExpiry(c.expiry) <= 30 ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-white/50 mt-1">{c.client} • {c.template} • {c.value}</div>
                <div className={`text-xs mt-1 font-bold ${expired ? "text-red-400" : expiring ? "text-amber-400" : "text-white/30"}`}>
                  Expiry: {c.expiry} • {expired ? `${Math.abs(days)}d expired` : `${days}d left`}
                  {expiring && " ⚠️ Renew soon"}
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                {!c.signed ? (
                  <button onClick={() => sign(c.id)} className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black tracking-widest uppercase hover:scale-105 transition">eSign (Mock)</button>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold">✓ Signed</span>
                )}
                <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">View</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
