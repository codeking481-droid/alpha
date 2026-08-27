import { useState } from "react"

const initialItems = [
  { id: 1, title: "Genesis Launch Post", date: "2026-08-28", format: "post", company: "Genesis" },
  { id: 2, title: "Dominion Outreach Follow-up", date: "2026-08-29", format: "caption", company: "Dominion" },
  { id: 3, title: "Alpha Agency Blog: Invisible OS", date: "2026-09-02", format: "article", company: "AlphaTek X" },
  { id: 4, title: "Video Script: 60s Hook", date: "2026-09-03", format: "script", company: "Genesis" },
]

const fmtDot = {
  post: "bg-sky-400",
  article: "bg-violet-400",
  script: "bg-fuchsia-400",
  caption: "bg-amber-400",
}

function getDaysInMonth(year, month) {
  const d = new Date(year, month, 1)
  const days = []
  const firstDay = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= total; i++) days.push(i)
  return days
}

export default function ContentCalendar({ items = initialItems }) {
  const [view, setView] = useState("month") // month | week | day
  const [cursor] = useState(new Date(2026, 7, 1)) // Aug 2026
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const days = getDaysInMonth(year, month)
  const monthName = cursor.toLocaleString("en-US", { month: "long", year: "numeric" })

  const itemsByDay = {}
  items.forEach((it) => {
    const day = new Date(it.date).getDate()
    // only show items in current month for demo
    if (new Date(it.date).getMonth() === month) {
      if (!itemsByDay[day]) itemsByDay[day] = []
      itemsByDay[day].push(it)
    }
  })

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Content Calendar</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0B0215] border border-white/10 rounded-full p-1">
            {["month", "week", "day"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition ${view === v ? "bg-[#FFD700] text-[#0B0215]" : "text-white/50 hover:text-white"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm font-black tracking-tight">{monthName}</div>
        <div className="text-xs text-white/40">{items.length} scheduled • drag to reschedule (soon)</div>
      </div>

      {view === "month" && (
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-px text-center text-[11px] font-bold tracking-widest uppercase text-white/30 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-[84px] rounded-xl border p-2 transition ${day ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10" : "bg-transparent border-transparent"}`}
              >
                {day && (
                  <>
                    <div className="text-xs font-bold text-white/60">{day}</div>
                    <div className="mt-1 space-y-1">
                      {(itemsByDay[day] || []).map((it) => (
                        <div
                          key={it.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(it.id))}
                          className="group flex items-center gap-1.5 bg-[#0B0215] border border-white/10 rounded-lg px-2 py-1 cursor-grab active:cursor-grabbing hover:border-[#FFD700]/30 transition"
                          title={`${it.title} — ${it.company}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${fmtDot[it.format]}`} />
                          <span className="text-[11px] font-semibold text-white truncate flex-1">{it.title}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {view !== "month" && (
        <div className="mt-6 space-y-2">
          {items.slice(0, view === "week" ? 4 : 1).map((it) => (
            <div key={it.id} className="flex items-center gap-3 bg-[#0B0215] border border-white/10 rounded-xl p-3">
              <span className={`w-2 h-2 rounded-full ${fmtDot[it.format]}`} />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{it.title}</div>
                <div className="text-xs text-white/40">{it.date} • {it.company} • {it.format}</div>
              </div>
              <span className="text-xs text-white/30">Drag ↕</span>
            </div>
          ))}
          <p className="text-xs text-white/20 text-center pt-2">Week/Day drag-and-drop wiring coming — plug to D1 in Workers</p>
        </div>
      )}
    </div>
  )
}
