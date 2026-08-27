import { useState } from "react"
import { mockLeads } from "./LeadFinder.jsx"

const companies = ["Genesis", "Dominion", "AlphaTek X", "Venture Labs"]

const mockDraft = async ({ lead, company, points, tone }) => {
  await new Promise((r) => setTimeout(r, 1100))
  const leadName = lead.name.split(" ")[0]
  const base = `Subject: Quick idea for ${lead.company} - ${company} x ${lead.company}\n\nHi ${leadName},\n\nNoticed ${lead.company} is scaling ${lead.industry} in ${lead.location}.`
  const body = `\n\nWe're helping ${company} teams turn outreach into an invisible system. Points: ${points || "automated lead to message to follow-up, 25 percent reply in 14 days."} Tone: ${tone}.`
  return base + body + `\n\nWorth a 15-min chat next week? Reply STOP if not relevant.\n\nBoss @ ${company} - Alpha Agency`
}

export default function MessageDraft({ onSave }) {
  const [leadId, setLeadId] = useState(String(mockLeads[0].id))
  const [company, setCompany] = useState(companies[0])
  const [points, setPoints] = useState("")
  const [tone, setTone] = useState("friendly")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState([])

  const lead = mockLeads.find((l) => String(l.id) === String(leadId)) || mockLeads[0]

  const generate = async () => {
    setLoading(true)
    setOutput("")
    try {
      const text = await mockDraft({ lead, company, points, tone })
      setOutput(text)
    } catch {
      setOutput("Error generating. Check GROQ_API_KEY.")
    } finally {
      setLoading(false)
    }
  }

  const save = () => {
    if (!output) return
    const draft = { id: Date.now(), lead: lead.name, company, preview: output.slice(0, 90), full: output, created: "now" }
    setSaved([draft, ...saved])
    if (onSave) onSave(draft)
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">M</div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Message Draft</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">AI Groq</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Select lead and company, add key points, generate personalized email</p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-white/50">Lead</label>
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD700]/50">
              {mockLeads.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.name} - {l.company}</option>
              ))}
            </select>
            <div className="mt-2 text-xs text-white/30">{lead.title} at {lead.company} - {lead.email}</div>
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-white/50">From Company</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {["friendly", "direct", "formal"].map((t) => (
              <button key={t} onClick={() => setTone(t)} className={tone === t ? "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border transition bg-[#FFD700] text-[#0B0215] border-[#FFD700]" : "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border transition bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/50">Key Points</label>
          <textarea value={points} onChange={(e) => setPoints(e.target.value)} rows={5} placeholder="e.g. We helped Genesis go from 3 percent to 25 percent reply rate using 3-email sequence plus loom. Mention Lagos expansion." className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/50"></textarea>
          <button onClick={generate} disabled={loading} className="mt-3 w-full py-3 rounded-xl bg-[#FFD700] hover:bg-[#ffdf33] disabled:opacity-40 text-[#0B0215] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#FFD700]/10">
            {loading ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#0B0215]/30 border-t-[#0B0215] rounded-full animate-spin"></span> Generating...</span>
            ) : (
              <span>Generate Email for {lead.name.split(" ")[0]}</span>
            )}
          </button>
        </div>
      </div>

      {output && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Draft Preview</span>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition">Copy</button>
              <button onClick={save} className="text-xs px-3 py-1 rounded-full bg-[#FFD700] text-[#0B0215] font-bold hover:bg-[#ffdf33] transition">Save Draft</button>
              <button onClick={() => setOutput("")} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/50">Clear</button>
            </div>
          </div>
          <pre className="mt-2 bg-[#0B0215] border border-white/10 rounded-xl p-4 text-sm text-white/90 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-auto">{output}</pre>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold tracking-widest uppercase text-white/40">Saved Drafts ({saved.length})</div>
          <div className="mt-2 grid gap-2">
            {saved.map((d) => (
              <div key={d.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{d.lead} - {d.company}</div>
                  <div className="text-xs text-white/40 truncate">{d.preview}...</div>
                </div>
                <span className="text-xs text-white/30">{d.created}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
