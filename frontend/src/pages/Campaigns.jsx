import { useState, useEffect } from 'react';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { CreateCampaign } from '../components/campaigns/CreateCampaign';
import { API_URL } from '../lib/api.js';

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  // automation quick form
  const [autoForm, setAutoForm] = useState({ campaignId:'', perDay:'10', atHour:'9', leads:'', template:'' });
  const [autoMsg, setAutoMsg] = useState('');
  const [queue, setQueue] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns`);
      const data = await res.json().catch(()=>[]);
      setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
    } catch { setCampaigns([]); }
    finally { setLoading(false); }
  };

  const fetchQueue = async (cid) => {
    const q = cid || autoForm.campaignId;
    if (!q) { setQueue(null); return; }
    const res = await fetch(`${API_URL}/api/automation/status?campaignId=${encodeURIComponent(q)}`);
    const data = await res.json().catch(()=>({}));
    setQueue(data.status || data.queues || data);
  };

  useEffect(()=>{ fetchAll(); }, []);

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
    // if empty, use demo leads
    const finalLeads = leads.length ? leads : [{email:'demo1@example.com'},{email:'demo2@example.com'},{email:'demo3@example.com'}];
    try {
      const res = await fetch(`${API_URL}/api/automation/schedule`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
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
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ campaignId: autoForm.campaignId }),
    });
    const data = await res.json().catch(()=>({}));
    setAutoMsg(data.success ? `✅ ${type}d` : `❌ ${data.error}`);
    fetchQueue();
  };

  const handleTick = async () => {
    if (!autoForm.campaignId) return;
    const res = await fetch(`${API_URL}/api/automation/tick`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ campaignId: autoForm.campaignId, perDay: Number(autoForm.perDay)||10 }),
    });
    const data = await res.json().catch(()=>({}));
    setAutoMsg(data.success ? `✅ Sent ${data.sent?.length||0}, remaining ${data.remaining}` : `❌ ${data.error}`);
    fetchQueue();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#0B0215] flex items-center justify-center font-black">⬢</div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">CAMPAIGNS — Run & Track</h1>
          <p className="text-xs text-white/40">Draft → Active → Paused → Completed • Niche + city + budget • Automation daily 10 at 9AM</p>
        </div>
        <button onClick={fetchAll} className="ml-auto text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
      </div>

      <CreateCampaign onCreated={fetchAll} />
      {msg && <p className="text-xs text-white/60">{msg}</p>}

      {loading ? <p className="text-center text-white/30 py-8 text-sm">Loading campaigns…</p> : campaigns.length===0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-2xl">⬢</div>
          <p className="text-white font-bold mt-2">No campaigns yet</p>
          <p className="text-white/30 text-xs mt-1">Create one above — it lands in Supabase campaigns or in-memory. Then schedule automation below.</p>
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
        {queue && (
          <pre className="mt-3 bg-[#0B0215] border border-white/10 rounded-xl p-3 text-xs text-white/60 overflow-auto max-h-40">{JSON.stringify(queue, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
