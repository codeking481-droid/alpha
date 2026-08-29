import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function EmailModal({ company, onClose, onSent }) {
  const [subject, setSubject] = useState(`Quick idea for ${company.company_name || company.name || 'your company'} — 4,500+ audience feature?`);
  const [body, setBody] = useState(`Hey ${company.owner_name || 'there'},\n\nSaw ${company.company_name || company.name || 'your company'} — great work in ${company.niche || 'your space'}. We own 4,500+ audience (3K YouTube, 700 LinkedIn, 500 connections, 130 WhatsApp, 113 Telegram, 85 cyber) and reach out to brands done-for-you. Can we feature ${company.company_name || company.name || 'your company'} on our communities? Reply YES and we handle everything.\n\n— Alpha Agency OS`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    setSending(true); setError('');
    try {
      const token = localStorage.getItem('master_unlocked') || '';
      const res = await fetch('/api/outreach/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ companyId: company.id, companyName: company.company_name || company.name, domain: company.domain, ownerName: company.owner_name || '', ownerEmail: company.owner_email || '', niche: company.niche || '', product: company.product || '', to: company.owner_email || '', subject, message: body })
      });
      const data = await res.json();
      if (data.success) { onSent(); onClose(); } else { setError(data.error || 'Send failed'); }
    } catch { setError('Send error'); }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#EDEDED]">
        <h3 className="text-xl font-black mb-1">Send Email</h3>
        <p className="text-sm text-[#6B7280] mb-1">To: {company.owner_email || company.email || '—'} ({company.company_name || company.name || '—'})</p>
        <p className="text-xs text-emerald-600 font-bold mb-4">✓ Verified via Hunter</p>
        <label className="text-xs font-bold text-[#6B7280] block mb-1">Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded-xl px-3 py-2 mb-3 font-medium text-sm" />
        <label className="text-xs font-bold text-[#6B7280] block mb-1">Body</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm leading-relaxed" />
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 font-black text-sm">Cancel</button>
          <button onClick={send} disabled={sending} className="flex-1 bg-[#0A0A0A] text-white rounded-xl py-2.5 font-black text-sm">{sending ? 'Sending...' : 'Send via Resend'}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ company, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('master_unlocked') || '';
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'DELETE', headers: { Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include'
      });
      const data = await res.json();
      if (data.success || data.ok) { onDeleted(); onClose(); } else { alert(data.error || 'Delete failed'); }
    } catch { alert('Delete error'); }
    setDeleting(false);
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#EDEDED]">
        <h3 className="text-lg font-black mb-2">Delete Company?</h3>
        <p className="text-sm text-[#6B7280] mb-4">Remove <strong>{company.company_name || company.name}</strong> from your vault? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 font-black text-sm">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-black text-sm">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    new: 'bg-[#F0EFFF] text-[#5E17EB]',
    contacted: 'bg-blue-50 text-blue-700',
    replied: 'bg-yellow-50 text-yellow-700',
    hot: 'bg-emerald-50 text-emerald-700 animate-pulse',
    closed_won: 'bg-purple-50 text-purple-700',
  };
  const labels = {
    new: 'New',
    contacted: 'Contacted',
    replied: 'Replied',
    hot: 'HOT 🔥',
    closed_won: 'Closed Won $500',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${styles[status] || styles.new}`}>
      {labels[status] || status}
    </span>
  );
}

export const SavedCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [viewMode, setViewMode] = useState('table');
  const [selected, setSelected] = useState(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = user?.email ? btoa(JSON.stringify({ sub: user.email, email: user.email })) : '';
      let q = `/api/companies/my-companies?limit=20&offset=${(page - 1) * 20}`;
      if (statusFilter) q += `&status=${statusFilter}`;
      if (nicheFilter) q += `&niche=${encodeURIComponent(nicheFilter)}`;
      if (search) q += `&search=${encodeURIComponent(search)}`;
      if (sourceFilter) q += `&source=${sourceFilter}`;
      const res = await fetch(q, { headers: { Authorization: token ? 'Bearer ' + token : '', 'Content-Type': 'application/json' }, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error); else {
        setItems(data.companies || []);
        setStats(data.stats || { total: 0, new: 0, contacted: 0, replied: 0, hot: 0 });
      }
    } catch (e) { setError('Failed to load vault'); }
    setLoading(false);
  }, [user, page, statusFilter, nicheFilter, search, sourceFilter]);

  useEffect(() => { if (user) fetchData(); else setLoading(false); }, [user, fetchData]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) { setSelected(new Set()); } else { setSelected(new Set(items.map(i => i.id))); }
  };

  const handleBulkSave = async () => {
    const selectedItems = items.filter(i => selected.has(i.id));
    if (!selectedItems.length) return;
    try {
      const token = localStorage.getItem('master_unlocked') || '';
      await fetch('/api/companies/save-bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? 'Bearer ' + token : '' }, credentials: 'include',
        body: JSON.stringify({ companies: selectedItems.map(i => ({ companyName: i.company_name || i.name, domain: i.domain, ownerName: i.owner_name, ownerEmail: i.owner_email, niche: i.niche, product: i.product, source: i.source })) })
      });
      setSelected(new Set());
      fetchData();
    } catch {}
  };

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setNicheFilter(''); setSourceFilter(''); setPage(1); };

  const hasFilters = search || statusFilter || nicheFilter || sourceFilter;

  if (loading && items.length === 0) return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="bg-white border border-[#EDEDED] rounded-2xl p-10 text-center animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-4" />
          <div className="h-4 w-64 bg-gray-100 rounded mx-auto" />
        </div>
      </div>
    </div>
  );

  if (error) return <div className="min-h-screen bg-[#FFFCF8] px-4 py-10 font-['Inter',sans-serif]"><div className="max-w-[1100px] mx-auto text-red-600">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-black tracking-tight">Vault</h1>
          <button onClick={() => navigate('/find-companies')} className="bg-[#0A0A0A] text-white rounded-xl px-5 py-2.5 text-sm font-black">Search Companies →</button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total', v: stats.total, color: 'bg-[#5E17EB]', textColor: 'text-white' },
            { label: 'New', v: stats.new, color: 'bg-[#EDE8FF]', textColor: 'text-[#5E17EB]' },
            { label: 'Contacted', v: stats.contacted, color: 'bg-blue-50', textColor: 'text-blue-700' },
            { label: 'Replied', v: stats.replied, color: 'bg-amber-50', textColor: 'text-amber-700' },
            { label: 'Hot', v: stats.hot, color: 'bg-emerald-50', textColor: 'text-emerald-700' },
            { label: 'Closed Won', v: stats.closed_won || 0, color: 'bg-purple-50', textColor: 'text-purple-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-[#EDEDED]`}>
              <div className={`text-[11px] font-bold ${s.textColor} opacity-80`}>{s.label}</div>
              <div className={`text-2xl font-black ${s.textColor}`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Revenue summary */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-4 mb-4 flex items-center justify-between">
          <span className="text-sm font-bold">Total Revenue</span>
          <span className="text-2xl font-black">${(stats.closed_won || 0) * 500}</span>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name/domain..." className="rounded-xl border px-3 py-2 text-sm w-64" />
          <select value={nicheFilter} onChange={e => setNicheFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="">All Niches</option>
            <option>skincare</option><option>fitness</option><option>beauty</option>
            <option>shopify</option><option>saas</option><option>real estate</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option>new</option><option>contacted</option><option>replied</option><option>hot</option><option>closed_won</option>
          </select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
            <option value="">All Sources</option>
            <option>apollo</option><option>tavily</option>
          </select>
          {hasFilters && <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 px-2">Clear Filters</button>}

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setViewMode('table')} className={`rounded-lg px-3 py-1.5 text-xs font-black ${viewMode === 'table' ? 'bg-[#0A0A0A] text-white' : 'border'}`}>Table</button>
            <button onClick={() => setViewMode('cards')} className={`rounded-lg px-3 py-1.5 text-xs font-black ${viewMode === 'cards' ? 'bg-[#0A0A0A] text-white' : 'border'}`}>Cards</button>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="bg-[#5E17EB] text-white rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
            <span className="text-sm font-bold">{selected.size} selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkSave} className="bg-white text-[#5E17EB] rounded-lg px-4 py-2 text-xs font-black">Save Selected</button>
              <button onClick={() => setSelected(new Set())} className="border border-white/30 rounded-lg px-3 py-2 text-xs font-black">Clear</button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && !loading ? (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <h2 className="text-xl font-black mb-2">No companies in vault yet</h2>
            <p className="text-[#6B7280] mb-4">Search Companies → Save to vault → Send emails → Track replies</p>
            <button onClick={() => navigate('/find-companies')} className="bg-[#5E17EB] text-white rounded-xl px-6 py-3 font-black">Search Companies →</button>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white border border-[#EDEDED] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 font-black">Company</th>
                  <th className="text-left px-4 py-3 font-black">Owner</th>
                  <th className="text-left px-4 py-3 font-black">Verified Email</th>
                  <th className="text-left px-4 py-3 font-black">Niche</th>
                  <th className="text-left px-4 py-3 font-black">Status</th>
                  <th className="text-left px-4 py-3 font-black">Saved</th>
                  <th className="text-left px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id} className="border-b hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{i.company_name || i.name || '—'}</div>
                      <div className="text-xs text-[#6B7280]">{i.domain || '—'}</div>
                    </td>
                    <td className="px-4 py-3">{i.owner_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">✓ Hunter</span> {i.owner_email || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{i.niche || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{i.saved_at ? new Date(i.saved_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {i.status === 'new' && (
                          <button onClick={() => setModalCompany(i)} className="bg-[#0A0A0A] text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Send Email</button>
                        )}
                        {i.status === 'contacted' && (
                          <>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">Contacted • {i.contacted_at ? Math.floor((Date.now() - new Date(i.contacted_at)) / 86400000) + 'd ago' : ''}</span>
                            <button onClick={() => setModalCompany(i)} className="border rounded-lg px-2 py-1 text-[11px] font-black">Resend</button>
                          </>
                        )}
                        {(i.status === 'replied' || i.status === 'hot') && (
                          <button onClick={() => navigate(`/inbox?companyId=${i.id}`)} className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-[11px] font-black">View in Inbox →</button>
                        )}
                        {i.status === 'closed_won' && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">$500 Collected ✓</span>
                        )}
                        <button onClick={() => setModalCompany(i)} className="border rounded-lg px-2 py-1 text-[11px] font-black">View</button>
                        <button onClick={() => setDeleteCompany(i)} className="text-red-500 hover:text-red-700 rounded-lg px-2 py-1 text-[11px] font-black">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARDS VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(i => (
              <div key={i.id} className="bg-white border border-[#EDEDED] rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-black">{i.company_name || i.name || '—'}</h3>
                    <p className="text-xs text-[#6B7280]">{i.domain || '—'}</p>
                  </div>
                  <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggleSelect(i.id)} className="rounded mt-1" />
                </div>
                <div className="space-y-1.5 text-sm mb-4">
                  <div><span className="text-[#6B7280]">Owner:</span> <span className="font-bold">{i.owner_name || '—'}</span></div>
                  <div><span className="text-[#6B7280]">Email:</span> <span className="text-emerald-600 font-bold text-xs">✓ Hunter</span> {i.owner_email || '—'}</div>
                  <div><span className="text-[#6B7280]">Niche:</span> {i.niche || '—'}</div>
                  <div><span className="text-[#6B7280]">Product:</span> {i.product || '—'}</div>
                  <div><span className="text-[#6B7280]">Saved:</span> {i.saved_at ? new Date(i.saved_at).toLocaleDateString() : '—'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={i.status} />
                  <div className="flex gap-1">
                    {i.status === 'new' && <button onClick={() => setModalCompany(i)} className="bg-[#0A0A0A] text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Send Email</button>}
                    {i.status === 'contacted' && <button onClick={() => setModalCompany(i)} className="border rounded-lg px-3 py-1.5 text-[11px] font-black">Resend</button>}
                    {(i.status === 'replied' || i.status === 'hot') && <button onClick={() => navigate(`/inbox?companyId=${i.id}`)} className="bg-emerald-500 text-white rounded-lg px-3 py-1.5 text-[11px] font-black">Inbox →</button>}
                    <button onClick={() => setDeleteCompany(i)} className="text-red-500 hover:text-red-700 rounded-lg px-2 py-1 text-[11px] font-black">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex gap-2 mt-4 justify-center items-center">
            {page > 1 && <button onClick={() => setPage(p => p - 1)} className="rounded-xl border px-3 py-1 text-sm font-bold">← Prev</button>}
            <span className="text-sm font-bold">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="rounded-xl border px-3 py-1 text-sm font-bold">Next →</button>
          </div>
        )}

        {modalCompany && <EmailModal company={modalCompany} onClose={() => setModalCompany(null)} onSent={() => { setModalCompany(null); fetchData(); }} />}
        {deleteCompany && <DeleteConfirm company={deleteCompany} onClose={() => setDeleteCompany(null)} onDeleted={() => { setDeleteCompany(null); fetchData(); }} />}
      </div>
    </div>
  );
};
