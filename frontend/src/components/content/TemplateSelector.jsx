const templates = [
  { id: "linkedin", name: "LinkedIn Post", icon: "💼", desc: "Authority + story hook", format: "post", prompt: "Write a LinkedIn post about [topic] with a strong hook, 3 lessons, and a CTA. Tone: confident, concise." },
  { id: "twitter", name: "Twitter Thread", icon: "🐦", desc: "Viral thread structure", format: "post", prompt: "Create a 7-tweet thread about [topic]. Tweet 1 = hook, 2-6 = value, 7 = CTA + follow." },
  { id: "blog", name: "Blog Article", icon: "📝", desc: "SEO + long form", format: "article", prompt: "Write a 1000-word blog article about [topic]. Include H2s, intro, actionable steps, conclusion." },
  { id: "script", name: "Video Script", icon: "🎥", desc: "Hook → Value → CTA", format: "script", prompt: "Write a 60s video script about [topic]. Hook (0-3s), 3 value points, strong CTA. Teleprompter ready." },
  { id: "newsletter", name: "Newsletter", icon: "📧", desc: "Engage + nurture", format: "caption", prompt: "Write a newsletter edition about [topic]. Subject line, preview, intro story, 3 insights, PS." },
]

export default function TemplateSelector({ onSelect }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Content Templates</h3>
      <p className="text-xs text-white/40 mt-1">One click to start — pre-made for speed</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect?.(t)}
            className="group text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-[#FFD700]/30 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FFD700]/5"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-[#FFD700] flex items-center justify-center text-lg transition">
              <span className="group-hover:scale-110 transition">{t.icon}</span>
            </div>
            <div className="mt-3 text-sm font-bold text-white group-hover:text-[#FFD700] transition">{t.name}</div>
            <div className="text-xs text-white/40 mt-1 leading-relaxed">{t.desc}</div>
            <div className="mt-3 text-[11px] font-bold tracking-widest uppercase text-white/20 group-hover:text-[#FFD700]/60 transition">Use template →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { templates }
