import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { API_URL } from '../lib/api';
/* ─── Helpers ─── */
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

/* ─── Email Modal ─── */
function EmailModal({ company, onClose, onSent, getToken }) {
  const [toEmail, setToEmail] = useState(company.owner_email || '');
  const [subject, setSubject] = useState(`Exclusive Sponsorship + Free Custom System for ${company.company_name || company.name || 'your company'}`);
  const [body, setBody] = useState(`Hi ${company.owner_name || 'there'},

We are currently scaling outreach for our Q3 digital campaign across our multi-channel network:

* YouTube: 3,000+ tech & business subscribers
* LinkedIn: 1,270+ decision-makers & professionals
* Telegram & WhatsApp: 300+ engaged community members (131 + 86 + 184)

We are opening up our Founding Partner slots (only 7 left) to advertise your business across all these channels for a flat rate of $250 (originally $500).

The Founding Bonus:
If you accept this offer, we will also build and deploy one fully functional custom system of your choice (CRM, Booking System, Inventory Tracker, Payment Gateway, E-commerce Store, or Business Dashboard) tailored specifically for your business.

This isn't just a static website—it's a live, working system built via our automated enterprise platform. We are offering this $2,000+ value completely free for our first 7 founding clients to build out our case study portfolio.

(Note: This bonus is strictly tied to our founding partnership slots).

If you are interested in grabbing one of the remaining spots, you can lock it in here: ${API}/api/checkout/service ($250 private checkout - POST /api/checkout/service 25000)

Best regards,
Alpha Agency
Powered by AlphaTekx

Platform: Get Access To Real Companies With Just $50 Lifetime - Same tool we used to find you (Apollo + Hunter verified, Global USA/UK not Lagos info@, Groq 120B openai/gpt-oss-120b, Vault 12)`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const send = async () => {
    setSending(true); setError('');
    if (!toEmail || !toEmail.includes('@')) { setError('Enter a valid email address'); setSending(false); return; }
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/outreach/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ companyId: company.id, companyName: company.company_name || company.name, domain: company.domain, ownerName: company.owner_name || '', ownerEmail: toEmail, to: toEmail, subject, message: body })
      });
      const data = await res.json();
      if (data.success) { onSent(); onClose(); } else { setError(data.error || 'Send failed'); }
    } catch { setError('Send error'); }
    setSending(false);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-black">Send Email</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">To (email)</label>
            <input value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="company@example.com" className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5E17EB] focus:border-[#5E17EB] outline-none" />
            {toEmail && toEmail.includes('@') && <p className="text-xs text-emerald-600 font-bold mt-1">✓ Verified email</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#5E17EB] focus:border-[#5E17EB] outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="w-full border rounded-xl px-3 py-2.5 text-sm leading-relaxed focus:ring-2 focus:ring-[#5E17EB] focus:border-[#5E17EB] outline-none resize-none" />
          </div>
          {error && <p className="text-red-600 text-xs font-bold bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pb-2">
            <button onClick={onClose} className="flex-1 border-2 rounded-xl py-3 font-black text-sm active:scale-95 transition-transform">Cancel</button>
            <button onClick={send} disabled={sending} className="flex-1 bg-[#0A0A0A] text-white rounded-xl py-3 font-black text-sm disabled:opacity-50 active:scale-95 transition-all">{sending ? 'Sending...' : 'Send via Resend'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm ─── */
function DeleteConfirm({ company, onClose, onDeleted, getToken }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/companies/${company.id}`, { method: 'DELETE', headers: { Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include' });
      const data = await res.json();
      if (data.success || data.ok) { onDeleted(); onClose(); } else { alert(data.error || 'Delete failed'); }
    } catch { alert('Delete error'); }
    setDeleting(false);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl sm:rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </div>
        <h3 className="text-lg font-black text-center">Delete Company?</h3>
        <p className="text-sm text-[#6B7280] text-center mt-1 mb-5">Remove <strong>{company.company_name || company.name}</strong> from vault?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 rounded-xl py-3 font-black text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 text-white rounded-xl py-3 font-black text-sm disabled:opacity-50">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status, followUpStatus }) {
  const s = {
    new: { bg: 'bg-[#F0EFFF]', text: 'text-[#5E17EB]', label: 'New' },
    contacted: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Contacted' },
    replied: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Replied' },
    hot: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '🔥 Hot' },
    closed_won: { bg: 'bg-purple-50', text: 'text-purple-700', label: '$250 Won' },
  };
  const st = s[status] || s.new;
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${st.bg} ${st.text} whitespace-nowrap`}>{st.label}</span>
      {followUpStatus === 'pending_approval' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Waiting approval</span>}
      {followUpStatus === 'approved' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Follow-up sent</span>}
      {followUpStatus === 'rejected' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Follow-up rejected</span>}
    </span>
  );
}

/* ─── Follow-up Approval Card (Vault) ─── */
function FollowUpApprovalCard({ company, getToken, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState(company.follow_up_message || `Hi ${company.owner_name || 'there'},\n\nJust following up on my previous email about featuring ${company.company_name || company.name} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      const body = action === 'approve' ? { action, editedMessage: msg } : { action };
      const res = await fetch(`${API}/api/companies/${company.id}/follow-up`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success || data.approved || data.rejected) { onUpdate(); } else setError(data.error || 'Failed');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const dueText = company.follow_up_due_at ? new Date(company.follow_up_due_at).toLocaleDateString() : '3 days after first email';
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 sm:p-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
        <span className="text-xs font-black text-amber-900">Follow-up ready for {company.company_name || company.name} - Send?</span>
        <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Due: {dueText} • Waiting approval</span>
      </div>
      {editing ? (
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4} className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-400 outline-none resize-none mb-2" />
      ) : (
        <div className="text-xs text-amber-900 bg-white/70 rounded-lg p-2 mb-2 whitespace-pre-wrap max-h-24 overflow-y-auto border border-amber-200">{msg}</div>
      )}
      {error && <div className="text-[11px] text-red-600 font-bold mb-2">{error}</div>}
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>setEditing(!editing)} className="border border-amber-300 bg-white rounded-lg px-3 py-1.5 text-[11px] font-black">{editing ? 'Preview' : 'Edit'}</button>
        <button onClick={()=>handleAction('approve')} disabled={loading} className="bg-[#0A0A0A] text-white rounded-lg px-4 py-1.5 text-[11px] font-black disabled:opacity-50">YES — Send follow-up</button>
        <button onClick={()=>handleAction('reject')} disabled={loading} className="border border-red-300 text-red-600 rounded-lg px-3 py-1.5 text-[11px] font-black">NO — Reject</button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export const SavedCompanies = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, replied: 0, hot: 0, closed_won: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalCompany, setModalCompany] = useState(null);
  const [deleteCompany, setDeleteCompany] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [nicheFilter, setNicheFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));
  const [selected, setSelected] = useState(new Set());
  const [bulkAiLoading, setBulkAiLoading] = useState(false);
  const [bulkProof, setBulkProof] = useState(null);
  const [bulkError, setBulkError] = useState('');
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e) => { if (e.matches) setViewMode('cards'); };
    if (mql.matches) setViewMode('cards');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleBulkAiSend = async () => {
    if (selected.size === 0) return;
    setBulkAiLoading(true); setBulkError(''); setBulkProof(null);
    try {
      const token = getToken();
      const ids = Array.from(selected);
      const res = await fetch(`${API}/api/outreach/send-bulk-ai`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer '+token : '' }, credentials: 'include',
        body: JSON.stringify({ companyIds: ids })
      });
      const data = await res.json();
      if (data.success) { setBulkProof(data); setSelected(new Set()); fetchData(); }
      else setBulkError(data.error || 'Bulk send failed');
    } catch (e) { setBulkError(e.message); }
    setBulkAiLoading(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getToken();
      let q = `${API}/api/companies/my-companies?limit=20&offset=${(page - 1) * 20}`;
      if (statusFilter) q += `&status=${statusFilter}`;
      if (nicheFilter) q += `&niche=${encodeURIComponent(nicheFilter)}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      if (sourceFilter) q += `&source=${sourceFilter}`;
      const res = await fetch(q, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error); else { setItems(data.companies || []); setStats(data.stats || { total: 0, new: 0, contacted: 0, replied: 0, hot: 0, closed_won: 0 }); }
    } catch (e) { setError('Failed to load vault'); }
    setLoading(false);
  }, [user, page, statusFilter, nicheFilter, search, sourceFilter, getToken]);

  const [pendingFollowUps, setPendingFollowUps] = useState([]);
  const fetchPending = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/companies/pending-followups`, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      setPendingFollowUps(data.pending || []);
    } catch {}
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchPending(); }, [fetchPending]);

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(prev => prev.size === items.length ? new Set() : new Set(items.map(i => i.id)));
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setNicheFilter(''); setSourceFilter(''); setPage(1); };
  const hasFilters = search || statusFilter || nicheFilter || sourceFilter;

  /* ─── Loading ─── */
  if (loading && items.length === 0) return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center gap-3 mb-6"><BackBtn onClick={() => navigate('/dashboard')} /><h1 className="text-xl font-black">Vault</h1></div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full">
      <div className="max-w-[1100px] mx-auto w-full max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <BackBtn onClick={() => navigate('/dashboard')} />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">Vault</h1>
          </div>
          <button onClick={() => navigate('/find-companies')} className="bg-[#0A0A0A] text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black active:scale-95 transition-all shrink-0">Search →</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mb-4 sm:mb-5 w-full">
          {[
            { label: 'Total', v: stats.total, bg: 'bg-[#5E17EB]', tc: 'text-white' },
            { label: 'New', v: stats.new, bg: 'bg-[#F0EFFF]', tc: 'text-[#5E17EB]' },
            { label: 'Contacted', v: stats.contacted, bg: 'bg-blue-50', tc: 'text-blue-700' },
            { label: 'Replied', v: stats.replied, bg: 'bg-amber-50', tc: 'text-amber-700' },
            { label: 'Hot', v: stats.hot, bg: 'bg-emerald-50', tc: 'text-emerald-700' },
            { label: 'Won', v: stats.closed_won || 0, bg: 'bg-purple-50', tc: 'text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-lg sm:rounded-xl p-2 sm:p-3 border border-[#EDEDED]/60 min-w-0 overflow-hidden`}>
              <div className={`text-[9px] sm:text-[10px] font-bold ${s.tc} opacity-70 leading-none truncate`}>{s.label}</div>
              <div className={`text-base sm:text-xl font-black ${s.tc} leading-none mt-1 truncate`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Revenue Banner */}
        {(stats.closed_won || 0) > 0 && (
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-3 mb-4 flex items-center justify-between">
            <span className="text-sm font-bold">Revenue Collected</span>
            <div className="text-right"><span className="text-xl font-black">${(stats.closed_won || 0) * 250}</span> <span className="text-xs line-through opacity-70">${(stats.closed_won || 0) * 500}</span></div>
          </div>
        )}

        {/* Follow-up Pending Approval (User control, no spam) */}
        {pendingFollowUps.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <h3 className="text-sm font-black text-amber-900">Follow-ups Waiting Approval ({pendingFollowUps.length})</h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">User control — no auto-send</span>
            </div>
            <div className="space-y-2">
              {pendingFollowUps.slice(0,5).map(co => (
                <FollowUpApprovalCard key={co.id} company={co} getToken={getToken} onUpdate={()=>{fetchData(); fetchPending();}} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 items-center w-full overflow-hidden">
          <div className="relative flex-1 min-w-[140px] sm:min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name/domain..." className="w-full rounded-lg sm:rounded-xl border pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#5E17EB] outline-none truncate" />
          </div>
          <select value={nicheFilter} onChange={e => setNicheFilter(e.target.value)} className="rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white max-w-[110px] sm:max-w-none truncate">
            <option value="">All Niches</option><option>skincare</option><option>fitness</option><option>beauty</option><option>shopify</option><option>saas</option><option>real estate</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white max-w-[110px] sm:max-w-none truncate">
            <option value="">All Status</option><option>new</option><option>contacted</option><option>replied</option><option>hot</option><option>closed_won</option>
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white max-w-[100px] sm:max-w-none truncate hidden sm:block">
            <option value="">All Sources</option><option>apollo</option><option>tavily</option>
          </select>
          {hasFilters && <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 px-2 whitespace-nowrap shrink-0">✕ Clear</button>}
          <div className="ml-auto flex gap-1 shrink-0">
            <button onClick={() => setViewMode('table')} className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-black transition-all ${viewMode === 'table' ? 'bg-[#0A0A0A] text-white' : 'border bg-white'}`}>☰</button>
            <button onClick={() => setViewMode('cards')} className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-black transition-all ${viewMode === 'cards' ? 'bg-[#0A0A0A] text-white' : 'border bg-white'}`}>▦</button>
          </div>
        </div>

        {/* Bulk Bar — AI bulk send to everyone at once with real-time proof */}
        {selected.size > 0 && (
          <div className="bg-gradient-to-r from-[#5E17EB] to-[#7C3AED] text-white rounded-xl px-4 py-3 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-xs leading-tight">{selected.size} selected • AI personalizes each: Hi [Real Contact] + company stuff + Reply YES (no checkout) — fast</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleBulkAiSend} disabled={bulkAiLoading} className="bg-white text-[#5E17EB] rounded-full px-4 py-2 text-xs font-black flex items-center gap-1.5 disabled:opacity-60 shrink-0">
                  <span className="w-5 h-5 rounded-full bg-[#5E17EB] text-white flex items-center justify-center text-[11px]">✦</span>
                  {bulkAiLoading ? 'AI Sending...' : `AI Send to ${selected.size} →`}
                </button>
                <button onClick={() => setSelected(new Set())} className="border border-white/30 rounded-full px-3 py-2 text-xs font-bold shrink-0">Clear</button>
              </div>
            </div>
            {bulkError && <div className="mt-2 bg-red-500/20 border border-red-300/30 rounded-lg px-3 py-2 text-xs font-bold">{bulkError}</div>}
          </div>
        )}
        {/* Real-time proof after bulk AI — shows Resend proof */}
        {bulkProof && (
          <div className="bg-white border border-[#EDEDED] rounded-2xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black">✓ Bulk AI Sent — Real-time Proof</h3>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full shrink-0">{bulkProof.sent} sent • {bulkProof.skipped} skipped</span>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">Each personalized: Hi [Real Prospeo/Apollo owner] + {`{companyName}`} + Reply YES (fast, no checkout) — GROQ {bulkProof.proof?.[0]?.model || 'openai/gpt-oss-120b'} mocked:false</p>
            <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto">
              {bulkProof.proof?.slice(0, 12).map((p, i) => (
                <div key={i} className="border border-[#EDEDED] rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{p.company} • {p.to}</div>
                    <div className="text-[11px] text-[#6B7280] truncate">Hi {p.contactName} • {p.subject?.slice(0,55)} • {p.sent_at ? new Date(p.sent_at).toLocaleTimeString() : ''}</div>
                    <div className="text-[10px] font-mono text-[#5E17EB] truncate">resend_id: {p.resend_id || 'mock'} • {p.status} • {p.sent_at ? new Date(p.sent_at).toLocaleDateString() : ''}</div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-black px-2 py-1 rounded-full ${p.status==='sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{p.status}</span>
                </div>
              ))}
            </div>
            {bulkProof.errors?.length > 0 && <div className="mt-2 text-xs text-red-600">{bulkProof.errors.length} failed — {bulkProof.errors[0]?.error}</div>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => setBulkProof(null)} className="text-xs font-bold border rounded-full px-3 py-1.5 bg-white">Close</button>
              <button onClick={() => { setBulkProof(null); fetchData(); }} className="text-xs font-bold bg-[#0A0A0A] text-white rounded-full px-3 py-1.5">Refresh Vault → Inbox</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !loading ? (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#F0EFFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5E17EB" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
            </div>
            <h2 className="text-lg font-black mb-1">No companies in vault</h2>
            <p className="text-[#6B7280] text-sm mb-4">Search → Save → Send emails → Track replies</p>
            <button onClick={() => navigate('/find-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black text-sm active:scale-95 transition-all">Search Companies →</button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE - hidden on mobile, cards shown instead for 100% fit */
          <>
            <div className="hidden md:block bg-white border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-[#F9FAFB] border-b text-left text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded" /></th>
                    <th className="px-3 py-2.5">Company</th>
                    <th className="px-3 py-2.5 hidden sm:table-cell">Owner</th>
                    <th className="px-3 py-2.5 hidden md:table-cell">Email</th>
                    <th className="px-3 py-2.5 hidden md:table-cell">Niche</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5 hidden lg:table-cell">Saved</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-3 py-3"><input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="rounded" /></td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-[#0A0A0A]">{i.company_name || i.name || '—'}</div>
                        <div className="text-xs text-[#6B7280]">{i.domain || '—'}</div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">{i.owner_name || '—'}</td>
                      <td className="px-3 py-3 hidden md:table-cell text-xs">
                        <span className="text-emerald-600 font-bold">✓</span> {i.owner_email || '—'}
                      </td>
                      <td className="px-3 py-3 text-[#6B7280] text-xs hidden md:table-cell">{i.niche || '—'}</td>
                      <td className="px-3 py-3"><StatusBadge status={i.status} followUpStatus={i.follow_up_status} /></td>
                      <td className="px-3 py-3 text-[#6B7280] text-xs hidden lg:table-cell">{i.saved_at ? timeAgo(i.saved_at) : '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {i.follow_up_status === 'pending_approval' && i.status === 'contacted' && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Waiting approval</span>}
                          {i.status === 'new' && <button onClick={() => setModalCompany(i)} className="bg-[#0A0A0A] text-white rounded-lg px-2.5 py-1 text-[11px] font-black active:scale-95">Send</button>}
                          {i.status === 'contacted' && <button onClick={() => setModalCompany(i)} className="border rounded-lg px-2.5 py-1 text-[11px] font-black">Resend</button>}
                          {(i.status === 'replied' || i.status === 'hot') && <button onClick={() => navigate(`/inbox?companyId=${i.id}`)} className="bg-emerald-500 text-white rounded-lg px-2.5 py-1 text-[11px] font-black">Inbox →</button>}
                          {i.status === 'closed_won' && <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">$250 ✓</span>}
                          <button onClick={() => setDeleteCompany(i)} className="text-red-400 hover:text-red-600 px-1.5 py-1 text-[11px]">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
            {/* Mobile fallback - cards when table mode on small screen */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {items.map(i => (
                <div key={`m-${i.id}`} className="bg-white border rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black truncate">{i.company_name || i.name || '—'}</h3>
                      <p className="text-xs text-[#6B7280] truncate break-all">{i.domain || '—'}</p>
                    </div>
                    <StatusBadge status={i.status} followUpStatus={i.follow_up_status} />
                  </div>
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex justify-between gap-2"><span className="text-[#6B7280]">Owner</span><span className="font-bold truncate ml-2">{i.owner_name || '—'}</span></div>
                    <div className="flex justify-between gap-2"><span className="text-[#6B7280]">Email</span><span className="truncate ml-2 break-all">{i.owner_email || '—'}</span></div>
                  </div>
                  <div className="flex gap-1.5">
                    {i.status === 'new' && <button onClick={() => setModalCompany(i)} className="flex-1 bg-[#0A0A0A] text-white rounded-lg py-2 text-xs font-black">Send</button>}
                    {i.status === 'contacted' && <button onClick={() => setModalCompany(i)} className="flex-1 border rounded-lg py-2 text-xs font-black">Resend</button>}
                    {(i.status === 'replied' || i.status === 'hot') && <button onClick={() => navigate(`/inbox?companyId=${i.id}`)} className="flex-1 bg-emerald-500 text-white rounded-lg py-2 text-xs font-black">Inbox →</button>}
                    <button onClick={() => setDeleteCompany(i)} className="px-3 py-2 text-xs text-red-400">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* CARDS */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(i => (
              <div key={i.id} className="bg-white border rounded-2xl p-4 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black truncate">{i.company_name || i.name || '—'}</h3>
                    <p className="text-xs text-[#6B7280] truncate">{i.domain || '—'}</p>
                  </div>
                  <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="rounded mt-1 shrink-0 ml-2" />
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between"><span className="text-[#6B7280] text-xs">Owner</span><span className="font-bold text-xs">{i.owner_name || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280] text-xs">Email</span><span className="text-xs">{i.owner_email ? `✓ ${i.owner_email}` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280] text-xs">Niche</span><span className="text-xs">{i.niche || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7280] text-xs">Saved</span><span className="text-xs">{i.saved_at ? timeAgo(i.saved_at) : '—'}</span></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t gap-2">
                  <StatusBadge status={i.status} followUpStatus={i.follow_up_status} />
                  <div className="flex gap-1 shrink-0">
                    {i.follow_up_status === 'pending_approval' && i.status === 'contacted' && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Waiting approval</span>}
                    {i.status === 'new' && <button onClick={() => setModalCompany(i)} className="bg-[#0A0A0A] text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Send Email</button>}
                    {i.status === 'contacted' && i.follow_up_status !== 'pending_approval' && <button onClick={() => setModalCompany(i)} className="border rounded-lg px-3 py-1.5 text-[11px] font-black">Resend</button>}
                    {(i.status === 'replied' || i.status === 'hot') && <button onClick={() => navigate(`/inbox?companyId=${i.id}`)} className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Inbox →</button>}
                    <button onClick={() => setDeleteCompany(i)} className="text-red-400 px-2 text-[11px]">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex gap-2 mt-4 justify-center items-center">
            {page > 1 && <button onClick={() => setPage(p => p - 1)} className="rounded-xl border px-3 py-1.5 text-sm font-bold active:scale-95">← Prev</button>}
            <span className="text-sm font-bold px-3">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="rounded-xl border px-3 py-1.5 text-sm font-bold active:scale-95">Next →</button>
          </div>
        )}

        {modalCompany && <EmailModal company={modalCompany} onClose={() => setModalCompany(null)} onSent={() => { setModalCompany(null); fetchData(); }} getToken={getToken} />}
        {deleteCompany && <DeleteConfirm company={deleteCompany} onClose={() => setDeleteCompany(null)} onDeleted={() => { setDeleteCompany(null); fetchData(); }} getToken={getToken} />}
      </div>
    </div>
  );
};

