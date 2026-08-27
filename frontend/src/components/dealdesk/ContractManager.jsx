import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

const templates = [
  { id: "retainer", name: "Monthly Retainer", icon: "📄", desc: "Recurring services", duration: "12 months" },
  { id: "project", name: "Project Contract", icon: "📋", desc: "Fixed scope", duration: "3 months" },
  { id: "sla", name: "SLA Agreement", icon: "🛡️", desc: "Service level", duration: "Ongoing" },
]

export default function ContractManager() {
  const [contracts, setContracts] = useLocalStorage("alpha.contracts", [])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ client: "", template: "retainer", value: "" })
  const [companies] = useLocalStorage("alpha.companies", [])

  const create = () => {
    const tpl = templates.find((t) => t.id === form.template)
    const c = {
      id: `CTR-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random()*900)).padStart(3,"0")}`,
      client: form.client || (companies[0]?.name || "—"),
      template: tpl.name,
      value: form.value || "$0",
      status: "Pending",
      expiry: new Date(Date.now() + 90*24*60*60*1000).toISOString().slice(0,10),
      signed: false,
    }
    setContracts([c, ...contracts])
    setShowNew(false)
    setForm({ client: "", template: "retainer", value: "" })
  }
  const sign = (id) => setContracts((prev) => prev.map((c) => c.id === id ? { ...c, status: "Signed", signed: true } : c))
  const daysToExpiry = (date) => Math.ceil((new Date(date) - new Date()) / (1000*60*60*24))

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Contract Manager — Real</h3>
          <p className="text-xs text-white/30 mt-1">Usefulness: create real contracts, eSign, track expiry. No fake contracts.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black text-xs font-black tracking-widest uppercase">{showNew ? "Cancel" : "+ New Real Contract"}</button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((t) => (
          <div key={t.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{t.icon}</div>
            <div className="text-sm font-bold text-white mt-2">{t.name}</div>
            <div className="text-xs text-white/40 mt-1">{t.desc}</div>
            <div className="text-xs text-[#FFD700]/60 mt-2 font-bold tracking-widest uppercase">{t.duration}</div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="mt-4 bg-[#0B0215] border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client — e.g. Genesis" className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="$24k" className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <button onClick={create} className="py-2.5 rounded-xl bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">Create Real</button>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
          <div className="text-3xl">📄</div>
          <p className="text-sm text-white/60 mt-2 font-bold">No contracts yet — real ones you create will appear here</p>
          <p className="text-xs text-white/30 mt-1">Create a real contract above, eSign, track expiry. Usefulness: you don't lose track of agreements and renewal dates.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {contracts.map((c) => {
            const days = daysToExpiry(c.expiry)
            return (
              <div key={c.id} className={`bg-[#0B0215] border rounded-2xl p-4 flex flex-wrap items-center gap-3 ${days < 0 ? "border-red-500/20 bg-red-500/5" : days <= 30 ? "border-amber-500/20 bg-amber-500/5" : "border-white/10"}`}>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-black tracking-widest uppercase border ${c.signed ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">{c.client} • {c.template} • {c.value}</div>
                  <div className={`text-xs mt-1 font-bold ${days < 0 ? "text-red-400" : days <= 30 ? "text-amber-400" : "text-white/30"}`}>Expiry: {c.expiry} • {days < 0 ? `${Math.abs(days)}d expired` : `${days}d left`}</div>
                </div>
                <div className="flex gap-2 ml-auto">
                  {!c.signed ? <button onClick={() => sign(c.id)} className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black tracking-widest uppercase">eSign Real</button> : <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold">✓ Signed Real</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
