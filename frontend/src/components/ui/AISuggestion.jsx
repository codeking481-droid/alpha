export default function AISuggestion({ message, action, actionLabel }) {
  return (
    <div className="ai-suggestion glass p-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-[#FFD700]/20 border-l-[3px] border-l-[#FFD700]">
      <div className="flex-1">
        <span className="text-[#FFD700] font-black text-sm">🤖 Alpha says:</span>
        <span className="text-white ml-2 text-sm">{message}</span>
      </div>
      {action && actionLabel && (
        <button onClick={action} className="px-5 py-2.5 rounded-full bg-white text-[#0B0215] text-xs font-black tracking-widest uppercase hover:bg-white/90 transition shrink-0 min-h-[40px]">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
