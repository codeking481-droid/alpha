const templates = [
  { id: "linkedin", name: "LinkedIn Post", icon: "💼", desc: "Authority + story hook", format: "post", prompt: "Write a LinkedIn post about [topic] with a strong hook, 3 lessons, and a CTA. Tone: confident, concise." },
  { id: "twitter", name: "Twitter Thread", icon: "🐦", desc: "Viral thread structure", format: "post", prompt: "Create a 7-tweet thread about [topic]. Tweet 1 = hook, 2-6 = value, 7 = CTA + follow." },
  { id: "blog", name: "Blog Article", icon: "📝", desc: "SEO + long form", format: "article", prompt: "Write a 1000-word blog article about [topic]. Include H2s, intro, actionable steps, conclusion." },
  { id: "script", name: "Video Script", icon: "🎥", desc: "Hook → Value → CTA", format: "script", prompt: "Write a 60s video script about [topic]. Hook (0-3s), 3 value points, strong CTA. Teleprompter ready." },
  { id: "newsletter", name: "Newsletter", icon: "📧", desc: "Engage + nurture", format: "caption", prompt: "Write a newsletter edition about [topic]. Subject line, preview, intro story, 3 insights, PS." },
]

export default function TemplateSelector({ onSelect }) {
  return (
    <div className="bg-white border border-[#EDEDED] rounded-2xl p-6">
      <h3 className="text-sm font-bold tracking-widest uppercase" style={{color:'#0A0A0A'}}>Content Templates</h3>
      <p className="text-xs mt-1" style={{color:'#6B7280'}}>One click to start — pre-made for speed</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect?.(t)}
            className="group text-left bg-[#FFFCF8] hover:bg-white border border-[#EDEDED] hover:border-[#5E17EB]/20 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#5E17EB] flex items-center justify-center text-lg transition border border-[#EDEDED]">
              <span className="group-hover:scale-110 transition">{t.icon}</span>
            </div>
            <div className="mt-3 text-sm font-bold group-hover:text-[#5E17EB] transition" style={{color:'#0A0A0A'}}>{t.name}</div>
            <div className="text-xs mt-1 leading-relaxed" style={{color:'#6B7280'}}>{t.desc}</div>
            <div className="mt-3 text-[11px] font-bold tracking-widest uppercase group-hover:text-[#5E17EB]/70 transition" style={{color:'#9CA3AF'}}>Use template →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { templates }
