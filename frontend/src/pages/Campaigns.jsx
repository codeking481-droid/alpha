import { useState, useEffect } from 'react';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { CreateCampaign } from '../components/campaigns/CreateCampaign';
import { API_URL } from '../lib/api.js';

const WEEK_TEMPLATE = [
  { day: 1, linkedin: 'Announcement', whatsapp: 'Teaser', telegram: 'Intro', youtube: '—' },
  { day: 2, linkedin: 'Problem-solution', whatsapp: 'Deep dive', telegram: 'Poll', youtube: '—' },
  { day: 3, linkedin: 'Social proof', whatsapp: 'Testimonial', telegram: 'Discussion', youtube: '—' },
  { day: 4, linkedin: 'Educational', whatsapp: 'Tip', telegram: 'AMA', youtube: 'Video 1' },
  { day: 5, linkedin: 'Industry insight', whatsapp: 'Offer', telegram: 'Feedback', youtube: '—' },
  { day: 6, linkedin: 'CTA', whatsapp: 'Reminder', telegram: 'Urgency', youtube: '—' },
  { day: 7, linkedin: 'Recap', whatsapp: 'Final push', telegram: 'Thank you', youtube: 'Video 2' },
];

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('manage'); // manage | one-week
  const [autoForm, setAutoForm] = useState({ campaignId:'', perDay:'10', atHour:'9', leads:'', template:'' });
  const [autoMsg, setAutoMsg] = useState('');
  const [queue, setQueue] = useState(null);
  // Ad Engine one-week state
  const [awCompany, setAwCompany] = useState('');
  const [awNiche, setAwNiche] = useState('');
  const [awPlan, setAwPlan] = useState(null);
  const [awContent, setAwContent] = useState(null);
  const [awDelivery, setAwDelivery] = useState(null);
  const [awLoading, setAwLoading] = useState('');
  const [community, setCommunity] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns`);
      const data = await res.json().catch(()=>[]);
      setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
    } catch { setCampaigns([]); }
    finally { setLoading(false); }
  };

  const fetchCommunity = async ()=>{
    try { const r=await fetch(`${API_URL}/api/community`); const d=await r.json(); setCommunity(d); } catch {}
  };

  const fetchQueue = async (cid) => {
    const q = cid || autoForm.campaignId;
    if (!q) { setQueue(null); return; }
    const res = await fetch(`${API_URL}/api/automation/status?campaignId=${encodeURIComponent(q)}`);
    const data = await res.json().catch(()=>({}));
    setQueue(data.status || data.queues || data);
  };

  useEffect(()=>{ fetchAll(); fetchCommunity(); }, []);

  const handleAction = async (action, camp) => {
    const token = localStorage.getItem('alpha.token') || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      if (action==='delete') {
        if (!confirm(`Delete ${camp.name}?`)) return;
        const res = await fetch(`${API_URL}/api/campaigns/${camp.id}`, { method:'DELETE', headers });
        if (!res.ok) throw new Error('Delete failed');
        setMsg(`✅ Deleted ${camp.name}`);
        fetchAll();
        return;
      }
      if (action==='automation') {
        setAutoForm(f=> ({...f, campaignId: camp.id}));
        document.getElementById('auto-panel')?.scrollIntoView({behavior:'smooth'});
        return;
      }
      const res = await fetch(`${API_URL}/api/campaigns/${camp.id}/${action}`, { method:'POST', headers });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || action+' failed');
      setMsg(`✅ ${camp.name} → ${action}`);
      fetchAll();
    } catch (e) { setMsg(`❌ ${e.message}`); }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setAutoMsg('');
    const leads = autoForm.leads.split(',').map(s=>s.trim()).filter(Boolean).map(email=>({ email }));
    const finalLeads = leads.length ? leads : [{email:'demo1@example.com'},{email:'demo2@example.com'},{email:'demo3@example.com'}];
    try {
      const res = await fetch(`${API_URL}/api/automation/schedule`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ campaignId: autoForm.campaignId, leads: finalLeads, template: autoForm.template || 'Hi {{name}}, quick idea for {{company}}...', schedule:{ type:'daily', perDay: Number(autoForm.perDay)||10, atHour: Number(autoForm.atHour)||9 } }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Schedule failed');
      setAutoMsg(`✅ Scheduled ${finalLeads.length} leads — ${autoForm.perDay}/day at ${autoForm.atHour}:00`);
      fetchQueue(autoForm.campaignId);
    } catch (err){ setAutoMsg(`❌ ${err.message}`); }
  };

  const handlePauseResume = async (type) => {
    if (!autoForm.campaignId) { setAutoMsg('Pick campaign first'); return; }
    const res = await fetch(`${API_URL}/api/automation/${type}`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ campaignId: autoForm.campaignId }),
    });
    const data = await res.json().catch(()=>({}));
    setAutoMsg(data.success ? `✅ ${type}d` : `❌ ${data.error}`);
    fetchQueue();
  };

  const handleTick = async () => {
    if (!autoForm.campaignId) return;
    const res = await fetch(`${API_URL}/api/automation/tick`, {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ campaignId: autoForm.campaignId, perDay: Number(autoForm.perDay)||10 }),
    });
    const data = await res.json().catch(()=>({}));
    setAutoMsg(data.success ? `✅ Sent ${data.sent?.length||0}, remaining ${data.remaining}` : `❌ ${data.error}`);
    fetchQueue();
  };

  // Ad Engine handlers
  const handleGeneratePlan = async (e)=>{
    e?.preventDefault();
    if(!awCompany) { setAwLoading('Company required'); return; }
    setAwLoading('Generating 7-day plan…');
    try {
      const res = await fetch(`${API_URL}/api/ad-engine/plan`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company: awCompany, niche: awNiche || 'business' }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      setAwPlan(data.plan || data);
      setMsg(`✅ Plan for ${awCompany} — 10+10+10+2 in 7 days`);
    } catch(e){ setAwLoading(`❌ ${e.message}`); return; }
    setAwLoading('');
  };
  const handleGenerateContent = async ()=>{
    if(!awPlan) { setAwLoading('Generate plan first'); return; }
    setAwLoading('Generating content via Groq… (32 posts)');
    try{
      const res = await fetch(`${API_URL}/api/ad-engine/generate-content`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ company: awPlan.company || awCompany, niche: awPlan.niche || awNiche, plan: awPlan }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      setAwContent(data.content || data);
      setAwDelivery(data.delivery || null);
    } catch(e){ setAwLoading(`❌ ${e.message}`); return; }
    setAwLoading('');
  };
  const handlePrepareDelivery = async ()=>{
    if(!awContent) return;
    try{
      const res = await fetch(`${API_URL}/api/ad-engine/delivery`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: awContent }) });
      const data = await res.json();
      setAwDelivery(data.delivery || data);
    } catch{}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#0B0215] flex items-center justify-center font-black">⬢</div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">CAMPAIGNS — Run & Track</h1>
          <p className="text-xs text-white/40">Ad Engine • 1-week = 10 LinkedIn + 10 WhatsApp + 10 Telegram + 2 YouTube = $500</p>
        </div>
        <button onClick={fetchAll} className="ml-auto text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
      </div>

      <div className="flex gap-2 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit">
        <button onClick={()=>setTab('manage')} className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase ${tab==='manage'?'bg-[#FFD700] text-[#0B0215]':'text-white/50'}`}>Manage</button>
        <button onClick={()=>setTab('one-week')} className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase ${tab==='one-week'?'bg-[#FFD700] text-[#0B0215]':'text-white/50'}`}>✨ One-Week Ad Engine</button>
        <a href="/approvals" className="px-4 py-2 rounded-full text-xs font-bold text-white/40 hover:text-white">Approvals →</a>
      </div>

      {msg && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">{msg}</p>}

      {tab==='one-week' ? (
        <div className="space-y-6">
          {/* Community strip */}
          {community && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4"><div className="text-[11px] tracking-widest uppercase font-bold text-white/30">LinkedIn</div><div className="text-lg font-black text-white mt-1">{community.community?.linkedin?.followers}+ followers</div><div className="text-xs text-white/30">{community.community?.linkedin?.connections}+ connections • 10 posts</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4"><div className="text-[11px] tracking-widest uppercase font-bold text-white/30">WhatsApp</div><div className="text-lg font-black text-white mt-1">{community.community?.whatsapp?.groups?.reduce((s,g)=>s+g.members,0)||215} members</div><div className="text-xs text-white/30">2 groups • 10 posts</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4"><div className="text-[11px] tracking-widest uppercase font-bold text-white/30">Telegram</div><div className="text-lg font-black text-white mt-1">{community.community?.telegram?.members} members</div><div className="text-xs text-white/30">10 posts</div></div>
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4"><div className="text-[11px] tracking-widest uppercase font-bold text-white/30">YouTube</div><div className="text-lg font-black text-white mt-1">{community.community?.youtube?.subscribers}+ subs</div><div className="text-xs text-white/30">2 videos</div></div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
            <h3 className="text-sm font-black tracking-widest uppercase text-white">Generate 1-Week Campaign</h3>
            <p className="text-xs text-white/40 mt-1">Pick approved company → generate 7-day plan → generate 32 posts → prepare delivery</p>
            <form onSubmit={handleGeneratePlan} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={awCompany} onChange={e=>setAwCompany(e.target.value)} placeholder="Company (e.g. Paystack Alumni Co)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" required />
              <input value={awNiche} onChange={e=>setAwNiche(e.target.value)} placeholder="Niche (e.g. fintech)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
              <button type="submit" className="bg-[#FFD700] text-[#0B0215] rounded-xl font-black text-xs tracking-widest uppercase">Generate 7-Day Plan</button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <select onChange={e=>{ const v=e.target.value; if(v){ const [c,n]=v.split('|'); setAwCompany(c); setAwNiche(n); } }} className="bg-[#0B0215] border border-white/10 rounded-full px-3 py-2 text-xs text-white/60">
                <option value="">— Pick from existing campaigns —</option>
                {campaigns.slice(0,10).map(c=> <option key={c.id} value={`${c.name||c.company}|${c.niche||''}`}>{c.name||c.company} — {c.niche||'niche'}</option>)}
              </select>
              <button onClick={handleGenerateContent} disabled={!awPlan} className="px-4 py-2 rounded-full bg-white text-[#0B0215] text-xs font-black disabled:opacity-40">Generate 32 Posts (Groq)</button>
              <button onClick={handlePrepareDelivery} disabled={!awContent} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs disabled:opacity-40">Prepare Delivery</button>
              <span className="text-xs text-white/40 py-2 ml-2">$500 / week</span>
            </div>
            {awLoading && <p className="text-xs text-white/60 mt-3 whitespace-pre-wrap">{awLoading}</p>}
          </div>

          {/* 7-day grid */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-xs">
              <thead><tr className="text-white/30 text-[11px] tracking-widest uppercase"><th className="text-left p-3">Day</th><th className="text-left p-3">LinkedIn</th><th className="text-left p-3">WhatsApp</th><th className="text-left p-3">Telegram</th><th className="text-left p-3">YouTube</th></tr></thead>
              <tbody>
                {(awPlan?.days || WEEK_TEMPLATE).map(row=> (
                  <tr key={row.day} className="border-t border-white/5 text-white/70">
                    <td className="p-3 font-black text-white whitespace-nowrap">{row.day} • {row.weekday || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][row.day-1]} {row.date ? `• ${row.date}`:''} <span className="text-white/25 font-normal hidden sm:inline">{row.label || WEEK_TEMPLATE[row.day-1]?.linkedin}</span></td>
                    <td className="p-3">{row.linkedin}</td>
                    <td className="p-3">{row.whatsapp}</td>
                    <td className="p-3">{row.telegram}</td>
                    <td className="p-3">{row.youtube}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {awPlan && <div className="p-3 text-xs text-white/40 border-t border-white/5">Deliverables: {awPlan.summary?.linkedin||10} LinkedIn + {awPlan.summary?.whatsapp||10} WhatsApp + {awPlan.summary?.telegram||10} Telegram + {awPlan.summary?.youtube||2} YouTube = {awPlan.summary?.total||32} posts • {awPlan.startDate} → {awPlan.endDate} • ${awPlan.price}</div>}
          </div>

          {/* Generated content */}
          {awContent && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
              <h3 className="text-sm font-black text-white">Content — {awContent.total} posts • {awContent.breakdown?.linkedin} LI • {awContent.breakdown?.whatsapp} WA • {awContent.breakdown?.telegram} TG • {awContent.breakdown?.youtube} YT</h3>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[520px] overflow-auto pr-1">
                {awContent.items.map((it, i)=> (
                  <div key={i} className="rounded-xl bg-[#0B0215] border border-white/10 p-3">
                    <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase font-black">
                      <span className={`px-2 py-1 rounded-full ${it.platform==='linkedin'?'bg-sky-500/15 text-sky-400': it.platform==='whatsapp'?'bg-emerald-500/15 text-emerald-400': it.platform==='telegram'?'bg-violet-500/15 text-violet-400':'bg-red-500/15 text-red-400'}`}>{it.platform}</span>
                      <span className="text-white/30">Day {it.day} • {it.type}</span>
                      {it.mocked && <span className="ml-auto text-amber-400/60">mock</span>}
                    </div>
                    <div className="text-xs text-white/80 whitespace-pre-wrap mt-2 leading-relaxed">{it.content}</div>
                    <button onClick={()=> navigator.clipboard.writeText(it.content)} className="mt-2 text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10">Copy</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery helper */}
          {awDelivery && (
            <div className="rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/5 p-4 sm:p-6">
              <h3 className="text-sm font-black text-[#FFD700] tracking-widest uppercase">Delivery Helper — copy/paste ready</h3>
              <div className="mt-4 space-y-4">
                {awDelivery.sections.map(s=> (
                  <div key={s.platform}>
                    <div className="text-xs font-black tracking-widest uppercase text-white/60">{s.platform} — {s.count} posts</div>
                    <div className="mt-2 space-y-2">
                      {s.items.slice(0,4).map((it, idx)=> (
                        <div key={idx} className="rounded-xl bg-[#0B0215] border border-white/10 p-3">
                          <div className="text-[11px] text-white/30">#{it.n} • Day {it.day} • {it.type}</div>
                          <div className="text-xs text-white/70 whitespace-pre-wrap mt-1 line-clamp-4">{it.content}</div>
                        </div>
                      ))}
                      {s.items.length>4 && <div className="text-xs text-white/25">+ {s.items.length-4} more</div>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-4">You deliver to real communities. No auto-post — you control quality.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <CreateCampaign onCreated={fetchAll} />
          {loading ? <p className="text-center text-white/30 py-8 text-sm">Loading campaigns…</p> : campaigns.length===0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="text-2xl">⬢</div>
              <p className="text-white font-bold mt-2">No campaigns yet</p>
              <p className="text-white/30 text-xs mt-1">Create one above — it lands in Supabase campaigns or in-memory. Or use One-Week Ad Engine → Generate plan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map(c=> <CampaignCard key={c.id} campaign={c} onAction={handleAction} />)}
            </div>
          )}

          <div id="auto-panel" className="mature-card rounded-[16px] p-5 sm:p-6">
            <h3 className="eyebrow text-white/40">Email Automation — schedule • pause • resume • tick</h3>
            <p className="text-xs text-white/30 mt-1">POST /api/automation/schedule • GET /api/automation/status • POST /pause|resume|tick</p>
            <form onSubmit={handleSchedule} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <select value={autoForm.campaignId} onChange={e=>setAutoForm({...autoForm,campaignId:e.target.value})} className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" required>
                <option value="">— Pick campaign —</option>
                {campaigns.map(c=> <option key={c.id} value={c.id}>{c.name} — {c.status}</option>)}
              </select>
              <input value={autoForm.perDay} onChange={e=>setAutoForm({...autoForm,perDay:e.target.value})} placeholder="Per day (10)" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
              <input value={autoForm.atHour} onChange={e=>setAutoForm({...autoForm,atHour:e.target.value})} placeholder="At hour (9)" type="number" min="0" max="23" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
              <input value={autoForm.leads} onChange={e=>setAutoForm({...autoForm,leads:e.target.value})} placeholder="Leads emails, comma" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 lg:col-span-2" />
              <input value={autoForm.template} onChange={e=>setAutoForm({...autoForm,template:e.target.value})} placeholder="Template (optional)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 lg:col-span-4" />
              <button type="submit" className="bg-[#FFD700] text-[#0B0215] rounded-xl font-black text-xs tracking-widest uppercase py-2.5 lg:col-span-2">Schedule daily</button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={()=> fetchQueue()} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">Status</button>
              <button onClick={()=> handlePauseResume('pause')} className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/20 text-amber-400 text-xs font-bold">Pause</button>
              <button onClick={()=> handlePauseResume('resume')} className="px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold">Resume</button>
              <button onClick={handleTick} className="px-4 py-2 rounded-full bg-white text-[#0B0215] text-xs font-black">Tick — send batch</button>
            </div>
            {autoMsg && <p className="text-xs mt-3 text-white/60 whitespace-pre-wrap">{autoMsg}</p>}
            {queue && (<pre className="mt-3 bg-[#0B0215] border border-white/10 rounded-xl p-3 text-xs text-white/60 overflow-auto max-h-40">{JSON.stringify(queue, null, 2)}</pre>)}
          </div>
        </>
      )}
    </div>
  );
};

export default Campaigns;
