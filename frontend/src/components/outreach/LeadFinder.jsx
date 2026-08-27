import { useState, useMemo } from "react"

const mockLeads = [
  { id: 1, name: "Adebayo Oke", title: "CEO", company: "Paystack Alumni Co", industry: "Fintech", location: "Lagos, NG", email: "ade@payalum.co", linkedin: "linkedin.com/in/adeoke", score: 92, status: "new" },
  { id: 2, name: "Sarah Chen", title: "Head of Growth", company: "Dominion Labs", industry: "SaaS", location: "Remote • US", email: "sarah@dominionlabs.io", linkedin: "linkedin.com/in/sarahchen", score: 88, status: "contacted" },
  { id: 3, name: "Chidi Nwosu", title: "Founder", company: "Genesis Media", industry: "Media", location: "Abuja, NG", email: "chidi@genesis.ng", linkedin: "linkedin.com/in/chidinwosu", score: 95, status: "new" },
  { id: 4, name: "Emily Roth", title: "CMO", company: "Venture Builders", industry: "Agency", location: "London, UK", email: "emily@venturebuilders.co", linkedin: "linkedin.com/in/emilyroth", score: 76, status: "replied" },
  { id: 5, name: "Tunde Balogun", title: "COO", company: "AlphaTek Partners", industry: "Fintech", location: "Lagos, NG", email: "tunde@alphatek.ng", linkedin: "linkedin.com/in/tundeb", score: 81, status: "new" },
  { id: 6, name: "Priya Patel", title: "Director, Ops", company: "ScaleOps Inc", industry: "SaaS", location: "Bangalore, IN", email: "priya@scaleops.com", linkedin: "linkedin.com/in/priyapatel", score: 73, status: "new" },
]

const statusStyle = {
  new: "bg-white/10 text-white/60 border-white/10",
  contacted: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  replied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
}

export default function LeadFinder({ onAddToCampaign }) {
  const [q, setQ] = useState("")
  const [industry, setIndustry] = useState("all")
  const [location, setLocation] = useState("all")
  const [added, setAdded] = useState(new Set())

  const leads = useMemo(() => {
    return mockLeads.filter((l) => {
      const matchQ = !q || `${l.name} ${l.company} ${l.title}`.toLowerCase().includes(q.toLowerCase())
      const matchInd = industry === "all" || l.industry === industry
      const matchLoc = location === "all" || l.location.includes(location)
      return matchQ && matchInd && matchLoc
    })
  }, [q, industry, location])

  const toggleAdd = (lead) => {
    const next = new Set(added)
    if (next.has(lead.id)) next.delete(lead.id)
    else next.add(lead.id)
    setAdded(next)
    onAddToCampaign?.(lead, !next.has(lead.id))
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">🔍</div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Lead Finder</h3>
        <span className="ml-auto text-xs text-white/30">{leads.length} results</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Search by industry / keyword / location — add to campaign in one click</p>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Keyword • e.g. CEO, SaaS, Genesis"
          className="lg:col-span-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50"
        />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50">
          <option value="all">All Industries</option>
          <option value="Fintech">Fintech</option>
          <option value="SaaS">SaaS</option>
          <option value="Media">Media</option>
          <option value="Agency">Agency</option>
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50">
          <option value="all">All Locations</option>
          <option value="Lagos">Lagos</option>
          <option value="Remote">Remote</option>
          <option value="London">London</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Abuja">Abuja</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {leads.map((l) => (
          <div key={l.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4 hover:border-[#FFD700]/20 transition group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black text-sm">
                  {l.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-none">{l.name}</div>
                  <div className="text-xs text-white/50">{l.title} • {l.company}</div>
                  <div className="text-xs text-white/30 mt-0.5">{l.industry} • {l.location}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${statusStyle[l.status]}`}>{l.status}</span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
              <span className="truncate flex-1">{l.email}</span>
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 font-bold text-white/60">{l.score}% fit</span>
            </div>
            <div className="mt-1 text-xs text-white/20 truncate">{l.linkedin}</div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toggleAdd(l)}
                className={`flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border transition ${added.has(l.id) ? "bg-emerald-500 text-white border-emerald-500" : "bg-[#FFD700] text-[#0B0215] border-[#FFD700] hover:bg-[#ffdf33]"}`}
              >
                {added.has(l.id) ? "✓ Added" : "+ Add to Campaign"}
              </button>
              <a href={`mailto:${l.email}`} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">Email</a>
            </div>
          </div>
        ))}
      </div>
      {leads.length === 0 && <p className="text-center text-sm text-white/30 py-8">No leads match — try a broader keyword.</p>}
      <p className="mt-3 text-[11px] text-white/20 text-center">Mock data — wire to D1 + Apollo/Prospeo or Workers scraper. Add `CLOUDFLARE_*` keys.</p>
    </div>
  )
}
export { mockLeads }
