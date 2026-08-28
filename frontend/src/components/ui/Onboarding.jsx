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
      <div className="card rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-slideUp" style={{background:'#FFFFFF', border:'1px solid #EDEDED'}}>
        <div className="flex-1">
          <div className="text-sm font-bold tracking-widest uppercase" style={{color:'#5E17EB'}}>Welcome to Alpha — 4 steps to real OS</div>
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{background:'#F3F4F6', border:'1px solid #EDEDED'}}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background:'#5E17EB' }} />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={s.done ? {background:'#10B981', color:'#FFFFFF'} : {background:'#F9FAFB', color:'#9CA3AF', border:'1px solid #EDEDED'}}>{s.done ? "✓" : "○"}</span>
                <span style={s.done ? {color:'#9CA3AF', textDecoration:'line-through'} : {color:'#0A0A0A'}}>{s.label}</span>
                <span className="text-xs hidden sm:inline" style={{color:'#9CA3AF'}}>— {s.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="px-4 py-2 rounded-full text-xs font-bold transition shrink-0" style={{background:'#F9FAFB', border:'1px solid #EDEDED', color:'#6B7280'}}>Dismiss</button>
      </div>
    </div>
  )
}
