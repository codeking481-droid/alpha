import { useState } from "react"
import LeadFinder from "../components/outreach/LeadFinder"
import { LeadSearch } from "../components/outreach/LeadSearch"
import MessageDraft from "../components/outreach/MessageDraft"
import { MessageSender } from "../components/outreach/MessageSender"
import CampaignManager from "../components/outreach/CampaignManager"
import ReplyTracker from "../components/outreach/ReplyTracker"
import { ReplyInbox } from "../components/outreach/ReplyInbox"
import { useLocalStorage } from "../hooks/useLocalStorage.js"
import EmptyState from "../components/ui/EmptyState.jsx"
import AISuggestion from "../components/ui/AISuggestion.jsx"

export default function OutreachEngine() {
  const [addedLeads, setAddedLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState(null)
  const [realLeads] = useLocalStorage("alpha.leads", [])
  const [campaigns] = useLocalStorage("alpha.campaigns", [])
  const [replies] = useLocalStorage("alpha.replies", [])
  const [drafts] = useLocalStorage("alpha.drafts", [])
  const [events, setEvents] = useState([])

  const handleAddToCampaign = (lead, isRemove) => {
    if (isRemove) setAddedLeads((prev) => prev.filter((l) => l.id !== lead.id))
    else {
      setAddedLeads((prev) => [...prev, lead])
      setEvents((prev) => [{ id: Date.now(), text: `Added ${lead.name} ? queue (real)`, time: "now", type: "lead" }, ...prev].slice(0, 5))
    }
  }
  const handleSaveDraft = (draft) => {
    setEvents((prev) => [{ id: Date.now(), text: `Saved draft for ${draft.lead} (real)`, time: "now", type: "draft" }, ...prev].slice(0, 5))
  }

  const stats = {
    leads: realLeads.length,
    campaigns: campaigns.length,
    drafts: drafts.length,
    replies: replies.length,
  }

  return (
    <div className="min-h-screen bg-[#FFFCF8] text-[#0A0A0A] selection:bg-[#FFD700] selection:text-[#0B0215]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black">??</div>
          <div>
            <h1 className="font-black tracking-tight leading-none">OUTREACH ENGINE</h1>
            <p className="text-xs text-[#6B7280] tracking-widest uppercase font-semibold">Usefulness: find real people ? write personal emails ? track who replied ? book meetings. No fakes, only your work.</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* Real stats — 0 until you add */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-[#EDEDED] rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Real Leads</div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{stats.leads}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">You added</div>
            <div className="mt-3 h-1.5 bg-[#F9FAFB] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" style={{ width: `${Math.min(stats.leads * 20, 100)}%` }} /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-[#EDEDED] rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Campaigns</div>
            <div className="text-2xl sm:text-3xl font-black mt-2">{stats.campaigns}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Real groups</div>
            <div className="mt-3 h-1.5 bg-[#F9FAFB] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" style={{ width: `${Math.min(stats.campaigns * 30, 100)}%` }} /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-[#EDEDED] rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Drafts Saved</div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-[#FFD700]">{stats.drafts}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Real emails</div>
            <div className="mt-3 h-1.5 bg-[#F9FAFB] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${Math.min(stats.drafts * 25, 100)}%` }} /></div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-[#EDEDED] rounded-2xl p-4 sm:p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-[#6B7280]">Replies Logged</div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-emerald-400">{stats.replies}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Real replies</div>
            <div className="mt-3 h-1.5 bg-[#F9FAFB] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-400 to-violet-500 rounded-full" style={{ width: `${Math.min(stats.replies * 30, 100)}%` }} /></div>
          </div>
        </div>

        <LeadSearch />

        {stats.leads === 0 && stats.campaigns === 0 && (
          <>
            <EmptyState
              icon="??"
              title="Your Outreach Engine"
              description="Find your first lead. I'll find the right people."
              tip="Tip: Start by searching for companies in your niche."
              action={() => document.querySelector('[placeholder=\"Search your leads...\"]')?.focus()}
              actionLabel="+ Find Your First Lead"
            />
            <AISuggestion message="Want me to find leads for you? I can search for companies that need your services." action={() => document.querySelector('[placeholder=\"Search your leads...\"]')?.focus()} actionLabel="Find Leads" />
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <CampaignManager />
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl border border-[#EDEDED] rounded-2xl p-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-[#6B7280]">Live Activity — Real</h3>
            <p className="text-xs text-[#6B7280] mt-1">Only your real actions, no demo filler</p>
            <div className="mt-4">
              <div className="text-xs font-bold tracking-widest uppercase text-[#9CA3AF]">Queued ({addedLeads.length})</div>
              <div className="mt-2 space-y-2">
                {addedLeads.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] py-4 text-center bg-[#FFFCF8] border border-[#EDEDED] rounded-xl">No leads queued — add from Lead Finder (real)</p>
                ) : (
                  addedLeads.map((l) => (
                    <div key={l.id} className="bg-[#FFFCF8] border border-[#EDEDED] rounded-xl p-3 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black text-xs">{l.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0A0A0A] truncate">{l.name}</div>
                        <div className="text-[11px] text-[#6B7280] truncate">{l.company}</div>
                      </div>
                      <button onClick={() => handleAddToCampaign(l, true)} className="text-xs text-[#6B7280] hover:text-[#0A0A0A]">?</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-5">
              <div className="text-xs font-bold tracking-widest uppercase text-[#9CA3AF]">Recent Real Events</div>
              <div className="mt-2 space-y-2">
                {events.length === 0 ? <p className="text-xs text-[#9CA3AF] text-center py-4">No events yet — add a lead or save a draft and it appears here.</p> : events.map((e) => (
                  <div key={e.id} className="bg-white/[0.03] border border-[#EDEDED] rounded-xl p-2.5 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${e.type === "lead" ? "bg-[#FFD700]" : "bg-sky-400"}`} />
                    <span className="text-xs text-[#0A0A0A]/70 flex-1 truncate">{e.text}</span>
                    <span className="text-xs text-[#9CA3AF]">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <LeadFinder onAddToCampaign={handleAddToCampaign} onSelect={setSelectedLead} />
        <MessageDraft onSave={handleSaveDraft} />
        <MessageSender lead={selectedLead} onSent={(lead, subject, message) => {
          setSelectedLead(lead);
          console.log(`Sent to ${lead.email}: ${subject}`);
        }} />
        <ReplyInbox leadId={selectedLead?.id} />
        <ReplyTracker />
      </main>

      <footer className="text-center py-10 text-xs text-[#9CA3AF] tracking-widest uppercase font-semibold px-4">
        Outreach Engine • Real leads, real messages, real meetings • 100% mobile ????
      </footer>
    </div>
  )
}
