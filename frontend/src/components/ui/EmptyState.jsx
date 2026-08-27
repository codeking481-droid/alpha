export default function EmptyState({ icon = "🚀", title, description, tip, action, actionLabel, secondary }) {
  return (
    <div className="empty-state glass p-8 sm:p-12 text-center max-w-2xl mx-auto rounded-2xl border border-white/10">
      <span className="text-5xl sm:text-6xl">{icon}</span>
      <h3 className="text-xl sm:text-2xl font-bold text-white mt-4 tracking-tight">{title}</h3>
      <p className="text-white/50 mt-2 text-sm">{description}</p>
      {tip && <p className="text-[#FFD700] text-sm mt-2 font-semibold">💡 {tip}</p>}
      {action && actionLabel && (
        <button onClick={action} className="mt-6 w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black tracking-widest uppercase text-xs hover:scale-105 transition shadow-gold min-h-[48px]">
          {actionLabel}
        </button>
      )}
      {secondary}
    </div>
  )
}
