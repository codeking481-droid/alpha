import { useState, useMemo } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"
import { API_URL } from "../../lib/api.js"

const statusStyle = {
  new: "bg-white/10 text-white/60 border-white/10",
  contacted: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  replied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
}

export default function LeadFinder({ onAddToCampaign, onSelect }) {
  const [realLeads, setRealLeads] = useLocalStorage("alpha.leads", [])
  const [q, setQ] = useState("")
  const [industry, setIndustry] = useState("all")
  const [location, setLocation] = useState("all")
  const [added, setAdded] = useState(new Set())
  // Add lead form (real)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", company: "", email: "", industry: "SaaS", location: "Lagos, NG" })
  // Free Overpass search
  const [city, setCity] = useState("Port Harcourt")
  const [niche, setNiche] = useState("hotel")
  const [freeLeads, setFreeLeads] = useState([])
  const [freeLoading, setFreeLoading] = useState(false)
  const [freeError, setFreeError] = useState("")

  const leads = useMemo(() => {
    return realLeads.filter((l) => {
      const matchQ = !q || `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase())
      const matchInd = industry === "all" || l.industry === industry
      const matchLoc = location === "all" || l.location.includes(location)
      return matchQ && matchInd && matchLoc
    })
  }, [realLeads, q, industry, location])

  const addRealLead = () => {
    if (!form.name.trim() || !form.company.trim()) return
    const lead = { id: Date.now(), name: form.name.trim(), title: "Contact", company: form.company.trim(), industry: form.industry, location: form.location, email: form.email.trim() || "—", linkedin: "—", score: 80, status: "new" }
    const next = [lead, ...realLeads]
    setRealLeads(next)
    setForm({ name: "", company: "", email: "", industry: "SaaS", location: "Lagos, NG" })
    setShowAdd(false)
  }

  const toggleAdd = (lead) => {
    const next = new Set(added)
    if (next.has(lead.id)) next.delete(lead.id)
    else next.add(lead.id)
    setAdded(next)
    onAddToCampaign?.(lead, !next.has(lead.id))
  }

  const findFreeLeads = async () => {
    if (!city.trim() || !niche.trim()) { setFreeError("City and niche required"); return }
    setFreeLoading(true); setFreeError("")
    try {
      const res = await fetch(`${API_URL}/api/leads/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.trim(), niche: niche.trim().toLowerCase(), limit: 20 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setFreeLeads(data.leads || [])
      if ((data.leads || []).length === 0) setFreeError("No businesses found — try another city/niche (e.g. Lagos + restaurant)")
    } catch (e) {
      setFreeError(e.message)
    } finally { setFreeLoading(false) }
  }

  const importFreeLead = (fl) => {
    const lead = { id: Date.now() + Math.random(), name: fl.name, title: "Contact", company: fl.name, industry: niche, location: city, email: fl.phone || fl.website || "—", linkedin: fl.website || "—", score: 75, status: "new", lat: fl.lat, lon: fl.lon, address: fl.address }
    const next = [lead, ...realLeads]
    setRealLeads(next)
  }

  return (
    <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-8 h-8 rounded-lg bg-[#5E17EB] flex items-center justify-center text-white">🔍</div>
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase" style={{color:'#0A0A0A'}}>Lead Finder</h3>
          <p className="text-xs" style={{color:'#6B7280'}}>Find people who need your service. Add them, then send personalized outreach. No fakes — only your real leads.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="ml-auto px-4 py-2 rounded-full text-white text-xs font-black tracking-widest uppercase" style={{background:'#5E17EB'}}>+ Add Real Lead</button>
      </div>

      {showAdd && (
        <div className="mt-4 bg-[#0B0215] border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name — e.g. Adebayo Oke" className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company — e.g. Paystack" className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email — e.g. ade@company.co" className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
            <option>Fintech</option><option>SaaS</option><option>Media</option><option>Agency</option>
          </select>
          <button onClick={addRealLead} className="sm:col-span-2 py-2.5 rounded-xl bg-[#FFD700] text-black font-black text-xs tracking-widest uppercase">Save Real Lead</button>
        </div>
      )}

      {/* Free Overpass — no key, unlimited */}
      <div className="mt-4 bg-gradient-to-br from-[#FFD700]/10 to-amber-500/10 border border-[#FFD700]/20 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest uppercase text-[#FFD700]">Free Unlimited — OpenStreetMap (no key)</span>
          <span className="ml-auto text-xs text-white/30">Nominatim + Overpass</span>
        </div>
        <p className="text-xs text-white/40 mt-1">Enter city + niche → get real businesses with name, address, phone, website. No API key, no cost.</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City — e.g. Port Harcourt" className="bg-[#0B0215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Niche — e.g. hotel, restaurant, cafe" list="niche-options" className="bg-[#0B0215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
          <datalist id="niche-options"><option value="hotel"/><option value="restaurant"/><option value="cafe"/><option value="shop"/><option value="bank"/><option value="school"/><option value="doctors"/><option value="lawyer"/></datalist>
          <button onClick={findFreeLeads} disabled={freeLoading} className="py-2.5 rounded-xl bg-[#FFD700] text-black font-black text-xs tracking-widest uppercase hover:bg-[#ffdf33] disabled:opacity-50 min-h-[44px]">
            {freeLoading ? "Searching..." : "Find Free Leads →"}
          </button>
        </div>
        {freeError && <p className="text-xs text-red-400 mt-2">{freeError}</p>}
        {freeLeads.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {freeLeads.map((fl) => (
              <div key={fl.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3">
                <div className="text-sm font-bold text-white truncate">{fl.name}</div>
                <div className="text-xs text-white/40 truncate">{fl.address || `${fl.lat.toFixed(4)}, ${fl.lon.toFixed(4)}`}</div>
                <div className="text-xs text-white/30 truncate">{fl.phone || fl.website || "—"}</div>
                <button onClick={() => importFreeLead(fl)} className="mt-2 w-full py-2 rounded-full bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-white/90">+ Import as Lead</button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-white/20 mt-2">Source: OpenStreetMap — real businesses. Click Import to add to your real leads.</p>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your leads..." className="lg:col-span-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30" />
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
          <option value="all">All Industries</option><option value="Fintech">Fintech</option><option value="SaaS">SaaS</option><option value="Media">Media</option><option value="Agency">Agency</option>
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
          <option value="all">All Locations</option><option value="Lagos">Lagos</option><option value="Remote">Remote</option><option value="London">London</option><option value="Abuja">Abuja</option>
        </select>
      </div>

      {realLeads.length === 0 ? (
        <div className="mt-6 text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
          <div className="text-3xl">🔍</div>
          <p className="text-sm text-white/60 mt-2 font-bold">No leads yet — this is real, not mock</p>
          <p className="text-xs text-white/30 mt-1 max-w-md mx-auto">Leads are people you want as clients. Click <b>+ Add Real Lead</b>, add name + company, then add to campaign. Usefulness: you find → add → message → get meetings.</p>
        </div>
      ) : leads.length === 0 ? (
        <p className="text-center text-sm text-white/30 py-8">No leads match — try broader search.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {leads.map((l) => (
            <div key={l.id} className="bg-[#0B0215] border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black text-sm">{l.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                  <div>
                    <div className="text-sm font-bold text-white leading-none">{l.name}</div>
                    <div className="text-xs text-white/50">{l.company}</div>
                    <div className="text-xs text-white/30 mt-0.5">{l.industry} • {l.location}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${statusStyle[l.status]}`}>{l.status}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleAdd(l)} className={`flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border transition ${added.has(l.id) ? "bg-emerald-500 text-white border-emerald-500" : "bg-[#FFD700] text-[#0B0215] border-[#FFD700]"}`}>
                  {added.has(l.id) ? "✓ Added" : "+ Add to Campaign"}
                </button>
                {l.email !== "—" && <a href={`mailto:${l.email}`} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold">Email</a>}
                <button onClick={() => onSelect?.(l)} className="px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold hover:bg-sky-500/30">Select</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-white/20 text-center">Real leads only — saved on this device + D1 when live. Usefulness: outreach starts here.</p>
    </div>
  )
}
export const mockLeads = []
