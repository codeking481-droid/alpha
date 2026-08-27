import { useState } from "react"
import ClientList from "../components/dealdesk/ClientList"
import InvoiceBuilder from "../components/dealdesk/InvoiceBuilder"
import InvoiceTracker from "../components/dealdesk/InvoiceTracker"
import ContractManager from "../components/dealdesk/ContractManager"
import RevenueChart from "../components/dealdesk/RevenueChart"

const clients = [
  { id: 1, name: "Adebayo Oke", company: "Paystack Alumni Co", status: "Active", totalBilled: "$42k", mrr: "$6k", lastInvoice: "INV-2026-1042 • Aug 15" },
  { id: 2, name: "Sarah Chen", company: "Dominion Labs", status: "Active", totalBilled: "$68k", mrr: "$8.5k", lastInvoice: "INV-2026-1041 • Aug 10" },
  { id: 3, name: "Chidi Nwosu", company: "Genesis Media", status: "Active", totalBilled: "$36k", mrr: "$4.2k", lastInvoice: "INV-2026-1039 • Jul 30" },
  { id: 4, name: "Emily Roth", company: "Venture Builders", status: "At Risk", totalBilled: "$18k", mrr: "$3.8k", lastInvoice: "INV-2026-1043 • Aug 20" },
  { id: 5, name: "Tunde Balogun", company: "AlphaTek Partners", status: "Paused", totalBilled: "$12k", mrr: "$0", lastInvoice: "INV-2026-1035 • Jun 12" },
]

const mrrData = [
  { label: "Apr", value: 42000 },
  { label: "May", value: 56000 },
  { label: "Jun", value: 68000 },
  { label: "Jul", value: 82000 },
  { label: "Aug", value: 97000 },
  { label: "Sep", value: 103000 },
]

const byClient = [
  { label: "Dominion Labs", value: 28000, share: "27%" },
  { label: "Genesis Media", value: 22000, share: "21%" },
  { label: "AlphaTek X", value: 18000, share: "17%" },
  { label: "Paystack Alumni", value: 15000, share: "14%" },
  { label: "Venture Builders", value: 12000, share: "11%" },
]

const projected = {
  total: "$318k",
  period: "Sep — Nov 2026",
  breakdown: [
    { label: "Sep", value: "$103k", trend: "+6%" },
    { label: "Oct", value: "$107k", trend: "+4%" },
    { label: "Nov", value: "$108k", trend: "+1%" },
  ],
}

export default function DealDesk() {
  const [selected, setSelected] = useState(null)
  const [revenue, setRevenue] = useState("$103k")

  const handleInvoice = (inv) => {
    // mock update revenue
    setRevenue("$109k")
  }

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      {/* Sub header with premium gradient */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-[#0B0215] font-black shadow-gold text-lg">💰</div>
          <div>
            <h1 className="premium-heading text-2xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent">DEAL DESK</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">The Money Engine • Premium Beyond Imagination</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => document.getElementById("invoice-builder")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black tracking-widest uppercase text-xs hover:scale-105 transition shadow-gold">+ Create Invoice</button>
          <button className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs tracking-widest uppercase hover:border-[#FFD700] hover:text-[#FFD700] transition">Add Client</button>
          <button className="hidden sm:inline px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs tracking-widest uppercase hover:border-emerald-500 hover:text-emerald-400 transition">New Contract</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-10 space-y-6">
        {/* Revenue KPIs — premium numbers 5xl */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="gold-card p-8 rounded-2xl animate-slideUp">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Total Revenue</div>
            <div className="text-5xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent mt-3">{revenue}</div>
            <div className="text-xs text-emerald-400 font-bold mt-2">↗ +12.4% vs last quarter</div>
            <div className="mt-3 h-1.5 bg-[#0B0215]/50 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full"></div></div>
          </div>
          <div className="glass p-8 rounded-2xl animate-slideUp" style={{ animationDelay: "0.05s" }}>
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">MRR</div>
            <div className="text-5xl font-black tracking-tight text-white mt-3">$31k</div>
            <div className="text-xs text-emerald-400 font-bold mt-2">↗ +8.2% MoM</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[62%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div></div>
          </div>
          <div className="glass p-8 rounded-2xl animate-slideUp" style={{ animationDelay: "0.1s" }}>
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Churn</div>
            <div className="text-5xl font-black tracking-tight text-white mt-3">2.1%</div>
            <div className="text-xs text-emerald-400 font-bold mt-2">↘ -0.4% vs last month</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[12%] bg-gradient-to-r from-red-400 to-amber-500 rounded-full"></div></div>
          </div>
          <div className="glass p-8 rounded-2xl animate-slideUp" style={{ animationDelay: "0.15s" }}>
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Avg Deal Size</div>
            <div className="text-5xl font-black tracking-tight text-white mt-3">$8.4k</div>
            <div className="text-xs text-white/30 font-bold mt-2">Median • 12 deals</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[48%] bg-gradient-to-r from-sky-400 to-violet-500 rounded-full"></div></div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex gap-6 text-xs">
            <span className="text-white/40">Active contracts <span className="text-white font-black">5</span></span>
            <span className="text-white/20">•</span>
            <span className="text-white/40">Outstanding invoices <span className="text-amber-400 font-black">3</span></span>
            <span className="text-white/20">•</span>
            <span className="text-white/40">Expiring soon <span className="text-red-400 font-black">1</span></span>
          </div>
          <div className="text-xs text-white/30">Updated 5 min ago • D1 live</div>
        </div>

        {/* Revenue Chart */}
        <RevenueChart mrrData={mrrData} byClient={byClient} projected={projected} />

        {/* Client List + Invoice Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientList clients={clients} onSelect={setSelected} />
          <div className="space-y-6">
            {selected && (
              <div className="gold-card rounded-2xl p-6 animate-fadeIn border border-[#FFD700]/20">
                <div className="text-sm font-bold text-[#FFD700]">{selected.name} — {selected.company}</div>
                <div className="text-xs text-white/60 mt-1">Status: {selected.status} • Billed: {selected.totalBilled} • MRR: {selected.mrr}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-4 py-2 rounded-full bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">View Invoices</button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold">Close</button>
                </div>
              </div>
            )}
            <InvoiceTracker />
          </div>
        </div>

        {/* Invoice Builder */}
        <div id="invoice-builder">
          <InvoiceBuilder onCreate={handleInvoice} />
        </div>

        {/* Contract Manager */}
        <ContractManager />

        {/* Footer */}
        <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">✓</div>
            <div><div className="text-sm font-bold text-white">Money engine — live</div><div className="text-xs text-white/40">Invoices via email • Contracts eSigned • Revenue synced</div></div>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black tracking-widest uppercase">Export CSV</button>
            <button className="px-5 py-2.5 rounded-xl bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">Sync Stripe</button>
          </div>
        </div>
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Deal Desk • Where money comes in • $10K/month agency experience 🇳🇬🔥🚀
      </footer>
    </div>
  )
}
