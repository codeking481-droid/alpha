import { useLocalStorage } from "../../hooks/useLocalStorage.js"

export default function Onboarding() {
  const [companies] = useLocalStorage("alpha.companies", [])
  const [dismissed, setDismissed] = useLocalStorage("alpha.onboardingDismissed", false)
  if (dismissed || companies.length > 0) return null
  const steps = [
    { done: companies.length > 0, label: "Add your first company", desc: "So revenue & projects are real", href: "/" },
    { done: false, label: "Create content in Studio", desc: "AI Writer → Save", href: "/content" },
    { done: false, label: "Find leads in Outreach", desc: "Lead Finder → Campaign", href: "/outreach" },
    { done: false, label: "Track revenue in Deal Desk", desc: "Invoices + contracts", href: "/deals" },
  ]
  const progress = Math.round((steps.filter(s=>s.done).length / steps.length)*100)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
      <div className="gold-card rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-slideUp">
        <div className="flex-1">
          <div className="text-sm font-black tracking-widest uppercase text-[#FFD700]">Welcome to Alpha — 4 steps to real OS</div>
          <div className="mt-2 h-2 bg-[#0B0215] rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-[#FFD700] to-[#F59E0B] rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${s.done ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40 border border-white/10"}`}>{s.done ? "✓" : "○"}</span>
                <span className={s.done ? "text-white line-through" : "text-white"}>{s.label}</span>
                <span className="text-white/30 text-xs hidden sm:inline">— {s.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold hover:bg-white/20 transition shrink-0">Dismiss</button>
      </div>
    </div>
  )
}
