const formatConfig = {
  post: { label: "Post", icon: "📱", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  article: { label: "Article", icon: "📰", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  script: { label: "Script", icon: "🎬", color: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20" },
  caption: { label: "Caption", icon: "✨", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
}

const statusConfig = {
  draft: "bg-white/10 text-white/60 border-white/10",
  review: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
}

export default function ContentCard({ item, onEdit, onPreview }) {
  const fmt = formatConfig[item.format] || formatConfig.post
  return (
    <div className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-[#FFD700]/20 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-sm shrink-0 ${fmt.color}`}>
          {fmt.icon}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border tracking-widest uppercase ${statusConfig[item.status]}`}>
          {item.status}
        </span>
      </div>

      <h3 className="mt-3 font-bold text-white leading-tight line-clamp-2 group-hover:text-[#FFD700] transition">{item.title}</h3>
      
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full border font-semibold text-[11px] tracking-widest uppercase ${fmt.color}`}>{fmt.label}</span>
        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 font-medium">{item.company}</span>
      </div>

      <div className="mt-3 text-xs text-white/40 flex items-center gap-3">
        <span>{item.words} words</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>Edited {item.lastEdited}</span>
      </div>

      {item.preview && (
        <p className="mt-3 text-xs text-white/50 line-clamp-2 leading-relaxed bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
          {item.preview}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={() => onEdit?.(item)} className="flex-1 py-2 rounded-xl bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-white/90 transition">Edit</button>
        <button onClick={() => onPreview?.(item)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition">Preview</button>
      </div>
    </div>
  )
}
