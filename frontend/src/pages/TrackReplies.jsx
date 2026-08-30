import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

const timeAgo = (d) => { const m = Math.floor((Date.now() - new Date(d))/60000); if (m<1) return 'just now'; if (m<60) return `${m}m ago`; const h=Math.floor(m/60); if (h<24) return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };

export const TrackReplies = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [replies, setReplies] = useState([]);
  const [stats, setStats] = useState({ total:0, positive:0, question:0, negative:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);

  const fetchReplies = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      let data = null;
      try {
        const r = await fetch(`${API_URL}/api/replies/my-replies`, { headers: { Authorization: token ? `Bearer ${token}`: '' }, credentials: 'include' });
        data = await r.json();
      } catch {}
      if (!data || !Array.isArray(data.replies) || data.replies.length===0) {
        const r2 = await fetch(`${API_URL}/api/replies`, { headers: { Authorization: token ? `Bearer ${token}`: '' }, credentials: 'include' });
        const d2 = await r2.json();
        if (Array.isArray(d2.replies) && d2.replies.length>0) data = d2;
      }
      const arr = (data && data.replies) || [];
      setReplies(arr);
      const pos = arr.filter(x=> x.sentiment==='positive' || x.sentiment==='interested').length;
      const q = arr.filter(x=> x.sentiment==='question').length;
      const neg = arr.filter(x=> x.sentiment==='negative').length;
      setStats({ total: arr.length, positive: pos, question: q, negative: neg });
      if (data && data.error) setError(data.error);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [getToken]);

  useEffect(()=>{ fetchReplies(); }, [fetchReplies]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = getToken();
      await fetch(`${API_URL}/api/replies/sync`, { method:'POST', headers:{ Authorization: token ? `Bearer ${token}`: '' }, credentials:'include' });
      await fetchReplies();
    } catch (e) { setError(e.message); }
    setSyncing(false);
  };

  const filtered = replies.filter(r=>{
    if (filter==='all') return true;
    if (filter==='positive') return r.sentiment==='positive' || r.sentiment==='interested';
    if (filter==='question') return r.sentiment==='question';
    if (filter==='negative') return r.sentiment==='negative';
    if (filter==='pending') return r.followup_status==='pending_approval';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif]">
      <div className="max-w-[760px] mx-auto">
        <div className="bg-white border border-[#EDEDED] rounded-2xl px-3 py-3 flex items-center justify-between shadow-sm mb-6">
          <button onClick={()=>navigate('/dashboard')} className="inline-flex items-center gap-1.5 border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[13px] font-medium bg-white hover:bg-[#F9FAFB]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>
          <div className="text-center"><h1 className="text-[16px] font-black leading-none">Track Replies</h1><p className="text-[11px] text-[#6B7280]">Engagement • Sentiment • Follow-ups</p></div>
          <button onClick={handleSync} disabled={syncing} className="text-[12px] font-bold border rounded-full px-3 py-1.5 bg-white hover:bg-[#F9FAFB] disabled:opacity-50">{syncing?'Syncing...':'Sync Gmail'}</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-black">Replies</h2>
          <button onClick={()=>navigate('/inbox')} className="text-[12px] font-bold bg-[#0A0A0A] text-white rounded-full px-3 py-1.5">Inbox →</button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {k:'Total',v:stats.total,bg:'bg-white',tc:'text-[#0A0A0A]'},
            {k:'Positive',v:stats.positive,bg:'bg-emerald-50',tc:'text-emerald-700'},
            {k:'Questions',v:stats.question,bg:'bg-blue-50',tc:'text-blue-700'},
            {k:'Negative',v:stats.negative,bg:'bg-red-50',tc:'text-red-600'},
          ].map(s=>(
            <div key={s.k} className={`${s.bg} border border-[#EDEDED] rounded-xl p-3 text-center`}>
              <div className={`text-[11px] font-bold ${s.tc} opacity-70`}>{s.k}</div>
              <div className={`text-[18px] font-black ${s.tc}`}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {[
            {k:'all',l:'All'},
            {k:'positive',l:'YES 🔥'},
            {k:'question',l:'Questions'},
            {k:'pending',l:'Pending'},
            {k:'negative',l:'Negative'},
          ].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${filter===f.k ? 'bg-[#0A0A0A] text-white':'border bg-white text-[#6B7280]'}`}>{f.l}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-[13px] mb-4">{error} <button onClick={fetchReplies} className="ml-2 font-bold underline">Retry</button></div>}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=> <div key={i} className="h-24 bg-white border border-[#EDEDED] rounded-2xl animate-pulse"/> )}</div>
        ) : filtered.length===0 ? (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-[#F0EFFF] rounded-xl flex items-center justify-center mx-auto mb-3 text-[#5E17EB]">✉️</div>
            <h3 className="text-[15px] font-black">No replies yet</h3>
            <p className="text-[13px] text-[#6B7280] mt-1">Send from Vault → prospects reply → appears here + Telegram 🔥 + Inbox.</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={()=>navigate('/saved-companies')} className="bg-[#5E17EB] text-white rounded-full px-5 py-2 text-[13px] font-bold">Vault</button>
              <button onClick={handleSync} className="border rounded-full px-5 py-2 text-[13px] font-bold bg-white">Sync Gmail</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r=>{
              const from = r.from_email || r.from || r.sender || 'Unknown';
              const company = r.company?.company_name || r.company_name || from.split('@')[1]?.split('.')[0] || 'Company';
              const content = r.body || r.content || r.reply_text || r.text || '';
              const isPos = r.sentiment==='positive' || r.sentiment==='interested';
              const isQ = r.sentiment==='question';
              return (
                <div key={r.id} className={`bg-white border rounded-2xl p-4 ${isPos ? 'border-emerald-200 bg-emerald-50/20' : isQ ? 'border-blue-200' : 'border-[#EDEDED]'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-bold truncate">{company}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isPos ? 'bg-emerald-100 text-emerald-700' : isQ ? 'bg-blue-100 text-blue-700' : r.sentiment==='negative' ? 'bg-red-100 text-red-600':'bg-gray-100 text-gray-600'}`}>{r.sentiment || 'reply'}</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] truncate">{from} • {r.received_at ? timeAgo(r.received_at) : 'recently'}</p>
                    </div>
                    {r.followup_status==='pending_approval' && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full shrink-0">Pending</span>}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[#0A0A0A] line-clamp-3 whitespace-pre-wrap">{content || '—'}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>navigate(`/inbox?replyId=${r.id}`)} className="text-[11px] font-bold border rounded-full px-3 py-1 bg-white hover:bg-[#F9FAFB]">Open in Inbox →</button>
                    {r.company_id && <button onClick={()=>navigate(`/inbox?companyId=${r.company_id}`)} className="text-[11px] font-bold bg-[#0A0A0A] text-white rounded-full px-3 py-1">Company</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

