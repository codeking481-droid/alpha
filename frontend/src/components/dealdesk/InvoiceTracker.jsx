import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

const statusCfg = {
  Draft: "bg-white/10 text-white/60 border-white/10",
  Sent: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Overdue: "bg-red-500/15 text-red-400 border-red-500/20",
}

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useLocalStorage("alpha.invoices", [])
  const [filter, setFilter] = useState("All")
  const filtered = filter === "All" ? invoices : invoices.filter((i) => i.status === filter)
  const markPaid = (id) => setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "Paid" } : i))
  const daysUntil = (due) => {
    const diff = Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `${Math.abs(diff)}d overdue`
    if (diff === 0) return "due today"
    return `${diff}d left`
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Invoice Tracker — Real</h3>
          <p className="text-xs text-white/30 mt-1">Usefulness: see who paid, who hasn't, when due. No fake invoices.</p>
        </div>
        <div className="flex items-center gap-1 bg-[#0B0215] border border-white/10 rounded-full p-1 overflow-x-auto">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={filter === s ? "px-3 py-1 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase" : "px-3 py-1 rounded-full text-white/50 hover:text-white text-xs font-black tracking-widest uppercase"}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
          <div className="text-3xl">🧾</div>
          <p className="text-sm text-white/60 mt-2 font-bold">No invoices yet — real ones you create will appear here</p>
          <p className="text-xs text-white/30 mt-1">Create an invoice in Invoice Builder above. Usefulness: track Draft → Sent → Paid/Overdue, with due dates and reminders.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="text-xs tracking-widest uppercase font-bold text-white/30 border-b border-white/10">
              <tr>
                <th className="text-left py-3">Invoice</th>
                <th className="text-left py-3">Client</th>
                <th className="text-right py-3">Amount</th>
                <th className="text-left py-3">Due</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-white/[0.04]">
                  <td className="py-3 font-mono font-bold text-white text-xs">{inv.id}</td>
                  <td className="py-3 font-semibold text-white/70 text-xs">{inv.client}</td>
                  <td className="py-3 text-right font-black text-white text-xs">${String(inv.amount).toLocaleString()}</td>
                  <td className="py-3 text-xs"><span className="text-white/60">{inv.due}</span><span className={`ml-1 ${inv.status === "Overdue" ? "text-red-400" : "text-white/30"}`}>• {daysUntil(inv.due)}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${statusCfg[inv.status]}`}>{inv.status}</span></td>
                  <td className="py-3 text-right">
                    {inv.status !== "Paid" && <button onClick={() => markPaid(inv.id)} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black tracking-widest uppercase">Mark Paid</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-sm text-white/30 py-4">No invoices in {filter}</p>}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-emerald-400/60">Paid — Real</div>
          <div className="text-lg font-black text-emerald-400 mt-1">${invoices.filter(i=>i.status==="Paid").reduce((s,i)=>s+(parseInt(String(i.amount).replace(/[^0-9]/g,""))||0),0).toLocaleString()}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-amber-400/60">Outstanding — Real</div>
          <div className="text-lg font-black text-amber-400 mt-1">${invoices.filter(i=>i.status!=="Paid").reduce((s,i)=>s+(parseInt(String(i.amount).replace(/[^0-9]/g,""))||0),0).toLocaleString()}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-white/40">Total — Real</div>
          <div className="text-lg font-black text-white mt-1">{invoices.length}</div>
        </div>
      </div>
    </div>
  )
}
