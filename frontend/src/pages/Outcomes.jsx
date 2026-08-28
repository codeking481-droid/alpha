import { useState, useEffect } from 'react';
import { RevenueChart } from '../components/outcomes/RevenueChart';
import { ROICalculator } from '../components/outcomes/ROICalculator';
import { API_URL } from '../lib/api.js';

export const Outcomes = () => {
  const [summary, setSummary] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ campaignId: '', revenue: '', cost: '', views: '', conversions: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, outcomesRes] = await Promise.all([
        fetch(`${API_URL}/api/outcomes/summary`),
        fetch(`${API_URL}/api/outcomes`)
      ]);
      const summaryData = await summaryRes.json().catch(() => ({}));
      const outcomesData = await outcomesRes.json().catch(() => ({}));
      if (summaryData.success) setSummary(summaryData.summary);
      else if (summaryData.totalRevenue !== undefined) setSummary(summaryData);
      if (outcomesData.success) setOutcomes(outcomesData.outcomes);
      else if (Array.isArray(outcomesData)) setOutcomes(outcomesData);
    } catch (error) {
      console.error('Failed to fetch outcome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.campaignId) { alert('Campaign ID required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/outcomes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: form.campaignId,
          revenue: Number(form.revenue) || 0,
          cost: Number(form.cost) || 0,
          views: Number(form.views) || 0,
          conversions: Number(form.conversions) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed');
      setForm({ campaignId: '', revenue: '', cost: '', views: '', conversions: '' });
      await fetchData();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-white/40">Loading outcomes...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#0B0215]">📊</div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">OUTCOMES</h2>
          <p className="text-xs text-white/40 tracking-widest uppercase font-semibold">Proof layer — revenue, ROI, performance. Real data only.</p>
        </div>
        <button onClick={fetchData} className="ml-auto text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass p-6 text-center">
            <p className="text-white/40 text-xs tracking-widest uppercase font-bold">Total Revenue</p>
            <p className="text-3xl font-black text-[#FFD700] mt-2">${Number(summary.totalRevenue||0).toLocaleString()}</p>
          </div>
          <div className="glass p-6 text-center">
            <p className="text-white/40 text-xs tracking-widest uppercase font-bold">ROI</p>
            <p className={`text-3xl font-black mt-2 ${(summary.averageROI||0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {Number(summary.averageROI||0).toFixed(1)}%
            </p>
          </div>
          <div className="glass p-6 text-center">
            <p className="text-white/40 text-xs tracking-widest uppercase font-bold">Views</p>
            <p className="text-3xl font-black text-white mt-2">{Number(summary.totalViews||0).toLocaleString()}</p>
          </div>
          <div className="glass p-6 text-center">
            <p className="text-white/40 text-xs tracking-widest uppercase font-bold">Conversions</p>
            <p className="text-3xl font-black text-white mt-2">{Number(summary.totalConversions||0).toLocaleString()}</p>
            <p className="text-xs text-white/20 mt-1">{summary.campaigns||0} campaigns</p>
          </div>
        </div>
      )}

      <div className="glass p-6">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Add Outcome</h3>
        <p className="text-xs text-white/30 mt-1">Campaign ID + revenue/cost → auto ROI. Uses <code className="text-white/50">/api/outcomes</code></p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input value={form.campaignId} onChange={e=>setForm({...form,campaignId:e.target.value})} placeholder="Campaign ID (e.g. cmp_123)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.revenue} onChange={e=>setForm({...form,revenue:e.target.value})} placeholder="Revenue (e.g. 5000)" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} placeholder="Cost (e.g. 1200)" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.views} onChange={e=>setForm({...form,views:e.target.value})} placeholder="Views" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
          <input value={form.conversions} onChange={e=>setForm({...form,conversions:e.target.value})} placeholder="Conversions" type="number" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
        </div>
        <button onClick={handleSave} disabled={saving} className="mt-3 px-6 py-2.5 rounded-xl bg-[#FFD700] text-[#0B0215] font-black text-xs tracking-widest uppercase disabled:opacity-50">{saving ? 'Saving...' : 'Save Outcome'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart outcomes={outcomes} />
        <ROICalculator outcomes={outcomes} />
      </div>

      {outcomes.length > 0 && (
        <div className="glass p-6">
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/60">Recent Outcomes</h3>
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {outcomes.slice(0,10).map(o=>(
              <div key={o.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-3 text-sm">
                <span className="text-white/60 truncate flex-1">{o.campaign_id || o.campaignId} — ${Number(o.revenue||0).toLocaleString()} / ${Number(o.cost||0).toLocaleString()} → {(Number(o.roi)||0).toFixed(1)}% ROI</span>
                <span className="text-xs text-white/30">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Outcomes;
