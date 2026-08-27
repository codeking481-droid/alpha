import { useState, useEffect } from "react"
import CompanyCard from "../components/dashboard/CompanyCard"
import QuickActions from "../components/dashboard/QuickActions"
import ActivityFeed from "../components/dashboard/ActivityFeed"
import { useLocalStorage } from "../hooks/useLocalStorage.js"
import { store } from "../lib/store.js"
import EmptyState from "../components/ui/EmptyState.jsx"
import AISuggestion from "../components/ui/AISuggestion.jsx"

export default function Dashboard() {
  const [companies, setCompanies] = useLocalStorage("alpha.companies", [])
  const [activities, setActivities] = useLocalStorage("alpha.activities", [])
  const [team, setTeam] = useLocalStorage("alpha.team", [])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", industry: "", status: "active" })

  // Load from API if available (once)
  useEffect(() => {
    store.getCompanies().then((remote) => {
      if (remote && remote.length > 0 && companies.length === 0) {
        setCompanies(remote.map((c) => ({ ...c, projects: c.projects || 0, revenue: c.mrr || "$0", lastActivity: "now", industry: c.company || c.industry || "â€”" })))
      }
    })
    // eslint-disable-next-line
  }, [])

  const handleAction = (id) => {
    if (id === "company") setShowAdd(true)
    if (id === "content") window.location.href = "/content"
    if (id === "outreach") window.location.href = "/outreach"
    if (id === "analytics") window.location.href = "/analytics"
  }

  const addCompany = () => {
    if (!form.name.trim()) return
    const company = {
      id: Date.now(),
      name: form.name.trim(),
      industry: form.industry.trim() || "â€”",
      status: form.status,
      projects: 0,
      revenue: "$0",
      lastActivity: "now",
    }
    const next = [company, ...companies]
    setCompanies(next)
    store.saveCompanies(next)
    const act = { id: Date.now(), user: "You", action: `Added ${company.name}`, time: "now", company: company.name, type: "company", meta: `Status: ${company.status}` }
    const nextAct = [act, ...activities].slice(0, 20)
    setActivities(nextAct)
    try { localStorage.setItem("alpha.activities", JSON.stringify(nextAct)) } catch {}
    setForm({ name: "", industry: "", status: "active" })
    setShowAdd(false)
  }

  const stats = {
    companies: companies.length,
    projects: companies.reduce((s, c) => s + (c.projects || 0), 0),
    revenue: companies.length ? `$${companies.reduce((s, c) => s + parseInt((c.revenue || "$0").replace(/[^0-9]/g, "")) || 0, 0)}k` : "$0",
    replyRate: "â€”",
  }
  const activeCount = companies.filter((c) => c.status === "active").length

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="font-black tracking-tight text-lg">COMMAND HUB</h1>
        <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Invisible OS â€¢ Real data â€¢ 100% mobile</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {/* Hero Stats â€” real */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Companies</div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{stats.companies} <span className="text-xs font-semibold text-white/30">{stats.companies === 0 ? "add first" : `${activeCount} active`}</span></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Active Projects</div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{stats.projects}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Monthly Revenue</div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-[#FFD700]">{stats.revenue}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Reply Rate</div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{stats.replyRate} <span className="text-xs font-semibold text-white/30">real</span></div>
          </div>
        </div>

        {/* Add Company Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#14141f] border border-white/10 rounded-2xl p-6 animate-slideUp">
              <h3 className="text-lg font-black tracking-tight">Add Company</h3>
              <p className="text-xs text-white/40 mt-1">Real data â€” saved to this device + D1 when live</p>
              <div className="mt-4 space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name â€” e.g. Acme Co" className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50" />
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry â€” e.g. Fintech" className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-4 py-3 text-base text-white">
                  <option value="active">Active</option>
                  <option value="new">New</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-sm">Cancel</button>
                <button onClick={addCompany} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black text-sm">Save Company</button>
              </div>
            </div>
          </div>
        )}

        {/* Company Overview */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white/60">Company Overview</h2>
            <span className="text-xs text-white/30 whitespace-nowrap">{companies.length} â€¢ {activeCount} active</span>
          </div>

          {companies.length === 0 ? (
            <>
              <div className="mt-4">
                <EmptyState
                  icon="🚀"
                  title="Your Agency Awaits"
                  description="Your first company is waiting. Name it."
                  tip="Tip: Start with your own company first."
                  action={() => setShowAdd(true)}
                  actionLabel="+ Add Your First Company"
                />
              </div>
              <AISuggestion message="Want me to help you find your first company? I can search for businesses in your niche." action={() => setShowAdd(true)} actionLabel="Find Companies" />
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-4">
              {companies.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions + Team */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          <div className="lg:col-span-2">
            <QuickActions onAction={handleAction} />
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Team Members</h3>
            <p className="text-xs text-white/40 mt-1">Real team â€” invite to collaborate</p>
            {team.length === 0 ? (
              <div className="mt-6 text-center py-8 bg-white/[0.03] border border-white/5 rounded-xl">
                <div className="text-3xl">ðŸ‘¥</div>
                <p className="text-sm text-white/40 mt-2">No team yet.</p>
                <p className="text-xs text-white/30 mt-1">Invite members â€” they'll appear here.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {team.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">{m.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white leading-none truncate">{m.name}</div>
                      <div className="text-xs text-white/40">{m.role}</div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${m.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  </div>
                ))}
              </div>
            )}
            <button className="w-full mt-4 py-3 text-xs font-bold tracking-widest uppercase text-[#FFD700] hover:text-[#ffdf33] transition min-h-[44px]">+ Invite Member</button>
          </div>
        </div>

        <section className="mt-6">
          <ActivityFeed items={activities} />
        </section>
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold px-4">
        Command Hub â€¢ Real data â€¢ 100% mobile â€¢ Ready ðŸ‡³ðŸ‡¬
      </footer>
    </div>
  )
}



