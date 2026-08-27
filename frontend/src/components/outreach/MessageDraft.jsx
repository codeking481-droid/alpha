import { useState } from "react"
import { useLocalStorage } from "../../hooks/useLocalStorage.js"

const companies = ["— Select Company —"]

export default function MessageDraft({ onSave }) {
  const [realLeads] = useLocalStorage("alpha.leads", [])
  const [realCompanies] = useLocalStorage("alpha.companies", [])
  const companyOptions = realCompanies.length ? realCompanies.map(c=>c.name) : ["Genesis (add company first)"]
  const [leadId, setLeadId] = useState("")
  const [company, setCompany] = useState(companyOptions[0])
  const [points, setPoints] = useState("")
  const [tone, setTone] = useState("friendly")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useLocalStorage("alpha.drafts", [])

  const lead = realLeads.find((l) => String(l.id) === String(leadId)) || null

  const generate = async () => {
    if (!lead) { setOutput("Add a real lead first in Lead Finder above, then select it here."); return }
    setLoading(true)
    setOutput("")
    await new Promise((r) => setTimeout(r, 900))
    const text = `Subject: Quick idea for ${lead.company} — ${company}\n\nHi ${lead.name.split(" ")[0]},\n\nNoticed ${lead.company} in ${lead.industry}. ${points || "We help teams systematize outreach."} [tone: ${tone}]\n\nWorth a 15-min chat?\n\n— ${company} • Alpha Agency — Real draft, edit before sending.`
    setOutput(text)
    setLoading(false)
  }

  const save = () => {
    if (!output || !lead) return
    const draft = { id: Date.now(), lead: lead.name, company, preview: output.slice(0, 90), full: output, created: "now" }
    const next = [draft, ...saved]
    setSaved(next)
    if (onSave) onSave(draft)
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80 flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">✉️</span> Message Draft</h3>
        <p className="text-xs text-white/30 mt-1">Usefulness: pick a real lead + company → add key points → generate personalized email. Edit, save, then send. No mock emails.</p>
      </div>

      {realLeads.length === 0 ? (
        <div className="mt-4 text-center py-8 bg-[#0B0215] border border-white/5 rounded-xl">
          <p className="text-sm text-white/50 font-bold">No real leads yet</p>
          <p className="text-xs text-white/30 mt-1">Add a lead in Lead Finder above first. Message Draft needs a real person to write to.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/50">Lead (real)</label>
              <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
                <option value="">— Select lead —</option>
                {realLeads.map((l) => <option key={l.id} value={String(l.id)}>{l.name} - {l.company}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-white/50">From Company (real)</label>
              <select value={company} onChange={(e) => setCompany(e.target.value)} className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
                {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {["friendly", "direct", "formal"].map((t) => (
                <button key={t} onClick={() => setTone(t)} className={tone === t ? "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border bg-[#FFD700] text-[#0B0215] border-[#FFD700]" : "flex-1 py-2 rounded-xl text-xs font-black tracking-widest uppercase border bg-white/5 text-white/50 border-white/10"}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/50">Key Points</label>
            <textarea value={points} onChange={(e) => setPoints(e.target.value)} rows={5} placeholder="What to mention — e.g. Lagos expansion, 3-email sequence..." className="mt-2 w-full bg-[#0B0215] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30"></textarea>
            <button onClick={generate} disabled={loading || !lead} className="mt-3 w-full py-3 rounded-xl bg-[#FFD700] hover:bg-[#ffdf33] disabled:opacity-40 text-[#0B0215] font-black tracking-widest uppercase text-sm">
              {loading ? "Generating..." : lead ? `Generate Email for ${lead.name.split(" ")[0]}` : "Select a lead first"}
            </button>
          </div>
        </div>
      )}

      {output && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Draft Preview — Real</span>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">Copy</button>
              <button onClick={save} className="text-xs px-3 py-1 rounded-full bg-[#FFD700] text-[#0B0215] font-bold">Save Real Draft</button>
              <button onClick={() => setOutput("")} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/50">Clear</button>
            </div>
          </div>
          <pre className="mt-2 bg-[#0B0215] border border-white/10 rounded-xl p-4 text-sm text-white/90 whitespace-pre-wrap max-h-[300px] overflow-auto">{output}</pre>
        </div>
      )}

      {saved.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-bold tracking-widest uppercase text-white/40">Saved Real Drafts ({saved.length})</div>
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
