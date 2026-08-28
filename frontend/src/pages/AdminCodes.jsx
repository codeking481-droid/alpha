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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8" style={{background:'#FFFCF8', minHeight:'60vh'}}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black" style={{background:'#5E17EB', color:'#FFFFFF'}}>⌘</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{color:'#0A0A0A'}}>Admin — Access Codes</h1>
          <p className="text-xs" style={{color:'#6B7280'}}>alphatekxcompany@gmail.com only • Free generation, price 0</p>
        </div>
        <button onClick={generate} disabled={loading} className="ml-auto px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase disabled:opacity-50" style={{background:'#5E17EB', color:'#FFFFFF'}}>
          {loading ? '...' : '+ Generate free code'}
        </button>
      </div>

      {msg && <p className="mt-4 text-xs leading-5 whitespace-pre-wrap" style={{color: msg.startsWith('✅') ? '#0A7A00' : '#C00000', background: msg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', border:'1px solid #EDEDED', borderRadius:'10px', padding:'10px 12px'}}>{msg}</p>}

      <div className="mt-6 card rounded-2xl p-5" style={{background:'#FFFFFF', border:'1px solid #EDEDED'}}>
        <div style={{color:'#6B7280', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase'}}>Codes ({codes.length}) — single-use, 30d expiry</div>
        <div className="mt-3 grid gap-2 max-h-[60vh] overflow-y-auto">
          {codes.length===0 ? <p className="text-sm text-center py-8" style={{color:'#9CA3AF'}}>No codes yet — generate one.</p> : codes.map(c=>(
            <div key={c.id} className="rounded-xl p-3 flex items-center gap-3 text-sm" style={{background:'#FFFCF8', border:'1px solid #EDEDED'}}>
              <span className="font-bold tracking-[0.15em]" style={{color:'#0A0A0A'}}>{c.code}</span>
              <span className="text-xs px-2 py-1 rounded-full font-bold" style={c.used ? {background:'rgba(239,68,68,0.08)', color:'#DC2626', border:'1px solid rgba(239,68,68,0.2)'} : {background:'rgba(16,185,129,0.08)', color:'#059669', border:'1px solid rgba(16,185,129,0.2)'}}>{c.used?'USED':'UNUSED'}</span>
              <span className="text-xs" style={{color:'#9CA3AF'}}>${c.price ?? 0}</span>
              <span className="text-xs ml-auto" style={{color:'#9CA3AF'}}>{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
              <button onClick={()=> navigator.clipboard.writeText(c.code)} className="text-xs px-2 py-1 rounded-full" style={{background:'#F9FAFB', border:'1px solid #EDEDED', color:'#6B7280'}}>Copy</button>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-center" style={{color:'#9CA3AF'}}>Payment codes ($50) are auto-generated via Paystack verify; admin codes are free (price 0).</p>
    </div>
  );
};

export default AdminCodes;
