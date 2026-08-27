import { useState } from "react"
import CompanyCard from "../components/dashboard/CompanyCard"
import QuickActions from "../components/dashboard/QuickActions"
import ActivityFeed from "../components/dashboard/ActivityFeed"

// 🧹 CLEARED — Ready for real data. No mocks.
const companies = []
const activities = []
const team = []

export default function Dashboard() {
  const handleAction = (id) => {
    console.log("Quick action:", id)
    if (id === "company") {
      // TODO: open Add Company modal -> POST /api/deals/clients
      alert("Add Company — wire to POST /api/deals/clients and update state")
    }
  }

  const stats = {
    companies: companies.length,
    projects: 0,
    revenue: "$0",
    replyRate: "—",
  }

  const activeCount = companies.filter((c) => c.status === "active").length

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <h1 className="font-black tracking-tight text-lg">COMMAND HUB</h1>
        <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Invisible OS • Companies, status, quick actions</p>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-8">
        {/* Hero Stats — reset to 0 / — */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Companies</div>
            <div className="text-3xl font-black mt-2">{stats.companies} <span className="text-sm font-semibold text-white/30">—</span></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Active Projects</div>
            <div className="text-3xl font-black mt-2">{stats.projects}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Monthly Revenue</div>
            <div className="text-3xl font-black mt-2 text-[#FFD700]">{stats.revenue}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Reply Rate</div>
            <div className="text-3xl font-black mt-2">{stats.replyRate} <span className="text-sm font-semibold text-white/30">—</span></div>
          </div>
        </div>

        {/* Company Overview — empty state */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white/60">Company Overview</h2>
            <span className="text-xs text-white/30">{companies.length} companies • {activeCount} active</span>
          </div>

          {companies.length === 0 ? (
            <div className="glass p-8 text-center rounded-2xl mt-4 animate-fadeIn">
              <span className="text-6xl">🚀</span>
              <h3 className="text-2xl font-bold text-white mt-4 tracking-tight">Your Agency Awaits</h3>
              <p className="text-white/40 mt-2 text-sm">No companies yet. Add your first company to get started.</p>
              <button onClick={() => handleAction("company")} className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black tracking-widest uppercase text-xs hover:scale-105 transition shadow-gold">
                Add Company
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
              {companies.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>
          )}
        </section>

        {/* Middle Grid: Quick Actions + Team */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <QuickActions onAction={handleAction} />
          </div>

          {/* Team Members — empty state */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Team Members</h3>
            <p className="text-xs text-white/40 mt-1">Who's online and shipping</p>

            {team.length === 0 ? (
              <div className="mt-6 text-center py-8 bg-white/[0.03] border border-white/5 rounded-xl">
                <div className="text-3xl">👥</div>
                <p className="text-sm text-white/40 mt-2">No team members yet.</p>
                <p className="text-xs text-white/30 mt-1">Invite your team to see them here.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {team.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">{m.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white leading-none">{m.name}</div>
                      <div className="text-xs text-white/40">{m.role}</div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${m.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} title={m.status} />
                    <span className="text-xs font-semibold capitalize text-white/50">{m.status}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-4 text-xs font-bold tracking-widest uppercase text-[#FFD700] hover:text-[#ffdf33] transition">+ Invite Member</button>
          </div>
        </div>

        {/* Activity Feed — empty state handled inside component */}
        <section className="mt-6">
          <ActivityFeed items={activities} />
        </section>
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Command Hub • Clean • Ready for real data 🇳🇬🔥🚀
      </footer>
    </div>
  )
}
