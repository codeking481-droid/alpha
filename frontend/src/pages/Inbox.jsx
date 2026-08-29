import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="text-6xl font-black animate-bounce">Closed $500! 💰</div>
    </div>
  );
}

function FollowupCard({ reply, user, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(reply.followup_message || '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const bannedWords = ['call', 'zoom', 'meet', 'loom', 'screen recording', 'video call'];
  const lowerMsg = message.toLowerCase();
  const hasBanned = bannedWords.some(b => lowerMsg.includes(b));

  const generateFollowup = async () => {
    setGenerating(true);
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch(`/api/replies/${reply.id}/generate-followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' },
        credentials: 'include',
        body: JSON.stringify({ companyId: reply.company_id })
      });
      const data = await res.json();
      if (data.followupMessage) {
        setMessage(data.followupMessage);
        onRefresh();
      }
    } catch {}
    setGenerating(false);
  };

  const approveAndSend = async () => {
    setSending(true); setError('');
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch(`/api/replies/${reply.id}/approve-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' },
        credentials: 'include',
        body: JSON.stringify({ editedMessage: message })
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
      } else {
        setError(data.error || 'Send failed');
      }
    } catch { setError('Send error'); }
    setSending(false);
  };

  const rejectFollowup = async () => {
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      await fetch(`/api/replies/${reply.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' },
        credentials: 'include'
      });
      onRefresh();
    } catch {}
  };

  if (!reply.followup_message && reply.followup_status !== 'sent' && reply.followup_status !== 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button onClick={generateFollowup} disabled={generating} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-2 text-sm font-black">
          {generating ? 'Generating...' : 'Generate Follow-up'}
        </button>
      </div>
    );
  }

  if (reply.followup_status === 'sent') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-800">✅ Follow-up Sent {reply.followup_resend_id ? `• ${reply.followup_resend_id.slice(0, 12)}` : ''} {reply.followup_sent_at ? `• ${timeAgo(reply.followup_sent_at)}` : ''}</span>
            <button onClick={() => navigator.clipboard.writeText(reply.followup_message || '')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">Copy</button>
          </div>
          <div className="text-sm text-emerald-900 whitespace-pre-wrap">{reply.followup_message}</div>
        </div>
      </div>
    );
  }

  if (reply.followup_status === 'rejected') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <span className="text-xs font-black text-red-800">❌ Follow-up Rejected</span>
          <button onClick={generateFollowup} className="ml-3 text-xs font-bold text-red-600 hover:text-red-800 underline">Generate New</button>
        </div>
      </div>
    );
  }

  // pending_approval
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
        <div className="font-black text-amber-900 mb-1">⏳ Pending Approval — Telegram alert sent</div>
        <div className="text-xs text-amber-800 mb-2">Edit before sending. No call / no screen recording.</div>
        {editing ? (
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full text-sm border border-amber-300 rounded-lg p-2 mb-2 bg-white"
            rows={5}
          />
        ) : (
          <div className="text-sm text-amber-900 bg-white/70 rounded-lg p-2 mb-2 whitespace-pre-wrap">{message}</div>
        )}
        {hasBanned && (
          <div className="text-xs text-red-600 font-bold mb-2">⚠️ Contains banned words (call, zoom, meet, loom, screen recording, video call) — will be rejected</div>
        )}
        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="border rounded-lg px-3 py-1.5 text-xs font-black">{editing ? 'Preview' : 'Edit'}</button>
          <button onClick={approveAndSend} disabled={sending || hasBanned} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-1.5 text-xs font-black disabled:opacity-50">
            {sending ? 'Sending via Resend...' : 'Approve & Send via Resend'}
          </button>
          <button onClick={rejectFollowup} className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-xs font-black">Reject</button>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const Inbox = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch('/api/replies/my-replies', {
        headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.error) setError(data.error); else {
        setReplies(data.replies || []);
        setStats({
          hot: data.hot || 0,
          replied: data.replied || 0,
          closed_won: data.closed_won || 0,
          revenue: data.revenue || 0,
          pending_approval: (data.replies || []).filter(r => r.followup_status === 'pending_approval').length
        });
      }
    } catch (e) { setError('Failed to load inbox'); }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) fetchData(); else setLoading(false); }, [user, fetchData]);

  // Auto-scroll to reply when URL has replyId
  useEffect(() => {
    if (replyIdParam) {
      const el = document.getElementById(replyIdParam);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
  }, [replyIdParam, replies]);

  const markHot = async (companyId) => {
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      await fetch(`/api/companies/${companyId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ status: 'hot' })
      });
      fetchData();
    } catch {}
  };

  const markClosedWon = async (companyId) => {
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch(`/api/companies/${companyId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ status: 'closed_won' })
      });
      const data = await res.json();
      if (data.success || data.company) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        fetchData();
      }
    } catch {}
  };

  const generateContent = async (companyId, companyName) => {
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      const res = await fetch('/api/content/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ companyId, type: 'post' })
      });
      const data = await res.json();
      if (data.content) alert(`Generated content for ${companyName}:\n\n${data.content.slice(0, 500)}`);
    } catch { alert('Content generation failed'); }
  };

  const filteredReplies = replies.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.followup_status === 'pending_approval';
    if (filter === 'sent') return r.followup_status === 'sent';
    if (filter === 'interested') return r.sentiment === 'interested' || r.sentiment === 'positive';
    if (filter === 'questions') return r.sentiment === 'question';
    if (companyIdParam) return r.company_id === companyIdParam || String(r.company_id) === String(companyIdParam);
    return true;
  });

  if (loading && replies.length === 0) return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="h-8 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (error) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[1100px] mx-auto text-red-600">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <Confetti show={showConfetti} />
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-black tracking-tight">Inbox — Hot Leads</h1>
          <button onClick={() => navigate('/saved-companies')} className="bg-[#0A0A0A] text-white rounded-xl px-5 py-2.5 text-sm font-black">Vault →</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Pending Approval ⏳', v: stats.pending_approval, color: 'bg-amber-50' },
            { label: 'Hot Leads 🔥', v: stats.hot, color: 'bg-orange-50' },
            { label: 'Sent', v: stats.replied, color: 'bg-blue-50' },
            { label: 'Closed Won', v: stats.closed_won, color: 'bg-purple-50' },
            { label: 'Revenue', v: `$${stats.revenue}`, color: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-[#EDEDED]`}>
              <div className="text-[11px] font-bold text-[#6B7280]">{s.label}</div>
              <div className="text-2xl font-black">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending Approval' },
            { key: 'sent', label: 'Sent' },
            { key: 'interested', label: 'Interested YES' },
            { key: 'questions', label: 'Questions' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full px-4 py-1.5 text-xs font-black ${filter === f.key ? 'bg-[#0A0A0A] text-white' : 'border border-[#EDEDED] text-[#6B7280]'}`}>{f.label}</button>
          ))}
        </div>

        {/* Empty state */}
        {filteredReplies.length === 0 && !loading ? (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-10 text-center">
            <h2 className="text-xl font-black mb-2">No replies yet</h2>
            <p className="text-[#6B7280] mb-4">Send emails from vault — when brands reply YES you'll see hot leads here + Telegram 113 alert</p>
            <button onClick={() => navigate('/saved-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black">Go to Vault →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReplies.map((r) => {
              const companyName = r.company?.company_name || r.company?.name || r.company_name || 'Company';
              const ownerEmail = r.company?.owner_email || r.from_email || '—';
              const replyText = r.reply_text || r.body || r.content || r.text || '';
              const isHot = r.sentiment === 'interested' || r.sentiment === 'positive';
              const isQuestion = r.sentiment === 'question';
              const isHighlighted = replyIdParam === String(r.id) || companyIdParam === String(r.company_id);

              return (
                <div
                  key={r.id}
                  id={r.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isHighlighted ? 'border-amber-400 ring-2 ring-amber-100 bg-amber-50/30' :
                    isHot ? 'border-emerald-200 bg-emerald-50/30' :
                    isQuestion ? 'border-amber-200 bg-amber-50/20' :
                    'border-[#EDEDED] bg-white'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-black">{companyName}</h3>
                      <p className="text-sm text-[#6B7280]">{ownerEmail} • Received {r.received_at ? timeAgo(r.received_at) : 'recently'}</p>
                    </div>
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${
                      isHot ? 'bg-amber-100 text-amber-800' :
                      isQuestion ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {r.sentiment === 'interested' ? 'Interested — YES 🔥' : r.sentiment === 'positive' ? 'Positive 🔥' : r.sentiment === 'question' ? 'Question' : r.sentiment || 'Reply'}
                    </span>
                  </div>

                  {/* Reply text */}
                  <div className="bg-white/70 rounded-xl p-3 text-sm text-[#4B5563] mb-1 whitespace-pre-wrap">{replyText}</div>

                  {/* Follow-up section */}
                  <FollowupCard reply={r} user={user} onRefresh={fetchData} />

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    {r.company_id && (
                      <>
                        <button onClick={() => markHot(r.company_id)} className="bg-amber-500 text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Mark Hot</button>
                        <button onClick={() => generateContent(r.company_id, companyName)} className="bg-[#5E17EB] text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Generate Content →</button>
                        <button onClick={() => markClosedWon(r.company_id)} className="bg-purple-600 text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Mark Closed Won ($500)</button>
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
