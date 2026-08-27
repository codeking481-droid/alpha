const dotColor = {
  content: "bg-[#FFD700]",
  outreach: "bg-emerald-400",
  company: "bg-sky-400",
  system: "bg-white/40",
}

export default function ActivityFeed({ items }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Recent Activity</h3>
        <span className="text-xs text-white/30">{items.length} updates</span>
      </div>

      <div className="mt-5 space-y-0 relative">
        {/* vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10 hidden sm:block" />

        {items.map((item) => (
          <div key={item.id} className="relative flex gap-4 py-3 group">
            <div className={`hidden sm:flex w-6 h-6 rounded-full ${dotColor[item.type] || "bg-white/20"} items-center justify-center shrink-0 mt-0.5 z-10 border-2 border-[#0B0215]`}>
              <span className="w-1.5 h-1.5 bg-[#0B0215] rounded-full opacity-60" />
            </div>

            <div className="flex-1 min-w-0 bg-white/[0.03] group-hover:bg-white/[0.06] border border-white/5 group-hover:border-white/10 rounded-xl p-3 transition">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-white">{item.user}</span>
                <span className="text-white/30">•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/60 font-medium text-[11px] tracking-widest uppercase">{item.company}</span>
                <span className="ml-auto text-white/30 text-xs">{item.time}</span>
              </div>
              <p className="text-sm text-white/80 mt-1.5 leading-relaxed">{item.action}</p>
              {item.meta && <p className="text-xs text-white/40 mt-1">{item.meta}</p>}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-white/30">No activity yet. Start working and it will appear here.</p>
            <p className="text-xs text-white/20 mt-1">Your recent actions will be tracked here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
