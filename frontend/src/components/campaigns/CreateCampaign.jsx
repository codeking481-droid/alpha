import { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api.js';

export const CreateCampaign = ({ onCreated }) => {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name:'', client_id:'', niche:'', target_city:'', budget:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(()=>{
    fetch(`${API_URL}/api/clients`).then(r=>r.json()).then(d=> setClients(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if (!form.name) { setMsg('Name required'); return; }
    setSaving(true); setMsg('');
    try {
      const token = localStorage.getItem('alpha.token') || '';
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ ...form, budget: Number(form.budget)||0 }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg(`✅ Created ${data.name || form.name}`);
      setForm({ name:'', client_id:'', niche:'', target_city:'', budget:'' });
      onCreated?.(data);
    } catch (err){ setMsg(`❌ ${err.message}`); }
    finally { setSaving(false); }
  };

  return (
    <div className="mature-card rounded-[16px] p-5 sm:p-6">
      <h3 className="eyebrow text-white/40">Create campaign</h3>
      <p className="text-xs text-white/30 mt-1">Client + niche + city + budget → status draft → start/pause/complete.</p>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name (e.g. Q4 Lagos Hotels)" required className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <select value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})} className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
          <option value="">— Client (optional) —</option>
          {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})} placeholder="Niche (e.g. hotel, restaurant)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <input value={form.target_city} onChange={e=>setForm({...form,target_city:e.target.value})} placeholder="City (e.g. Port Harcourt)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <input value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="Budget (e.g. 2000)" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <button type="submit" disabled={saving} className="bg-white text-[#0B0215] rounded-xl font-black text-xs tracking-widest uppercase py-2.5 hover:bg-white/90 disabled:opacity-50">{saving?'Creating…':'+ Create campaign'}</button>
      </form>
      {msg && <p className="text-xs mt-3 text-white/60 whitespace-pre-wrap">{msg}</p>}
    </div>
  );
};

export default CreateCampaign;
