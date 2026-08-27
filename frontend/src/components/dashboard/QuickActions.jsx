const actions = [
  { id: "company", label: "Add Company", desc: "Register a new venture", icon: "🏢", accent: true },
  { id: "content", label: "Create Content", desc: "Write posts & scripts", icon: "✍️", accent: false },
  { id: "outreach", label: "Send Outreach", desc: "Draft & send leads", icon: "📧", accent: false },
  { id: "analytics", label: "View Analytics", desc: "Track performance", icon: "📊", accent: false },
]

export default function QuickActions({ onAction }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Quick Actions</h3>
      <p className="text-xs text-white/40 mt-1">Launch your next move in one click</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => onAction?.(a.id)}
            className={`group relative text-left rounded-xl p-4 border transition-all duration-300 hover:-translate-y-0.5 text-sm font-semibold flex items-start gap-3
              ${a.accent
                ? "bg-[#FFD700] text-[#0B0215] border-[#FFD700] hover:bg-[#ffdf33] hover:shadow-lg hover:shadow-[#FFD700]/20"
                : "bg-white/[0.04] text-white border-white/10 hover:bg-white/[0.08] hover:border-white/20"
              }`}
          >
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${a.accent ? "bg-[#0B0215]/10" : "bg-white/10"}`}>
              {a.icon}
            </span>
            <span className="flex-1">
              <span className="block font-bold leading-none">{a.label}</span>
              <span className={`block text-xs mt-1 font-medium ${a.accent ? "text-[#0B0215]/60" : "text-white/50"}`}>{a.desc}</span>
            </span>
            <span className={`opacity-0 group-hover:opacity-100 transition text-xs ${a.accent ? "text-[#0B0215]/50" : "text-white/30"}`}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
