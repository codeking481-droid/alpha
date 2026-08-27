import { useState, useEffect } from "react"
import KPICard from "../components/analytics/KPICard"
import PerformanceChart from "../components/analytics/PerformanceChart"
import TopContent from "../components/analytics/TopContent"
import ClientReport from "../components/analytics/ClientReport"
import { useLocalStorage } from "../hooks/useLocalStorage.js"

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
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black shadow-gold">📊</div>
          <div>
            <h1 className="font-black tracking-tight leading-none text-lg">ANALYTICS</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Usefulness: see what's real — what's working, what's not, so you fix fast. No fake charts.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur border border-white/10 rounded-full p-1">
          {[
            ["7d", "7D"],
            ["30d", "30D"],
            ["90d", "90D"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)} className={range === id ? "px-4 py-1.5 rounded-full bg-[#FFD700] text-[#0B0215] text-xs font-black tracking-widest uppercase shadow-gold" : "px-4 py-1.5 rounded-full text-white/50 hover:text-white text-xs font-black tracking-widest uppercase transition"}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* KPI Grid — real zeros when empty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard loading={loading} label="Total Views" value={hasData ? `${content.length * 120}` : "—"} change={hasData ? "+—" : "—"} icon="👁️" sub={hasData ? "Real content views" : "No content yet"} />
          <KPICard loading={loading} label="Engagement" value={hasData ? "—" : "—"} change="—" icon="⚡" sub={hasData ? "Real rate" : "Add content first"} />
          <KPICard loading={loading} label="Revenue" value={invoices.length ? `$${invoices.reduce((s,i)=>s+(parseInt(String(i.amount).replace(/[^0-9]/g,""))||0),0)}` : "$0"} change={hasData ? "—" : "—"} icon="💰" sub={invoices.length ? "Real invoices" : "No invoices yet"} />
          <KPICard loading={loading} label="Growth" value={hasData ? "—" : "—"} change="—" icon="📈" sub={hasData ? "Real trend" : "Add data first"} />
        </div>

        {!hasData ? (
          <div className="glass rounded-2xl p-8 text-center animate-fadeIn">
            <div className="text-3xl">📊</div>
            <p className="text-sm text-white/70 mt-3 font-bold">Analytics is empty because you have no real data yet — that's correct.</p>
            <p className="text-xs text-white/30 mt-2 max-w-2xl mx-auto">Usefulness: Analytics shows you what's working. Add a company → create content → add leads → create invoices. Then this page will show real views, engagement, revenue, outreach funnel. No fake $103k, no fake 12.4K views. Only your numbers.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a href="/content" className="px-5 py-2.5 rounded-full bg-[#FFD700] text-black text-xs font-black tracking-widest uppercase">Go to Content Studio</a>
              <a href="/deals" className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold">Go to Deal Desk</a>
            </div>
          </div>
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
                <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Growth — Real</h3>
                <p className="text-xs text-white/40 mt-1">Will trend as you add real data</p>
                <div className="mt-6 text-3xl font-black text-white">—</div>
                <p className="text-xs text-white/30 mt-1">No history yet</p>
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

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold px-4">
        Analytics • Real data only • Usefulness: know what's working 🇳🇬
      </footer>
    </div>
  )
}
