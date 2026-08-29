import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [stats, setStats] = useState({ hot:0, replied:0, closed_won:0, revenue:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch('/api/replies/my-replies', { headers: { Authorization: token ? 'Bearer '+token : '', 'Content-Type':'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error); else { setReplies(data.replies || []); setStats({ hot: data.hot || 0, replied: data.replied || 0, closed_won: data.closed_won || 0, revenue: data.revenue || 0 }); }
    } catch (e) { setError('Failed to load inbox'); }
    setLoading(false);
  };
  useEffect(() => { if (user) fetchData(); else setLoading(false); }, [user]);

  if (loading && replies.length === 0) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[1100px] mx-auto text-center text-[#6B7280]">Loading hot leads...</div></div>;
  if (error) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[1100px] mx-auto text-red-600">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-black tracking-tight">Hot Leads</h1>
          <button onClick={() => navigate('/saved-companies')} className="bg-[#0A0A0A] text-white rounded-xl px-5 py-2.5 text-sm font-black">Vault →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {label:'Hot Leads 🔥',v:stats.hot,color:'bg-amber-50'},
            {label:'Replied',v:stats.replied,color:'bg-blue-50'},
            {label:'Closed Won',v:stats.closed_won,color:'bg-purple-50'},
            {label:'Revenue',v:`$${stats.revenue}`,color:'bg-emerald-50'},
          ].map(s=>
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-[#EDEDED]}`}><div className="text-[11px] font-bold text-[#6B7280]">{s.label}</div><div className="text-2xl font-black">{s.v}</div></div>
          )}
        </div>
        {replies.length === 0 ? (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-10 text-center"><h2 className="text-xl font-black mb-2">No replies yet</h2><p className="text-[#6B7280]">Send emails from vault. When brands reply YES you'll see hot leads here + Telegram 113 alert.</p></div>
        ) : (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-6 space-y-4">
            {replies.map((r,i) => (
              <div key={i} className={`rounded-2xl p-5 border ${r.sentiment==='interested'?'bg-amber-50 border-amber-200':'bg-white border-[#EDEDED]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div><h3 className="text-lg font-black">{r.company?.company_name||r.company_name||'Company'}</h3><p className="text-sm text-[#6B7280]">{r.owner_email||r.email||'—'} • {r.sentiment||'unknown'}</p></div>
                  <span className={`text-xs font-black px-2 py-1 rounded-full ${r.sentiment==='interested'?'bg-amber-100 text-amber-800':r.sentiment==='positive'?'bg-emerald-100 text-emerald-800':'bg-gray-100 text-gray-600'}`}>{r.sentiment||'reply'}</span>
                </div>
                <div className="bg-white/70 rounded-xl p-3 text-sm text-[#4B5563] mb-3">{r.content||r.reply_text||r.text||'Reply text'}</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/saved-companies`)} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-2 text-sm font-black">Generate Content →</button>
                  <button onClick={() => navigate(`/saved-companies`)} className="border rounded-lg px-4 py-2 text-sm font-black">Mark Hot</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
