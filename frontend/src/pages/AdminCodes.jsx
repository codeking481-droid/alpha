import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api.js';

export const AdminCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('alpha.token') || '' : '';

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok && data.success) setCodes(data.codes || []);
      else setMsg(data.error || 'Fetch failed — are you admin?');
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/api/admin/generate-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(()=>({}));
      if (res.ok && data.success) {
        setMsg(`✅ Generated: ${data.code.code} (free, admin)`);
        fetchCodes();
      } else setMsg('❌ ' + (data.error || 'Failed'));
    } catch (e) { setMsg('❌ ' + e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchCodes(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#0B0215] flex items-center justify-center font-black">⌘</div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Admin — Access Codes</h1>
          <p className="text-xs text-white/40">alphatekxcompany@gmail.com only • Free generation, price 0</p>
        </div>
        <button onClick={generate} disabled={loading} className="ml-auto bg-white text-[#0B0215] px-5 py-2.5 rounded-full font-black text-xs tracking-widest uppercase hover:bg-white/90 disabled:opacity-50">
          {loading ? '...' : '+ Generate free code'}
        </button>
      </div>

      {msg && <p className="mt-4 text-xs leading-5 text-white/70 whitespace-pre-wrap">{msg}</p>}

      <div className="mt-6 mature-card rounded-2xl p-5">
        <div className="eyebrow text-white/30">Codes ({codes.length}) — single-use, 30d expiry</div>
        <div className="mt-3 grid gap-2 max-h-[60vh] overflow-y-auto">
          {codes.length===0 ? <p className="text-sm text-white/30 text-center py-8">No codes yet — generate one.</p> : codes.map(c=>(
            <div key={c.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-3 flex items-center gap-3 text-sm">
              <span className="font-black tracking-[0.2em] text-white">{c.code}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.used?'bg-red-500/15 text-red-400 border border-red-500/20':'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}>{c.used?'USED':'UNUSED'}</span>
              <span className="text-xs text-white/20">${c.price ?? 0}</span>
              <span className="text-xs text-white/20 ml-auto">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
              <button onClick={()=> navigator.clipboard.writeText(c.code)} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Copy</button>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-white/20 text-center">Payment codes ($50) are auto-generated via Paystack verify; admin codes are free (price 0).</p>
    </div>
  );
};

export default AdminCodes;
