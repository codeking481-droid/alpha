import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SavedCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total:0, new:0, contacted:0, replied:0, hot:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      let q = `/api/companies/my-companies?limit=20&offset=${(page-1)*20}`;
      if (statusFilter) q += `&status=${statusFilter}`;
      if (nicheFilter) q += `&niche=${encodeURIComponent(nicheFilter)}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(q, { headers: { Authorization: token ? 'Bearer '+token : '', 'Content-Type':'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error); else { setItems(data.companies || []); setStats(data.stats || { total:0, new:0, contacted:0, replied:0, hot:0 }); }
    } catch (e) { setError('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); else setLoading(false); }, [user, page, statusFilter, nicheFilter, search]);

  if (loading && items.length === 0) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[960px] mx-auto text-center text-[#6B7280]">Loading vault...</div></div>;
  if (error) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[960px] mx-auto text-red-600">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-black tracking-tight">Vault</h1>
          <button onClick={() => navigate('/find-companies')} className="bg-[#0A0A0A] text-white rounded-xl px-5 py-2.5 text-sm font-black">Search →</button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            {label:'Total',v:stats.total,color:'bg-[#5E17EB]'},
            {label:'New',v:stats.new,color:'bg-[#EDE8FF]'},
            {label:'Contacted',v:stats.contacted,color:'bg-blue-50'},
            {label:'Replied',v:stats.replied,color:'bg-amber-50'},
            {label:'Hot',v:stats.hot,color:'bg-emerald-50'},
          ].map(s=>
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-[#EDEDED]`}><div className="text-[11px] font-bold text-[#6B7280]">{s.label}</div><div className="text-2xl font-black">{s.v}</div></div>
          )}
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name/domain..." className="rounded-xl border px-3 py-2 text-sm w-64" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm"><option value="">All Status</option><option>new</option><option>contacted</option><option>replied</option><option>hot</option><option>closed_won</option></select>
          <select value={nicheFilter} onChange={e=>setNicheFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm"><option value="">All Niches</option><option>skincare</option><option>fitness</option><option>shopify</option><option>saas</option><option>real estate</option></select>
        </div>
        {items.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center"><h2 className="text-xl font-black mb-2">No companies saved yet</h2><p className="text-[#6B7280] mb-4">You haven't saved any real companies yet.</p><button onClick={()=>navigate('/find-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black">Search Companies →</button></div>
        ) : (
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b"><tr><th className="text-left px-4 py-3 font-black">Company</th><th className="text-left px-4 py-3 font-black">Domain</th><th className="text-left px-4 py-3 font-black">Owner</th><th className="text-left px-4 py-3 font-black">Email</th><th className="text-left px-4 py-3 font-black">Status</th><th className="text-left px-4 py-3 font-black">Saved</th></tr></thead>
              <tbody>
                {items.map(i=>
                  <tr key={i.id} className="border-b hover:bg-[#FAFAFA]"><td className="px-4 py-3 font-bold">{i.company_name||i.name||'—'}</td><td className="px-4 py-3 text-[#6B7280]">{i.domain||'—'}</td><td className="px-4 py-3">{i.owner_name||'—'}</td><td className="px-4 py-3"><span className="text-emerald-600 font-bold">✓ Hunter</span> {i.owner_email||'—'}</td><td className="px-4 py-3"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${i.status==='hot'?'bg-amber-50 text-amber-700':i.status==='contacted'?'bg-blue-50 text-blue-700':i.status==='replied'?'bg-yellow-50 text-yellow-700':'bg-[#F0EFFF] text-[#5E17EB]'}`}>{i.status||'new'}</span></td><td className="px-4 py-3 text-[#6B7280]">{i.saved_at ? new Date(i.saved_at).toLocaleDateString() : '—'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex gap-2 mt-4 justify-center">
          {page>1&&<button onClick={()=>setPage(p=>p-1)} className="rounded-xl border px-3 py-1 text-sm">Prev</button>}
          <span className="text-sm font-bold">Page {page}</span>
          <button onClick={()=>setPage(p=>p+1)} className="rounded-xl border px-3 py-1 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
};
