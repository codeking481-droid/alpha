import { useState, useEffect } from "react"
import KPICard from "../components/analytics/KPICard"
import PerformanceChart from "../components/analytics/PerformanceChart"
import TopContent from "../components/analytics/TopContent"
import ClientReport from "../components/analytics/ClientReport"

const viewsData = [
  { label: "Aug 1", value: 4200 },
  { label: "Aug 8", value: 6800 },
  { label: "Aug 15", value: 5900 },
  { label: "Aug 22", value: 9200 },
  { label: "Aug 29", value: 12400 },
  { label: "Sep 5", value: 10800 },
]

const outreachData = [
  { label: "Sent", value: 119 },
  { label: "Opened", value: 73 },
  { label: "Replied", value: 29 },
  { label: "Meetings", value: 11 },
]

const platformData = [
  { label: "LinkedIn", value: 5400 },
  { label: "Twitter", value: 3200 },
  { label: "Blog", value: 2100 },
  { label: "Newsletter", value: 1800 },
  { label: "YouTube", value: 1200 },
]

const topItems = [
  { id: 1, title: "The Invisible System â€” Genesis Launch", platform: "LinkedIn", format: "script", views: 12400, likes: 820, engagement: 8.4 },
  { id: 2, title: "Why Dominion Wins at Outreach (25% reply)", platform: "Blog", format: "article", views: 9200, likes: 610, engagement: 7.1 },
  { id: 3, title: "AlphaTek Agency OS Announcement", platform: "Twitter", format: "post", views: 6800, likes: 540, engagement: 6.8 },
  { id: 4, title: "7 Content Hooks That Print Meetings", platform: "Newsletter", format: "caption", views: 4300, likes: 390, engagement: 6.2 },
]

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30d")

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [range])

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      {/* Sub header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black shadow-gold">ðŸ“Š</div>
          <div>
            <h1 className="font-black tracking-tight leading-none text-lg">ANALYTICS</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Overview â€¢ content â€¢ outreach â€¢ client reports</p>
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
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard loading={loading} label="Total Views" value="12.4K" change="+18.2%" icon="ðŸ‘ï¸" sub="Last 30 days" />
          <KPICard loading={loading} label="Engagement" value="7.6%" change="+2.1%" icon="âš¡" sub="Avg across platforms" />
          <KPICard loading={loading} label="Revenue" value="$103k" change="+12.4%" icon="ðŸ’°" sub="MRR â€¢ All companies" />
          <KPICard loading={loading} label="Growth" value="+24.3%" change="+5.6%" icon="ðŸ“ˆ" sub="MoM growth rate" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart title="Views Over Time" subtitle="Daily views â€¢ last 6 weeks" type="line" data={viewsData} color="#FFD700" />
          <PerformanceChart title="Engagement by Platform" subtitle="Views per platform â€¢ 30 days" type="bar" data={platformData} color="#38bdf8" />
        </div>

        {/* Charts Row 2 + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart title="Outreach Performance" subtitle="Funnel: sent â†’ opened â†’ replied â†’ meetings" type="bar" data={outreachData} color="#10b981" />
          </div>
          <div className="glass rounded-2xl p-6 animate-slideUp flex flex-col">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Growth Trends</h3>
            <p className="text-xs text-white/40 mt-1">Trending up across all badges</p>
            <div className="mt-5 space-y-4 flex-1">
              <div>
                <div className="flex justify-between text-xs font-bold tracking-widest uppercase"><span className="text-white/40">Content</span><span className="text-emerald-400">+18%</span></div>
                <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full w-[68%] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold tracking-widest uppercase"><span className="text-white/40">Outreach</span><span className="text-emerald-400">+24%</span></div>
                <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full w-[74%] bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold tracking-widest uppercase"><span className="text-white/40">Revenue</span><span className="text-emerald-400">+12%</span></div>
                <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full w-[62%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div></div>
              </div>
              <div className="pt-4 mt-auto grid grid-cols-2 gap-3">
                <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center"><div className="text-xs text-white/30 tracking-widest uppercase font-bold">Open Rate</div><div className="text-lg font-black text-white mt-1">61.2%</div></div>
                <div className="bg-[#0B0215] border border-white/10 rounded-xl p-3 text-center"><div className="text-xs text-white/30 tracking-widest uppercase font-bold">Reply Rate</div><div className="text-lg font-black text-[#FFD700] mt-1">24.3%</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Content + Client Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopContent items={topItems} loading={loading} />
          <ClientReport />
        </div>

        {/* Footer insight */}
        <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black">âœ“</div>
            <div>
              <div className="text-sm font-bold text-white">Premium analytics â€” live</div>
              <div className="text-xs text-white/40">Data from D1 + R2 + Groq â€¢ Update: 2 hours ago</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-amber-500 text-[#0B0215] text-xs font-black tracking-widest uppercase hover:scale-105 transition">Export CSV</button>
            <button className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-xs font-bold hover:border-[#FFD700] hover:text-[#FFD700] transition">Schedule Report</button>
          </div>
        </div>
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Analytics â€¢ Premium UI â€” $5,000/month agency experience ðŸ‡³ðŸ‡¬ðŸ”¥ðŸš€
      </footer>
    </div>
  )
}

