import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const API = import.meta.env.VITE_API_URL;
const timeAgo = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 border border-[#E0E0E0] rounded-full px-3 py-1.5 text-[13px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA] active:scale-95 transition-all shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

/* ─── Confetti overlay ─── */
function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="text-5xl sm:text-7xl font-black animate-bounce drop-shadow-lg">Closed $500! 💰</div>
    </div>
  );
}

/* ─── Followup Card ─── */
function FollowupCard({ reply, getToken, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(reply.followup_message || '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const bannedWords = ['call', 'zoom', 'meet', 'loom', 'screen recording', 'video call'];
  const hasBanned = bannedWords.some(b => message.toLowerCase().includes(b));

  const generateFollowup = async () => {
    setGenerating(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/replies/${reply.id}/generate-followup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ companyId: reply.company_id })
      });
      const data = await res.json();
      if (data.followupMessage) { setMessage(data.followupMessage); onRefresh(); }
    } catch {}
    setGenerating(false);
  };

  const approveAndSend = async () => {
    setSending(true); setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/replies/${reply.id}/approve-send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ editedMessage: message })
      });
      const data = await res.json();
      if (data.success) onRefresh(); else setError(data.error || 'Send failed');
    } catch { setError('Send error'); }
    setSending(false);
  };

  const rejectFollowup = async () => {
    try {
      const token = getToken();
      await fetch(`${API}/api/replies/${reply.id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include' });
      onRefresh();
    } catch {}
  };

  // No followup yet
  if (!reply.followup_message && reply.followup_status !== 'sent' && reply.followup_status !== 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button onClick={generateFollowup} disabled={generating} className="bg-[#0A0A0A] text-white rounded-xl px-4 py-2.5 text-sm font-black active:scale-95 transition-all disabled:opacity-50">
          {generating ? 'Generating...' : '✨ Generate Follow-up'}
        </button>
      </div>
    );
  }

  // Sent
  if (reply.followup_status === 'sent') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-emerald-800">✅ Sent {reply.followup_sent_at ? timeAgo(reply.followup_sent_at) : ''}</span>
            <button onClick={() => navigator.clipboard.writeText(reply.followup_message || '')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 active:scale-95">Copy</button>
          </div>
          <div className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed">{reply.followup_message}</div>
        </div>
      </div>
    );
  }

  // Rejected
  if (reply.followup_status === 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-black text-red-800">❌ Rejected</span>
          <button onClick={generateFollowup} className="text-xs font-bold text-red-600 underline active:scale-95">Regenerate</button>
        </div>
      </div>
    );
  }

  // Pending approval
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-amber-900">Pending Approval — Telegram alert sent</span>
        </div>
        <div className="text-[11px] text-amber-700 mb-2">Edit below. No call / no screen recording.</div>
        {editing ? (
          <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full text-xs border border-amber-300 rounded-lg p-2 mb-2 bg-white focus:ring-2 focus:ring-amber-400 outline-none resize-none" rows={4} />
        ) : (
          <div className="text-xs text-amber-900 bg-white/70 rounded-lg p-2 mb-2 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">{message}</div>
        )}
        {hasBanned && <div className="text-[11px] text-red-600 font-bold mb-2">⚠️ Contains banned words — will be rejected</div>}
        {error && <div className="text-[11px] text-red-600 font-bold mb-2">{error}</div>}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(!editing)} className="border rounded-lg px-3 py-1.5 text-[11px] font-black active:scale-95">{editing ? 'Preview' : 'Edit'}</button>
          <button onClick={approveAndSend} disabled={sending || hasBanned} className="bg-[#0A0A0A] text-white rounded-lg px-3 py-1.5 text-[11px] font-black disabled:opacity-50 active:scale-95">{sending ? 'Sending...' : 'Approve & Send'}</button>
          <button onClick={rejectFollowup} className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-[11px] font-black active:scale-95">Reject</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export const Inbox = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [searchParams] = useSearchParams();
  const replyIdParam = searchParams.get('replyId');
  const companyIdParam = searchParams.get('companyId');
  const [replies, setReplies] = useState([]);
  const [stats, setStats] = useState({ hot: 0, replied: 0, closed_won: 0, revenue: 0, pending_approval: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/replies/my-replies`, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error); else {
        setReplies(data.replies || []);
        setStats({ hot: data.hot || 0, replied: data.replied || 0, closed_won: data.closed_won || 0, revenue: data.revenue || 0, pending_approval: (data.replies || []).filter(r => r.followup_status === 'pending_approval').length });
      }
    } catch (e) { setError('Failed to load inbox'); }
    setLoading(false);
  }, [user, getToken]);

  useEffect(() => { if (user) fetchData(); else setLoading(false); }, [user, fetchData]);
  useEffect(() => { if (replyIdParam) { const el = document.getElementById(replyIdParam); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [replyIdParam, replies]);

  const markHot = async (companyId) => {
    try { const t = getToken(); await fetch(`${API}/api/companies/${companyId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: t ? 'Bearer ' + t : '' }, credentials: 'include', body: JSON.stringify({ status: 'hot' }) }); fetchData(); } catch {}
  };
  const markClosedWon = async (companyId) => {
    try {
      const t = getToken();
      const res = await fetch(`${API}/api/companies/${companyId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: t ? 'Bearer ' + t : '' }, credentials: 'include', body: JSON.stringify({ status: 'closed_won' }) });
      const d = await res.json();
      if (d.success || d.company) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); fetchData(); }
    } catch {}
  };
  const generateContent = async (companyId, companyName) => {
    try {
      const t = getToken();
      const res = await fetch(`${API}/api/content/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t ? 'Bearer ' + t : '' }, credentials: 'include', body: JSON.stringify({ companyId, type: 'post' }) });
      const d = await res.json();
      if (d.content) alert(`Content for ${companyName}:\n\n${d.content.slice(0, 500)}`);
    } catch { alert('Generation failed'); }
  };

  const filtered = replies.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.followup_status === 'pending_approval';
    if (filter === 'sent') return r.followup_status === 'sent';
    if (filter === 'interested') return r.sentiment === 'interested' || r.sentiment === 'positive';
    if (filter === 'questions') return r.sentiment === 'question';
    if (companyIdParam) return String(r.company_id) === String(companyIdParam);
    return true;
  });

  /* Loading */
  if (loading && replies.length === 0) return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-6"><BackBtn onClick={() => navigate('/dashboard')} /><h1 className="text-xl font-black">Inbox</h1></div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <Confetti show={showConfetti} />
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => navigate('/dashboard')} />
            <h1 className="text-2xl font-black tracking-tight">Inbox</h1>
          </div>
          <button onClick={() => navigate('/saved-companies')} className="bg-[#0A0A0A] text-white rounded-xl px-4 py-2 text-sm font-black active:scale-95 transition-all">Vault →</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
          {[
            { label: 'Pending ⏳', v: stats.pending_approval, bg: 'bg-amber-50', tc: 'text-amber-700' },
            { label: 'Hot 🔥', v: stats.hot, bg: 'bg-orange-50', tc: 'text-orange-700' },
            { label: 'Sent', v: stats.replied, bg: 'bg-blue-50', tc: 'text-blue-700' },
            { label: 'Won', v: stats.closed_won, bg: 'bg-purple-50', tc: 'text-purple-700' },
            { label: 'Revenue', v: `$${stats.revenue}`, bg: 'bg-emerald-50', tc: 'text-emerald-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-[#EDEDED]/60`}>
              <div className={`text-[10px] font-bold ${s.tc} opacity-70`}>{s.label}</div>
              <div className={`text-xl font-black ${s.tc}`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'sent', label: 'Sent' },
            { key: 'interested', label: 'YES' },
            { key: 'questions', label: 'Questions' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full px-3.5 py-1.5 text-xs font-black whitespace-nowrap transition-all active:scale-95 ${filter === f.key ? 'bg-[#0A0A0A] text-white' : 'border bg-white text-[#6B7280]'}`}>{f.label}</button>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && !loading ? (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#FFF6E5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
            </div>
            <h2 className="text-lg font-black mb-1">No replies yet</h2>
            <p className="text-[#6B7280] text-sm mb-4">Send emails from vault — when brands reply YES you'll see hot leads here + Telegram 113 alert</p>
            <button onClick={() => navigate('/saved-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black text-sm active:scale-95 transition-all">Go to Vault →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const companyName = r.company?.company_name || r.company?.name || r.company_name || 'Company';
              const ownerEmail = r.company?.owner_email || r.from_email || '—';
              const replyText = r.reply_text || r.body || r.content || r.text || '';
              const isHot = r.sentiment === 'interested' || r.sentiment === 'positive';
              const isQ = r.sentiment === 'question';
              const isHL = replyIdParam === String(r.id) || companyIdParam === String(r.company_id);
              return (
                <div key={r.id} id={r.id} className={`rounded-2xl p-4 border transition-all ${isHL ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/30' : isHot ? 'border-emerald-200 bg-emerald-50/20' : isQ ? 'border-amber-200 bg-amber-50/10' : 'border-[#EDEDED] bg-white'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black truncate">{companyName}</h3>
                      <p className="text-xs text-[#6B7280] truncate">{ownerEmail} • {r.received_at ? timeAgo(r.received_at) : 'recently'}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${isHot ? 'bg-amber-100 text-amber-800' : isQ ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                      {r.sentiment === 'interested' ? 'YES 🔥' : r.sentiment === 'positive' ? 'Positive 🔥' : r.sentiment === 'question' ? 'Question' : r.sentiment || 'Reply'}
                    </span>
                  </div>
                  <div className="bg-white/70 rounded-xl p-2.5 text-xs text-[#4B5563] mb-1 whitespace-pre-wrap leading-relaxed">{replyText}</div>
                  <FollowupCard reply={r} getToken={getToken} onRefresh={fetchData} />
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                    {r.company_id && (
                      <>
                        <button onClick={() => markHot(r.company_id)} className="bg-amber-500 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">🔥 Hot</button>
                        <button onClick={() => generateContent(r.company_id, companyName)} className="bg-[#5E17EB] text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">Content</button>
                        <button onClick={() => markClosedWon(r.company_id)} className="bg-purple-600 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">Won $500</button>
                      </>
                    )}
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
