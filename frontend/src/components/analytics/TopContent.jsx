const platformStyle = {
  LinkedIn: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  Twitter: "bg-sky-400/15 text-sky-300 border-sky-400/20",
  Blog: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  YouTube: "bg-red-500/15 text-red-400 border-red-500/20",
  Newsletter: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Instagram: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/20",
}

const formatEmoji = {
  post: "📱",
  article: "📰",
  script: "🎬",
  caption: "✨",
}

export default function TopContent({ items, loading = false }) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="h-4 w-40 bg-white/10 rounded-full animate-shimmer"></div>
        <div className="mt-4 space-y-3">
          {[1,2,3].map(i=> <div key={i} className="h-16 bg-white/5 rounded-xl animate-shimmer"></div>)}
        </div>
      </div>
    )
  }
  return (
    <div className="glass rounded-2xl p-6 animate-slideUp">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Top Performing Content</h3>
        <span className="text-xs text-white/30">{items.length} posts • 30 days</span>
      </div>
      <p className="text-xs text-white/40 mt-1">Sorted by engagement rate • views + likes + shares</p>

      <div className="mt-4 space-y-3">
        {items.map((it, idx) => (
          <div key={it.id} className="group bg-[#0B0215] border border-white/10 rounded-2xl p-4 hover:border-[#FFD700]/20 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex gap-4">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center text-lg shrink-0 group-hover:bg-[#FFD700] group-hover:border-[#FFD700] transition">
                <span className="group-hover:scale-110 transition">{formatEmoji[it.format] || "📄"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-[#FFD700] transition truncate">{idx + 1}. {it.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold tracking-widest uppercase border ${platformStyle[it.platform] || "bg-white/10 text-white/60 border-white/10"}`}>{it.platform}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-white/30">Views</div>
                    <div className="text-sm font-black text-white mt-1">{it.views.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-white/30">Likes</div>
                    <div className="text-sm font-black text-white mt-1">{it.likes.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl p-2.5">
                    <div className="text-[11px] tracking-widest uppercase font-bold text-[#FFD700]/60">Eng. Rate</div>
                    <div className="text-sm font-black text-[#FFD700] mt-1">{it.engagement}%</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-full" style={{ width: `${Math.min(it.engagement * 6, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
