import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const commands = [
  { id: "dashboard", label: "Go to Command Hub", desc: "Companies & overview", to: "/", icon: "🚀" },
  { id: "content", label: "Go to Content Studio", desc: "Create posts & scripts", to: "/content", icon: "✍️" },
  { id: "outreach", label: "Go to Outreach Engine", desc: "Leads & messages", to: "/outreach", icon: "📧" },
  { id: "analytics", label: "Go to Analytics", desc: "Views & revenue", to: "/analytics", icon: "📊" },
  { id: "deals", label: "Go to Deal Desk", desc: "Invoices & revenue", to: "/deals", icon: "💰" },
  { id: "add-company", label: "Add Company", desc: "Create real company", to: "/", icon: "🏢" },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const nav = useNavigate()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v) }
      if (e.key === "/") { // quick open
        if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault(); setOpen(true)
        }
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const filtered = !q ? commands : commands.filter((c) => `${c.label} ${c.desc}`.toLowerCase().includes(q.toLowerCase()))

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-[#EDEDED] text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9FAFB] hover:border-[#D0D0D0] transition text-xs shadow-sm">
        <span>⌘K</span> <span>Search</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#14141f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <span className="text-white/40">🔍</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands, badges, companies..." className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base" />
          <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">ESC</button>
        </div>
        <div className="max-h-[300px] overflow-auto p-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { setOpen(false); nav(c.to) }} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{c.label}</div>
                <div className="text-xs text-white/40 truncate">{c.desc}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-sm text-white/30 py-8">No results</p>}
        </div>
        <div className="p-3 bg-white/[0.03] border-t border-white/5 text-xs text-white/20 text-center">Press / or ⌘K to open • ESC to close</div>
      </div>
    </div>
  )
}
