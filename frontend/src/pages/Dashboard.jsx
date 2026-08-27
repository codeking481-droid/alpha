import CompanyCard from "../components/dashboard/CompanyCard"
import QuickActions from "../components/dashboard/QuickActions"
import ActivityFeed from "../components/dashboard/ActivityFeed"

const companies = [
  { id: 1, name: "Genesis", industry: "Media & Education", status: "active", projects: 12, revenue: "$48k", lastActivity: "2 hours ago" },
  { id: 2, name: "Dominion", industry: "Tech & Operations", status: "active", projects: 8, revenue: "$32k", lastActivity: "5 hours ago" },
  { id: 3, name: "AlphaTek X", industry: "Agency OS", status: "new", projects: 3, revenue: "$9k", lastActivity: "1 day ago" },
  { id: 4, name: "Venture Labs", industry: "Incubator", status: "paused", projects: 5, revenue: "$14k", lastActivity: "3 days ago" },
]

const activities = [
  { id: 1, user: "You", action: "Created new content script for Genesis launch", time: "2h ago", company: "Genesis", type: "content", meta: "Script: 'The Invisible System' — 1,240 words" },
  { id: 2, user: "Dominion Team", action: "Sent 24 outreach messages — 6 replies", time: "5h ago", company: "Dominion", type: "outreach", meta: "Reply rate: 25% • 2 hot leads" },
  { id: 3, user: "You", action: "Added AlphaTek X as new company", time: "1d ago", company: "AlphaTek X", type: "company", meta: "Status: new • 3 initial projects" },
  { id: 4, user: "System", action: "Weekly analytics report generated", time: "2d ago", company: "All Companies", type: "system", meta: "Total revenue +18% WoW" },
]

const team = [
  { name: "You", role: "Founder", status: "online", avatar: "👑" },
  { name: "Genesis Lead", role: "Content", status: "online", avatar: "✍️" },
  { name: "Dominion Ops", role: "Outreach", status: "away", avatar: "📧" },
  { name: "Alpha Assistant", role: "AI Agent", status: "online", avatar: "🤖" },
]

export default function Dashboard() {
  const handleAction = (id) => {
    console.log("Quick action:", id)
    // TODO: wire to modals / routes
  }

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <h1 className="font-black tracking-tight text-lg">COMMAND HUB</h1>
        <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Invisible OS • Companies, status, quick actions</p>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Companies</div>
            <div className="text-3xl font-black mt-2">4 <span className="text-sm font-semibold text-emerald-400">+1 this week</span></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Active Projects</div>
            <div className="text-3xl font-black mt-2">28</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Monthly Revenue</div>
            <div className="text-3xl font-black mt-2 text-[#FFD700]">$103k</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Reply Rate</div>
            <div className="text-3xl font-black mt-2">25% <span className="text-sm font-semibold text-white/40">outreach</span></div>
          </div>
        </div>

        {/* Company Overview */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest uppercase text-white/60">Company Overview</h2>
            <span className="text-xs text-white/30">{companies.length} companies • 2 active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        </section>

        {/* Middle Grid: Quick Actions + Team */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <QuickActions onAction={handleAction} />
          </div>

          {/* Team Members */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Team Members</h3>
            <p className="text-xs text-white/40 mt-1">Who's online and shipping</p>
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
            <button className="w-full mt-4 text-xs font-bold tracking-widest uppercase text-[#FFD700] hover:text-[#ffdf33] transition">+ Invite Member</button>
          </div>
        </div>

        {/* Activity Feed */}
        <section className="mt-6">
          <ActivityFeed items={activities} />
        </section>
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Command Hub • The heart of your agency • Build well 🇳🇬🔥🚀
      </footer>
    </div>
  )
}
