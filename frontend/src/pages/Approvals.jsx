import { useState, useEffect } from 'react'
import { API_URL } from '../lib/api.js'

export default function Approvals() {
  const [replies, setReplies] = useState([])
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/api/replies`).then(r=>r.json()).catch(()=>({replies:[] })),
        fetch(`${API_URL}/api/leads`).then(r=>r.json()).catch(()=>[]),
      ])
      const rep = Array.isArray(r1) ? r1 : (r1.replies || [])
      const ld = Array.isArray(r2) ? r2 : (r2.leads || [])
      setReplies(rep)
      setLeads(ld)
    } catch { setMsg('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(()=>{ fetchAll() }, [])

  // Derive approvals: replies containing yes + leads linked
  const approvals = (() => {
    const yesReplies = replies.filter(r=>{
      const txt = `${r.content||r.text||r.message||''}`.toLowerCase()
      return txt.includes('yes') || txt.includes('approved') || String(r.status||'').toLowerCase()==='yes'
    })
    // Also treat leads with status approved
    const approvedLeads = leads.filter(l=> String(l.status||'').toLowerCase()==='approved' || String(l.approved||'').toLowerCase()==='true')
    // Merge unique by lead_id/company
    const map = new Map()
    yesReplies.forEach(r=>{
      const key = String(r.lead_id || r.leadId || r.message_id || r.company || r.from || r.id)
      map.set(key, { type:'reply', data:r, company: r.company || r.from || r.lead_id, replyText: r.content||r.text||'', at: r.created_at || r.sent_at })
    })
    approvedLeads.forEach(l=>{
      const key = String(l.id)
      if(!map.has(key)) map.set(key, { type:'lead', data:l, company: l.company || l.name, replyText: 'Approved', at: l.created_at })
    })
    // If no yes yet, show all replies as reviewable
    if(map.size===0 && filter==='all') {
      replies.forEach(r=>{
        const key = String(r.id)
        if(!map.has(key)) map.set(key, { type:'reply', data:r, company: r.company||r.from||r.lead_id||'Unknown', replyText: r.content||r.text||'', at: r.created_at })
      })
      // also show leads awaiting review
      leads.slice(0,5).forEach(l=>{
        const key = `lead-${l.id}`
        if(!map.has(key)) map.set(key, { type:'lead', data:l, company: l.company||l.name, replyText: l.email||l.phone||'Lead', at: l.created_at })
      })
    }
    return Array.from(map.values())
  })()

  const filtered = filter==='yes' ? approvals.filter(a=> a.replyText.toLowerCase().includes('yes')||a.type==='lead') : approvals

  const handleApprove = async (item) => {
    const company = item.company || item.data?.company || item.data?.name || 'Approved Company'
    const niche = item.data?.industry || item.data?.niche || 'business'
    setApproving(company)
    setMsg('')
    try {
      // Create campaign via Ad Engine — 7-day plan
      const res = await fetch(`${API_URL}/api/ad-engine/plan`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ company, niche, offer: { price: 500 } }),
      })
      const data = await res.json().catch(()=>({}))
      if(!res.ok) throw new Error(data.error || 'Approve failed')
      // Also persist as campaign in main campaigns list
      await fetch(`${API_URL}/api/campaigns`, {
        method:'POST',
        headers:{'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('alpha.token')||''}`},
        body: JSON.stringify({ name: `${company} — 1 Week`, niche, company, status:'draft', plan: data.plan || data, source:'approvals' }),
      }).catch(()=>{})
      setMsg(`✅ Approved ${company} → 1-week campaign created. Go to Campaigns to generate content.`)
    } catch (e){ setMsg(`❌ ${e.message}`)}
    finally{ setApproving(null) }
  }

  const handleMarkYes = async (item) => {
    // mark reply as yes or lead as approved
    try {
      if(item.type==='reply'){
        const id = item.data.id
        await fetch(`${API_URL}/api/replies`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messageId: id, content: 'YES — approved for 1-week campaign', from:'alpha' }) })
      } else {
        await fetch(`${API_URL}/api/outreach/leads`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...item.data, status:'approved' }) })
      }
      setMsg(`Marked ${item.company} as YES`)
      fetchAll()
    } catch(e){ setMsg(`❌ ${e.message}`)}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFD700] text-[#0B0215] flex items-center justify-center font-black">✓</div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#0A0A0A]">APPROVALS — Yes replies</h1>
          <p className="text-xs text-[#6B7280]">Review companies that said YES → approve to generate 7-day campaign plan</p>
        </div>
        <div className="ml-auto flex gap-2">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="bg-[#FFFCF8] border border-[#EDEDED] rounded-full px-3 py-2 text-xs text-[#0A0A0A]">
            <option value="all">All replies & leads</option>
            <option value="yes">Only YES</option>
          </select>
          <button onClick={fetchAll} className="px-4 py-2 rounded-full bg-[#F9FAFB] border border-[#EDEDED] text-[#6B7280] text-xs">Refresh</button>
        </div>
      </div>

      {msg && <div className="rounded-xl border border-[#EDEDED] bg-white/[0.04] px-4 py-3 text-xs text-[#0A0A0A]/80 whitespace-pre-wrap">{msg}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Replies" value={replies.length} sub="total" />
        <Stat label="YES" value={approvals.filter(a=>a.replyText.toLowerCase().includes('yes')).length} sub="said yes" accent />
        <Stat label="Leads" value={leads.length} sub="in pool" />
        <Stat label="Approved flow" value="→ Campaigns" sub="$500 / week" />
      </div>

      {loading ? <p className="text-center text-[#9CA3AF] py-10 text-sm">Loading approvals…</p> : filtered.length===0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-2xl">📥</div>
          <p className="text-[#0A0A0A] font-bold mt-2">No approvals yet</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Send offers from Outreach → when a company replies YES it appears here. You can also mark any lead as YES to test.</p>
          <div className="mt-4 flex justify-center gap-2">
            <a href="/outreach" className="px-4 py-2 rounded-full bg-[#FFD700] text-[#0B0215] font-black text-xs">Go to Outreach → Send offers</a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, idx)=> (
            <div key={idx} className="rounded-2xl border border-[#EDEDED] bg-white/[0.04] backdrop-blur p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] to-amber-600 flex items-center justify-center text-[#0B0215] font-black text-sm">{String(item.company||'?').slice(0,2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-[#0A0A0A] truncate">{item.company}</div>
                  <div className="text-xs text-[#6B7280] truncate">{item.data?.email || item.data?.phone || item.data?.website || item.replyText.slice(0,60)}</div>
                  <div className="text-[11px] text-[#0A0A0A]/25 mt-1">{item.at ? new Date(item.at).toLocaleString() : ''} • {item.type}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${item.replyText.toLowerCase().includes('yes')?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20':'bg-[#F9FAFB] text-[#6B7280] border border-[#EDEDED]'}`}>{item.replyText.toLowerCase().includes('yes')?'YES':'REVIEW'}</span>
              </div>
              {item.replyText && <div className="rounded-xl bg-[#FFFCF8] border border-[#EDEDED] p-3 text-xs text-[#0A0A0A]/70 whitespace-pre-wrap max-h-20 overflow-auto">{item.replyText}</div>}
              <div className="flex gap-2">
                <button onClick={()=>handleApprove(item)} disabled={!!approving} className="flex-1 py-2.5 rounded-xl bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase disabled:opacity-50">{approving===item.company?'Approving…':'Approve → Create 1-Week Plan'}</button>
                <button onClick={()=>handleMarkYes(item)} className="px-3 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#EDEDED] text-[#6B7280] text-xs">Mark YES</button>
              </div>
              <p className="text-[11px] text-[#0A0A0A]/25">Approve generates Day 1-7 plan + 32 deliverables ($500). Next: Campaigns → Generate content.</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <h3 className="text-xs font-black tracking-widest uppercase text-amber-400">🔒 Truth Clause — included in every proposal</h3>
        <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">We have real communities, not bots. LinkedIn (700 followers, 500+ connections): 10 posts. WhatsApp (215+ members across 2 groups): 10 posts. Telegram (54 members): 10 posts. YouTube (3,000+ subscribers): 2 videos. We do not guarantee views, likes, or conversions. We guarantee we will deliver the content to real people who have chosen to follow us. The rest is organic.</p>
      </div>

      <div className="rounded-2xl border border-[#EDEDED] bg-white/[0.02] p-4">
        <h3 className="text-xs font-black tracking-widest uppercase text-[#6B7280]">How approvals work</h3>
        <ol className="list-decimal list-inside text-xs text-[#6B7280] mt-2 space-y-1">
          <li>Lead Finder → 100 companies via Apollo/Serply/Tavily</li>
          <li>Outreach Sender → sends personalized $500 offer (with Truth Clause)</li>
          <li>Reply Tracker → collects replies</li>
          <li><b className="text-[#6B7280]">Approvals</b> → you review YES → click Approve</li>
          <li>Campaign Planner → 7-day plan (10+10+10+2 posts)</li>
          <li>Content Generator → Groq creates all posts</li>
          <li>Delivery Helper → you post to real communities</li>
        </ol>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, accent }) {
  return (
    <div className="bg-white/[0.04] border border-[#EDEDED] rounded-2xl p-4">
      <div className="text-[11px] tracking-widest uppercase font-bold text-[#9CA3AF]">{label}</div>
      <div className={`text-2xl font-black mt-1 ${accent?'text-emerald-400':'text-[#0A0A0A]'}`}>{value}</div>
      <div className="text-xs text-[#0A0A0A]/25 mt-1">{sub}</div>
    </div>
  )
}
