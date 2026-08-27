import { useState } from "react"
import ContentCard from "../components/content/ContentCard"
import AIWriter from "../components/content/AIWriter"
import TemplateSelector, { templates } from "../components/content/TemplateSelector"
import ContentCalendar from "../components/content/ContentCalendar"
import { useLocalStorage } from "../hooks/useLocalStorage.js"

export default function ContentStudio() {
  const [projects, setProjects] = useLocalStorage("alpha.content", [])
  const [companies] = useLocalStorage("alpha.companies", [])
  const realCompany = companies[0]?.name || "Your Company"
  const [filter, setFilter] = useState("all")
  const [aiTopic, setAiTopic] = useState("")
  const [aiFormat, setAiFormat] = useState("post")
  const [search, setSearch] = useState("")

  const handleTemplateSelect = (tpl) => {
    setAiFormat(tpl.format)
    setAiTopic(tpl.prompt)
    // scroll to AI writer
    document.getElementById("ai-writer")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleGenerated = (text) => {
    const title = text.split("\n")[0].slice(0, 48).replace(/^#+\s*/, "") || "AI Draft"
    setProjects((prev) => [
      { id: Date.now(), title: title, format: aiFormat, company: realCompany, status: "draft", words: text.split(/\s+/).length, lastEdited: "now", preview: text.slice(0, 120) },
      ...prev,
    ])
  }

  const filtered = projects.filter((p) => {
    const matchesFilter = filter === "all" || p.status === filter || p.format === filter
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0B0215] text-white selection:bg-[#FFD700] selection:text-[#0B0215]">
      {/* Sub Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215] font-black">âœï¸</div>
          <div>
            <h1 className="font-black tracking-tight leading-none">CONTENT STUDIO</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase font-semibold">Create posts, articles, scripts & captions</p>
          </div>
        </div>
        <button
          onClick={() => setProjects([{ id: Date.now(), title: "Untitled Draft", format: "post", company: realCompany, status: "draft", words: 0, lastEdited: "now", preview: "Real draft — edit and save" }, ...projects])}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#ffdf33] text-[#0B0215] text-xs font-black tracking-widest uppercase transition shadow-lg shadow-[#FFD700]/10"
        >
          + New Content
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Total Projects</div>
            <div className="text-3xl font-black mt-2">{projects.length}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Drafts</div>
            <div className="text-3xl font-black mt-2 text-white/80">{projects.filter(p=>p.status==="draft").length}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">In Review</div>
            <div className="text-3xl font-black mt-2 text-amber-400">{projects.filter(p=>p.status==="review").length}</div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
            <div className="text-xs tracking-widest uppercase font-bold text-white/40">Published</div>
            <div className="text-3xl font-black mt-2 text-emerald-400">{projects.filter(p=>p.status==="published").length}</div>
          </div>
        </div>

        {/* Templates */}
        <TemplateSelector onSelect={handleTemplateSelect} />

        {/* AI Writer */}
        <div id="ai-writer">
          <AIWriter initialTopic={aiTopic} initialFormat={aiFormat} onGenerated={handleGenerated} />
        </div>

        {/* Library Header */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Content Library</h3>
          <span className="text-xs text-white/30">{filtered.length} items</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or company..."
            className="ml-auto min-w-[200px] flex-1 sm:flex-none bg-[#0B0215] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD700]/40"
          />
          <div className="flex items-center gap-1 bg-[#0B0215] border border-white/10 rounded-full p-1">
            {[
              ["all", "All"],
              ["draft", "Draft"],
              ["review", "Review"],
              ["published", "Published"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition ${filter === id ? "bg-[#FFD700] text-[#0B0215]" : "text-white/50 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} onEdit={() => console.log("edit", item)} onPreview={() => console.log("preview", item)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 bg-[#0B0215] border border-white/5 rounded-xl">
            <p className="text-sm text-white/50 font-bold">{projects.length === 0 ? "No real content yet — that's correct" : "No matches"}</p>
            <p className="text-xs text-white/30 mt-1 max-w-md mx-auto">{projects.length === 0 ? "Usefulness: Create posts/articles/scripts here. Use AI Writer above or + New Content. Real content you create appears here and in Calendar." : "Try another filter or search"}</p>
          </div>
        )}

        {/* Calendar */}
        <ContentCalendar />
      </main>

      <footer className="text-center py-10 text-xs text-white/20 tracking-widest uppercase font-semibold">
        Content Studio â€¢ Fast & easy to use â€¢ Where content gets created ðŸ‡³ðŸ‡¬ðŸ”¥ðŸš€
      </footer>
    </div>
  )
}

