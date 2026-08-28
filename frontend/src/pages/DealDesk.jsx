import { useState } from "react"
import ClientList from "../components/dealdesk/ClientList"
import InvoiceBuilder from "../components/dealdesk/InvoiceBuilder"
import InvoiceTracker from "../components/dealdesk/InvoiceTracker"
import ContractManager from "../components/dealdesk/ContractManager"
import RevenueChart from "../components/dealdesk/RevenueChart"
import { useLocalStorage } from "../hooks/useLocalStorage.js"
import EmptyState from "../components/ui/EmptyState.jsx"
import AISuggestion from "../components/ui/AISuggestion.jsx"

export default function DealDesk() {
  const [clients] = useLocalStorage("alpha.companies", [])
  const [invoices] = useLocalStorage("alpha.invoices", [])
  const [contracts] = useLocalStorage("alpha.contracts", [])
  const [selected, setSelected] = useState(null)

  const totalRevenue = invoices.reduce((s, i) => s + (parseInt(String(i.amount).replace(/[^0-9]/g, "")) || 0), 0)
  const revenueStr = totalRevenue ? `$${totalRevenue.toLocaleString()}` : "$0"
  const hasData = clients.length > 0 || invoices.length > 0

  // Empty chart data when no real data
  const mrrData = hasData ? [{ label: "Now", value: totalRevenue }] : []
  const byClient = hasData ? clients.slice(0, 5).map((c) => ({ label: c.company || c.name, value: parseInt((c.totalBilled || "$0").replace(/[^0-9]/g, "")) || 0, share: "—" })) : []
  const projected = { total: hasData ? `$${(totalRevenue * 3).toLocaleString()}` : "$0", period: hasData ? "Next 90 days" : "Add invoices first", breakdown: hasData ? [{ label: "Now", value: revenueStr, trend: "—" }] : [] }

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-[#0A0A0A] selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#F59E0B] flex items-center justify-center text-[#0B0215] font-black shadow-gold text-lg">??</div>
          <div>
            <h1 className="premium-heading text-2xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent">DEAL DESK</h1>
            <p className="text-xs text-[#6B7280] tracking-widest uppercase font-semibold">Usefulness: clients ? invoices ? contracts ? money. No fake $103k — only your real revenue.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => document.getElementById("invoice-builder")?.scrollIntoView({ behavior: "smooth" })} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black tracking-widest uppercase text-xs hover:scale-105 transition shadow-gold min-h-[48px]">+ Create Real Invoice</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="gold-card p-6 sm:p-8 rounded-2xl animate-slideUp">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Total Revenue — Real</div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-[#FFD700] to-[#F59E0B] bg-clip-text text-transparent mt-3">{revenueStr}</div>
            <div className="text-xs text-[#9CA3AF] mt-2">{hasData ? "From your invoices" : "No invoices yet"}</div>
          </div>
          <div className="glass p-6 sm:p-8 rounded-2xl">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Clients — Real</div>
            <div className="text-3xl sm:text-5xl font-black text-[#0A0A0A] mt-3">{clients.length}</div>
            <div className="text-xs text-[#9CA3AF] mt-2">{clients.length ? "Your companies" : "Add in Command Hub"}</div>
          </div>
          <div className="glass p-6 sm:p-8 rounded-2xl">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Invoices — Real</div>
            <div className="text-3xl sm:text-5xl font-black text-[#0A0A0A] mt-3">{invoices.length}</div>
            <div className="text-xs text-[#9CA3AF] mt-2">{invoices.length ? "You created" : "0 — create below"}</div>
          </div>
          <div className="glass p-6 sm:p-8 rounded-2xl">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Contracts — Real</div>
            <div className="text-3xl sm:text-5xl font-black text-[#0A0A0A] mt-3">{contracts.length}</div>
            <div className="text-xs text-[#9CA3AF] mt-2">{contracts.length ? "Real agreements" : "0 — add below"}</div>
          </div>
        </div>

        {!hasData && (
          <>
            <EmptyState
              icon="??"
              title="Your Deal Desk"
              description="Your first dollar is coming. Let's go."
              tip="Tip: Start by adding your first client."
              action={() => document.getElementById("invoice-builder")?.scrollIntoView({ behavior: "smooth" })}
              actionLabel="+ Add Your First Client"
            />
            <AISuggestion message="Want me to help you close your first deal? I can draft a proposal for you." action={() => document.getElementById("invoice-builder")?.scrollIntoView({ behavior: "smooth" })} actionLabel="Draft Proposal" />
          </>
        )}

        <RevenueChart mrrData={mrrData} byClient={byClient} projected={projected} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClientList clients={clients} onSelect={setSelected} />
          <div className="space-y-6">
            {selected && (
              <div className="gold-card rounded-2xl p-6 border border-[#FFD700]/20">
                <div className="text-sm font-bold text-[#FFD700]">{selected.name} — {selected.company || selected.name}</div>
                <div className="text-xs text-[#6B7280] mt-1">Status: {selected.status}</div>
                <button onClick={() => setSelected(null)} className="mt-3 px-4 py-2 rounded-full bg-[#F9FAFB] border border-[#EDEDED] text-[#0A0A0A] text-xs font-bold">Close</button>
              </div>
            )}
            <InvoiceTracker />
          </div>
        </div>

        <div id="invoice-builder">
          <InvoiceBuilder onCreate={() => {}} />
        </div>
        <ContractManager />
      </main>

      <footer className="text-center py-10 text-xs text-[#9CA3AF] tracking-widest uppercase font-semibold px-4">
        Deal Desk • Real money only • No fakes ????
      </footer>
    </div>
  )
}
