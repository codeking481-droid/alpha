import { useState } from "react"
import LeadFinder from "../components/outreach/LeadFinder"
import MessageDraft from "../components/outreach/MessageDraft"
import CampaignManager from "../components/outreach/CampaignManager"
import ReplyTracker from "../components/outreach/ReplyTracker"

export default function OutreachEngine() {
  const [addedLeads, setAddedLeads] = useState([])
  const [events, setEvents] = useState([
    { id: 1, text: "Added 2 leads to Genesis â€” Lagos Fintechs", time: "now", type: "lead" },
  ])

  const handleAddToCampaign = (lead, isRemove) => {
    if (isRemove) {
      setAddedLeads((prev) => prev.filter((l) => l.id !== lead.id))
    } else {
      setAddedLeads((prev) => [...prev, lead])
      setEvents((prev) => [{ id: Date.now(), text: `Added ${lead.name} â†’ campaign queue`, time: "now", type: "lead" }, ...prev].slice(0, 5))
    }
  }

  const handleSaveDraft = (draft) => {
    setEvents((prev) => [{ id: Date.now(), text: `Saved draft for ${draft.lead} (${draft.company})`, time: "now", type: "draft" }, ...prev].slice(0, 5))
  }

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      {/* Sub header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black">ðŸ“§</div>
          <div>
            <h1 className="font-black tracking-tight leading-none">OUTREACH ENGINE</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Find leads â€¢ draft messages â€¢ track replies</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">{addedLeads.length} queued</span>
          <span className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 font-semibold">Groq AI â€¢ Ready</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Leads Found</div>
            <div className="text-3xl font-black mt-2">6<span className="text-sm text-white/30 ml-2">this week</span></div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[72%] bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Emails Sent</div>
            <div className="text-3xl font-black mt-2">119</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[88%] bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Reply Rate</div>
            <div className="text-3xl font-black mt-2 text-[#FFD700]">24.3%</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[24%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Meetings</div>
            <div className="text-3xl font-black mt-2 text-emerald-400">11</div>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full w-[55%] bg-gradient-to-r from-sky-400 to-violet-500 rounded-full" /></div>
          </div>
        </div>

        {/* Campaign Overview + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CampaignManager />
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Live Activity</h3>
            <p className="text-xs text-white/40 mt-1">Queued leads & recent drafts</p>
            <div className="mt-4">
              <div className="text-xs font-bold tracking-widest uppercase text-white/30">Queued Leads ({addedLeads.length})</div>
              <div className="mt-2 space-y-2">
                {addedLeads.length === 0 ? (
                  <p className="text-xs text-white/30 py-4 text-center bg-[#0B0215] border border-white/5 rounded-xl">No leads queued â€” add from Lead Finder</p>
                ) : (
                  addedLeads.map((l) => (
                    <div key={l.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black text-xs">{l.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{l.name}</div>
                        <div className="text-[11px] text-white/40 truncate">{l.company} â€¢ {l.email}</div>
                      </div>
                      <button onClick={() => handleAddToCampaign(l, true)} className="text-xs text-white/40 hover:text-white">âœ•</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-xs font-bold tracking-widest uppercase text-white/30">Recent Events</div>
              <div className="mt-2 space-y-2">
                {events.map((e) => (
                  <div key={e.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${e.type === "lead" ? "bg-[#FFD700]" : "bg-sky-400"}`} />
                    <span className="text-xs text-white/70 flex-1 truncate">{e.text}</span>
                    <span className="text-xs text-white/30">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Mini analytics */}
            <div className="mt-5 bg-[#0B0215] border border-white/10 rounded-xl p-3">
              <div className="text-xs font-bold tracking-widest uppercase text-white/40">What's Working</div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-white/50">Loom + 3-step</span><span className="text-emerald-400 font-bold">31% reply</span></div>
                <div className="flex justify-between"><span className="text-white/50">Short + direct</span><span className="text-amber-400 font-bold">22% reply</span></div>
                <div className="flex justify-between"><span className="text-white/50">Long formal</span><span className="text-white/30 font-bold">9% reply</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Finder */}
        <LeadFinder onAddToCampaign={handleAddToCampaign} />

        {/* Message Draft */}
        <MessageDraft onSave={handleSaveDraft} />

        {/* Reply Tracker */}
        <ReplyTracker />
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Outreach Engine â€¢ Find & contact leads â€” fast and effective ðŸ‡³ðŸ‡¬ðŸ”¥ðŸš€
      </footer>
    </div>
  )
}

