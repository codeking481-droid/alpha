import { useState } from "react"

const formats = [
  { id: "post", label: "Post" },
  { id: "article", label: "Article" },
  { id: "script", label: "Script" },
  { id: "caption", label: "Caption" },
]

const companies = ["Genesis", "Dominion", "AlphaTek X", "Venture Labs"]

// Mock Groq-style generation - replace with real Workers AI / Groq API call
const mockGenerate = async ({ topic, format, company, template }) => {
  await new Promise((r) => setTimeout(r, 1200))
  const prefix = template ? `[Using ${template} template] ` : ""
  if (format === "post") {
    return `${prefix}🚀 ${company} — ${topic}\n\nHook: Most people think ${topic} is complicated. It's not.\n\nHere are 3 lessons we learned building in public:\n\n1. Speed > Perfection — ship daily.\n2. Systems > Hustle — invisible ops win.\n3. Content > Ads — trust compounds.\n\nWe used this to grow ${company} 18% WoW.\n\nSteal the system → comment "ALPHA" and I'll send the playbook.\n\n#buildinpublic #${company.toLowerCase()}`
  }
  if (format === "article") {
    return `${prefix}# ${topic}: The Invisible Playbook for ${company}\n\n**Intro:** Why ${topic} matters now and why most teams fail.\n\n## 1. The Foundation\n${company} runs on 3 badges: Command Hub, Content Studio, Outreach Engine.\n\n## 2. The Execution\nWe built ${topic} into a repeatable system — templates, calendar, AI writer.\n\n## 3. The Results\n- 28 projects shipped\n- 25% outreach reply rate\n- $103k MRR\n\n**Conclusion:** ${topic} isn't a task. It's an OS. Steal ours.\n\n— Alpha Agency 🇳🇬`
  }
  if (format === "script") {
    return `${prefix}[HOOK 0:00-0:03] "If you're still doing ${topic} manually, you're losing."\n\n[VALUE 0:03-0:45]\n- Point 1: The old way is dead (pause)\n- Point 2: Here's our invisible system for ${company}\n- Point 3: Copy this in 5 minutes\n\n[CTA 0:45-0:60] "Comment ALPHA — I'll DM you the template. No fluff."\n\n— Script ready for teleprompter. 58s.`
  }
  return `${prefix}✨ ${topic} — for ${company} | ${format}\n\nPOV: You unlocked the invisible system.\n\n${topic} made simple. No guesswork. Just ship.\n\nSave this. Share with your team. Comment ALPHA for the full pack. 🔥`
}

export default function AIWriter({ initialTopic = "", initialFormat = "post", onGenerated }) {
  const [topic, setTopic] = useState(initialTopic)
  const [format, setFormat] = useState(initialFormat)
  const [company, setCompany] = useState(companies[0])
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [templateName, setTemplateName] = useState("")

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setOutput("")
    try {
      // TODO: Replace with real fetch to Workers AI / Groq
      // const res = await fetch("/api/ai/generate", { method:"POST", body: JSON.stringify({topic, format, company}) })
      const text = await mockGenerate({ topic, format, company, template: templateName })
      setOutput(text)
      onGenerated?.(text)
    } catch (e) {
      setOutput("Error generating content. Check Groq API key in .env (GROQ_API_KEY).")
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateApplied = (tpl) => {
    setFormat(tpl.format)
    setTemplateName(tpl.name)
    setTopic(tpl.prompt)
  }

  // expose helper for parent via window event (simple)
  // instead parent can call setTopic directly via prop sync
  return (
    <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">✦</div>
        <h3 className="text-sm font-bold tracking-widest uppercase" style={{color:'#0A0A0A'}}>AI Writer</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">Groq • Fast</span>
      </div>
      <p className="text-xs mt-1" style={{color:'#6B7280'}}>Powered by Groq via Workers AI — generate in 1.2s</p>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <label className="text-xs font-bold tracking-widest uppercase" style={{color:'#6B7280'}}>Topic / Keywords</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The invisible system that handles everything for agency owners..."
            rows={3}
            className="mt-2 w-full bg-[#FFFCF8] border border-[#EDEDED] rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E17EB]/30"
            style={{color:'#0A0A0A'}}
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold tracking-widest uppercase" style={{color:'#6B7280'}}>Format</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`py-2.5 rounded-xl text-xs font-black tracking-widest uppercase border transition ${format === f.id ? "bg-[#5E17EB] text-white border-[#5E17EB]" : "bg-[#F9FAFB] text-[#6B7280] border-[#EDEDED] hover:bg-white"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest uppercase" style={{color:'#6B7280'}}>Company</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2 w-full bg-white border border-[#EDEDED] rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#5E17EB]/50"
              style={{color:'#0A0A0A'}}
            >
              {companies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || loading}
        className="mt-4 w-full py-3 rounded-xl bg-[#FFD700] hover:bg-[#ffdf33] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0215] font-black tracking-widest uppercase text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-[#FFD700]/10"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#0B0215]/30 border-t-[#0B0215] rounded-full animate-spin" /> Generating...
          </>
        ) : (
          <>✦ Generate {format}</>
        )}
      </button>

      {output && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold tracking-widest uppercase" style={{color:'#6B7280'}}>Output</label>
            <div className="flex gap-2">
              <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs px-3 py-1 rounded-full bg-white border border-[#EDEDED] hover:bg-[#F9FAFB] transition" style={{color:'#0A0A0A'}}>Copy</button>
              <button onClick={() => setOutput("")} className="text-xs px-3 py-1 rounded-full bg-[#F9FAFB] border border-[#EDEDED] hover:bg-white transition" style={{color:'#6B7280'}}>Clear</button>
            </div>
          </div>
          <pre className="mt-2 bg-[#FFFCF8] border border-[#EDEDED] rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-[320px] overflow-auto" style={{color:'#0A0A0A'}}>
            {output}
          </pre>
        </div>
      )}

      <p className="mt-3 text-[11px] text-center" style={{color:'#9CA3AF'}}>Mock mode — wire <code style={{color:'#6B7280'}}>/api/ai/generate</code> to Groq + Workers AI with <code style={{color:'#6B7280'}}>GROQ_API_KEY</code> in .env</p>
    </div>
  )
}
