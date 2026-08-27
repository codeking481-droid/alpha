import { useState } from "react"

const statusCfg = {
  Draft: "bg-white/10 text-white/60 border-white/10",
  Sent: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Overdue: "bg-red-500/15 text-red-400 border-red-500/20 animate-pulse",
}

const initial = [
  { id: "INV-2026-1042", client: "Genesis", amount: 6000, due: "2026-08-30", status: "Sent" },
  { id: "INV-2026-1041", client: "Dominion", amount: 8500, due: "2026-08-25", status: "Paid" },
  { id: "INV-2026-1039", client: "AlphaTek X", amount: 4200, due: "2026-08-20", status: "Overdue" },
  { id: "INV-2026-1043", client: "Venture Labs", amount: 3800, due: "2026-09-05", status: "Draft" },
  { id: "INV-2026-1038", client: "Genesis", amount: 6000, due: "2026-07-30", status: "Paid" },
]

export default function InvoiceTracker() {
  const [invoices, setInvoices] = useState(initial)
  const [filter, setFilter] = useState("All")

  const filtered = filter === "All" ? invoices : invoices.filter((i) => i.status === filter)

  const markPaid = (id) => setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "Paid" } : i))
  const sendReminder = (id) => {
    // mock toast
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, reminderSent: true } : i))
    setTimeout(() => setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, reminderSent: false } : i)), 2000)
  }

  const daysUntil = (due) => {
    const diff = Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `${Math.abs(diff)}d overdue`
    if (diff === 0) return "due today"
    return `${diff}d left`
  }

  return (
    <div className="glass rounded-2xl p-8 animate-slideUp">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Invoice Tracker</h3>
        <div className="flex items-center gap-2 bg-[#0B0215] border border-white/10 rounded-full p-1">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={filter === s ? "px-3 py-1 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase" : "px-3 py-1 rounded-full text-white/50 hover:text-white text-xs font-black tracking-widest uppercase transition"}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs tracking-widest uppercase font-bold text-white/30 border-b border-white/10">
            <tr>
              <th className="text-left py-3 font-bold">Invoice</th>
              <th className="text-left py-3 font-bold">Client</th>
              <th className="text-right py-3 font-bold">Amount</th>
              <th className="text-left py-3 font-bold">Due</th>
              <th className="text-left py-3 font-bold">Status</th>
              <th className="text-right py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition">
                <td className="py-3 font-mono font-bold text-white">{inv.id}</td>
                <td className="py-3 font-semibold text-white/70">{inv.client}</td>
                <td className="py-3 text-right font-black text-white">${inv.amount.toLocaleString()}</td>
                <td className="py-3">
                  <span className="text-white/60 text-xs">{inv.due}</span>
                  <span className={`ml-2 text-xs font-bold ${inv.status === "Overdue" ? "text-red-400" : "text-white/30"}`}>• {daysUntil(inv.due)}</span>
                </td>
                <td className="py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${statusCfg[inv.status]}`}>{inv.status}</span>
                  {inv.reminderSent && <span className="ml-2 text-xs text-emerald-400 font-bold">✓ reminder sent</span>}
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {inv.status !== "Paid" && <button onClick={() => markPaid(inv.id)} className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black tracking-widest uppercase hover:bg-emerald-600 transition">Mark Paid</button>}
                    {inv.status === "Overdue" || inv.status === "Sent" ? <button onClick={() => sendReminder(inv.id)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">Remind</button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-sm text-white/30 py-8">No invoices in {filter}</p>}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-emerald-400/60">Paid</div>
          <div className="text-lg font-black text-emerald-400 mt-1">${initial.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.amount,0).toLocaleString()}</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-amber-400/60">Outstanding</div>
          <div className="text-lg font-black text-amber-400 mt-1">${initial.filter(i=>i.status!=="Paid").reduce((s,i)=>s+i.amount,0).toLocaleString()}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-xs tracking-widest uppercase font-bold text-red-400/60">Overdue</div>
          <div className="text-lg font-black text-red-400 mt-1">1</div>
        </div>
      </div>
    </div>
  )
}
