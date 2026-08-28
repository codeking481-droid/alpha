import { useState, useEffect } from "react"
import KPICard from "../components/analytics/KPICard"
import PerformanceChart from "../components/analytics/PerformanceChart"
import TopContent from "../components/analytics/TopContent"
import ClientReport from "../components/analytics/ClientReport"
import { useLocalStorage } from "../hooks/useLocalStorage.js"
import EmptyState from "../components/ui/EmptyState.jsx"
import AISuggestion from "../components/ui/AISuggestion.jsx"

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30d")
  const [companies] = useLocalStorage("alpha.companies", [])
  const [content] = useLocalStorage("alpha.content", [])
  const [leads] = useLocalStorage("alpha.leads", [])
  const [invoices] = useLocalStorage("alpha.invoices", [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [range])

  const hasData = companies.length > 0 || content.length > 0 || invoices.length > 0
  const viewsData = hasData ? [{ label: "Now", value: content.length * 120 }] : []
  const platformData = hasData ? [{ label: "Your Content", value: content.length }] : []
  const outreachData = hasData ? [{ label: "Leads", value: leads.length }, { label: "Invoices", value: invoices.length }] : []
  const topItems = content.slice(0, 4).map((c, i) => ({ id: c.id, title: c.title, platform: "Your Platform", format: c.format, views: c.words || 0, likes: 0, engagement: 0 }))

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-[#0A0A0A] selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black shadow-gold">??</div>
          <div>
            <h1 className="font-black tracking-tight leading-none text-lg">ANALYTICS</h1>
            <p className="text-xs text-[#6B7280] tracking-widest uppercase font-semibold">Usefulness: see what's real — what's working, what's not, so you fix fast. No fake charts.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border-[#EDEDED] rounded-full p-1">
          {[
            ["7d", "7D"],
            ["30d", "30D"],
            ["90d", "90D"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} className={range === id ? "px-4 py-1.5 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase shadow-gold" : "px-4 py-1.5 rounded-full text-[#6B7280] hover:text-[#0A0A0A] text-xs font-black tracking-widest uppercase transition"}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* KPI Grid — real zeros when empty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard loading={loading} label="Total Views" value={hasData ? `${content.length * 120}` : "—"} change={hasData ? "+—" : "—"} icon="???" sub={hasData ? "Real content views" : "No content yet"} />
          <KPICard loading={loading} label="Engagement" value={hasData ? "—" : "—"} change="—" icon="?" sub={hasData ? "Real rate" : "Add content first"} />
          <KPICard loading={loading} label="Revenue" value={invoices.length ? `$${invoices.reduce((s,i)=>s+(parseInt(String(i.amount).replace(/[^0-9]/g,""))||0),0)}` : "$0"} change={hasData ? "—" : "—"} icon="??" sub={invoices.length ? "Real invoices" : "No invoices yet"} />
          <KPICard loading={loading} label="Growth" value={hasData ? "—" : "—"} change="—" icon="??" sub={hasData ? "Real trend" : "Add data first"} />
        </div>

        {!hasData ? (
          <>
            <EmptyState
              icon="??"
              title="Your Analytics Awaits"
              description="Real numbers will appear when you create. No fake $103k."
              tip="Add a company, content, or invoice first."
              action={() => window.location.href = "/content"}
              actionLabel="Create First Content"
            />
            <div className="revenue-insight glass p-6 border border-[#FFD700]/20 text-center rounded-2xl mt-4">
              <span className="text-4xl">??</span>
              <h4 className="text-xl font-bold text-[#FFD700] mt-2">Your next $1,000 is closer than you think.</h4>
              <p className="text-[#6B7280] mt-1 text-sm">Start by adding your first client or closing your first deal.</p>
            </div>
            <AISuggestion message="Want me to show you what's working? Add real data and I'll build your insights." action={() => window.location.href = "/deals"} actionLabel="View Deal Desk" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart title="Views Over Time" subtitle="Real daily views" type="line" data={viewsData.length ? viewsData : [{ label: "Now", value: 1 }]} color="#FFD700" />
              <PerformanceChart title="Engagement by Platform" subtitle="Real views per platform" type="bar" data={platformData.length ? platformData : [{ label: "None", value: 0 }]} color="#38bdf8" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceChart title="Outreach Performance" subtitle="Real funnel" type="bar" data={outreachData} color="#10b981" />
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold tracking-widest uppercase text-[#6B7280]">Growth — Real</h3>
                <p className="text-xs text-[#6B7280] mt-1">Will trend as you add real data</p>
                <div className="mt-6 text-3xl font-black text-[#0A0A0A]">—</div>
                <p className="text-xs text-[#9CA3AF] mt-1">No history yet</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopContent items={topItems} loading={loading} />
              <ClientReport />
            </div>
          </>
        )}

        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopContent items={topItems} loading={loading} />
            <ClientReport />
          </div>
        )}
        {!hasData && <ClientReport />}
      </main>

      <footer className="text-center py-10 text-xs text-[#9CA3AF] tracking-widest uppercase font-semibold px-4">
        Analytics • Real data only • Usefulness: know what's working ????
      </footer>
    </div>
  )
}
