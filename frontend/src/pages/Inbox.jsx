import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

const API = API_URL;
const timeAgo = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 border border-[#E0E0E0] rounded-full px-3 py-1.5 text-[13px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA] active:scale-95 transition-all shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="text-5xl sm:text-7xl font-black animate-bounce drop-shadow-lg">Closed $250! 💰</div>
    </div>
  );
}

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
  if (!reply.followup_message && reply.followup_status !== 'sent' && reply.followup_status !== 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button onClick={generateFollowup} disabled={generating} className="bg-[#0A0A0A] text-white rounded-xl px-4 py-2.5 text-sm font-black active:scale-95 transition-all disabled:opacity-50">
          {generating ? 'Generating...' : '✨ Generate Follow-up'}
        </button>
      </div>
    );
  }
  if (reply.followup_status === 'sent') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black text-emerald-800">✅ Sent {reply.followup_sent_at ? timeAgo(reply.followup_sent_at) : ''}</span>
            <button onClick={() => navigator.clipboard.writeText(reply.followup_message || '')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">Copy</button>
          </div>
          <div className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed">{reply.followup_message}</div>
        </div>
      </div>
    );
  }
  if (reply.followup_status === 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-black text-red-800">❌ Rejected</span>
          <button onClick={generateFollowup} className="text-xs font-bold text-red-600 underline">Regenerate</button>
        </div>
      </div>
    );
  }
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
          <button onClick={() => setEditing(!editing)} className="border rounded-lg px-3 py-1.5 text-[11px] font-black">{editing ? 'Preview' : 'Edit'}</button>
          <button onClick={approveAndSend} disabled={sending || hasBanned} className="bg-[#0A0A0A] text-white rounded-lg px-3 py-1.5 text-[11px] font-black disabled:opacity-50">{sending ? 'Sending...' : 'Approve & Send'}</button>
          <button onClick={rejectFollowup} className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-[11px] font-black">Reject</button>
        </div>
      </div>
    </div>
  );
}

function PendingCompanyCard({ company, getToken, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(company.follow_up_message || `Hi ${company.owner_name || 'there'},\n\nJust following up on my previous email about featuring ${company.company_name || company.name} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = async (action) => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      const body = action === 'approve' ? { action, editedMessage: msg } : { action };
      const res = await fetch(`${API}/api/companies/${company.id}/follow-up`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success || data.approved || data.rejected) onUpdate(); else setError(data.error || 'Failed');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        <span className="text-xs font-black text-amber-900">Follow-up ready for {company.company_name || company.name} — Send?</span>
        <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">Waiting approval</span>
      </div>
      {editing ? <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4} className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-400 outline-none resize-none mb-2" /> : <div className="text-xs text-amber-900 bg-white/70 rounded-lg p-2 mb-2 whitespace-pre-wrap max-h-24 overflow-y-auto border border-amber-200">{msg}</div>}
      {error && <div className="text-[11px] text-red-600 font-bold mb-2">{error}</div>}
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>setEditing(!editing)} className="border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-[11px] font-black">{editing ? 'Preview' : 'Edit'}</button>
        <button onClick={()=>handle('approve')} disabled={loading} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-1.5 text-[11px] font-black disabled:opacity-50">YES — Approve & Send</button>
        <button onClick={()=>handle('reject')} disabled={loading} className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-[11px] font-black">NO — Reject</button>
      </div>
    </div>
  );
}

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
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const fetchPendingFollowUps = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/companies/pending-followups`, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      setPendingCompanies(data.pending || []);
      // merge pending count into stats
      setStats(prev => ({ ...prev, pending_approval: (data.pending || []).length }));
    } catch { setPendingCompanies([]); }
  }, [getToken]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      let data = null;
      try {
        const res = await fetch(`${API}/api/replies/my-replies`, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
        const txt = await res.text();
        data = txt ? JSON.parse(txt) : {};
        if (!res.ok && data.error) throw new Error(data.error);
      } catch (e) { console.warn('my-replies failed', e.message); }
      if (!data || !data.replies || data.replies.length === 0) {
        try {
          const res2 = await fetch(`${API}/api/replies`, { headers: { Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include' });
          const txt2 = await res2.text();
          const data2 = txt2 ? JSON.parse(txt2) : {};
          if (data2 && data2.replies && data2.replies.length > 0) {
            data = { replies: data2.replies, hot: 0, replied: data2.count || data2.replies.length, closed_won: 0, revenue: 0 };
          }
        } catch {}
      }
      if (data && data.error) setError(data.error);
      else if (data && Array.isArray(data.replies)) {
        setReplies(data.replies || []);
        const pendingFromReplies = (data.replies || []).filter(r => r.followup_status === 'pending_approval').length;
        setStats(prev => ({
          hot: data.hot ?? data.hot_count ?? prev.hot,
          replied: data.replied ?? prev.replied,
          closed_won: data.closed_won ?? prev.closed_won,
          revenue: data.revenue ?? prev.revenue,
          pending_approval: pendingFromReplies || prev.pending_approval
        }));
        // Also try to enrich stats from companies endpoint
        try {
          const cRes = await fetch(`${API}/api/companies/my-companies?limit=100`, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
          const cData = await cRes.json();
          if (cData && cData.stats) {
            setStats(prev => ({
              hot: cData.stats.hot || prev.hot,
              replied: cData.stats.replied || prev.replied,
              closed_won: cData.stats.closed_won || prev.closed_won,
              revenue: (cData.stats.closed_won || 0) * 250 || prev.revenue,
              pending_approval: prev.pending_approval
            }));
          }
        } catch {}
      } else {
        setReplies([]);
      }
    } catch (e) { setError(e.message || 'Failed to load inbox'); setReplies([]); }
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetchData(); fetchPendingFollowUps(); }, [fetchData, fetchPendingFollowUps]);
  useEffect(() => { if (replyIdParam) { const el = document.getElementById(replyIdParam); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [replyIdParam, replies]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/replies/sync`, { method: 'POST', headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.success || data.synced !== undefined) { await fetchData(); await fetchPendingFollowUps(); }
      else if (data.error) setError(data.error);
    } catch (e) { setError(e.message); }
    setSyncing(false);
  };

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
      const res = await fetch(`${API}/api/content/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t ? 'Bearer ' + t : '' }, credentials: 'include', body: JSON.stringify(companyId ? { companyId } : { topic: companyName || 'company update', format: 'post', company: companyName }) });
      const d = await res.json();
      const text = d.text || d.content || '';
      if (text) alert(`Content for ${companyName}:\n\n${text.slice(0, 600)}`);
      else alert(d.error || 'Generation returned no content');
    } catch { alert('Generation failed'); }
  };

  const filtered = replies.filter(r => {
    if (companyIdParam && String(r.company_id) !== String(companyIdParam)) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return r.followup_status === 'pending_approval';
    if (filter === 'sent') return r.followup_status === 'sent';
    if (filter === 'interested') return r.sentiment === 'interested' || r.sentiment === 'positive';
    if (filter === 'questions') return r.sentiment === 'question';
    return true;
  });

  if (loading && replies.length === 0 && pendingCompanies.length === 0) return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full">
      <div className="max-w-[1100px] mx-auto w-full">
        <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6"><BackBtn onClick={() => navigate('/dashboard')} /><h1 className="text-lg sm:text-xl font-black">Inbox</h1></div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-5 sm:mb-6">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full">
      <Confetti show={showConfetti} />
      <div className="max-w-[1100px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BackBtn onClick={() => navigate('/dashboard')} />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">Inbox</h1>
            <button onClick={handleSync} disabled={syncing} className="hidden sm:inline-flex items-center gap-1.5 border bg-white rounded-full px-3 py-1.5 text-[12px] font-bold hover:bg-[#F9FAFB] disabled:opacity-50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={syncing ? 'animate-spin' : ''}><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
              {syncing ? 'Syncing...' : 'Sync Gmail'}
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleSync} disabled={syncing} className="sm:hidden border bg-white rounded-full px-3 py-1.5 text-[11px] font-bold disabled:opacity-50">{syncing ? '...' : 'Sync'}</button>
            <button onClick={() => navigate('/saved-companies')} className="bg-[#0A0A0A] text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black active:scale-95 transition-all">Vault →</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-center justify-between gap-2">
            <span className="font-medium">{error}</span>
            <button onClick={() => { setError(''); fetchData(); fetchPendingFollowUps(); }} className="bg-white border border-red-200 rounded-full px-3 py-1 text-xs font-black shrink-0">Retry</button>
          </div>
        )}

        {/* Stats — always visible */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-4 sm:mb-5 w-full">
          {[
            { label: 'Pending ⏳', v: stats.pending_approval ?? pendingCompanies.length, bg: 'bg-amber-50', tc: 'text-amber-700' },
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

        {/* Pending Company Follow-ups — always show if any */}
        {pendingCompanies.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <h3 className="text-sm font-black text-amber-900">Follow-ups Waiting Approval ({pendingCompanies.length})</h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">No auto-send</span>
            </div>
            <div className="space-y-2">
              {pendingCompanies.slice(0,5).map(co => (
                <PendingCompanyCard key={co.id} company={co} getToken={getToken} onUpdate={()=>{fetchData(); fetchPendingFollowUps();}} />
              ))}
            </div>
          </div>
        )}

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
          {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-xs font-bold text-[#5E17EB] px-2">Clear</button>}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#FFF6E5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
            </div>
            <h2 className="text-lg font-black mb-1">{filter !== 'all' ? `No ${filter} replies` : 'No replies yet'}</h2>
            <p className="text-[#6B7280] text-sm mb-1">Send emails from Vault — when brands reply YES you'll see hot leads here + Telegram alert.</p>
            {pendingCompanies.length === 0 && replies.length === 0 && (
              <p className="text-[#9CA3AF] text-xs mb-4">Tip: Search companies → Save to Vault → Send → Track here</p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button onClick={() => navigate('/saved-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black text-sm active:scale-95">Go to Vault →</button>
              <button onClick={() => navigate('/my-ad-campaigns')} className="border rounded-xl px-6 py-3 font-black text-sm bg-white hover:bg-[#FAFAFA]">Search Companies →</button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#9CA3AF]">
              <button onClick={handleSync} className="underline font-bold">Sync Gmail</button>
              <span>•</span>
              <button onClick={fetchData} className="underline font-bold">Refresh</button>
            </div>
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
                  <div className="bg-white/70 rounded-xl p-2.5 text-xs text-[#4B5563] mb-1 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">{replyText || '— No content —'}</div>
                  <FollowupCard reply={r} getToken={getToken} onRefresh={fetchData} />
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
                    {r.company_id && (
                      <>
                        <button onClick={() => markHot(r.company_id)} className="bg-amber-500 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">🔥 Hot</button>
                        <button onClick={() => generateContent(r.company_id, companyName)} className="bg-[#5E17EB] text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">Content</button>
                        <button onClick={() => markClosedWon(r.company_id)} className="bg-purple-600 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-black active:scale-95">Won $250</button>
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

