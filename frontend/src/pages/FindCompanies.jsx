import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

const DEMO_RESULTS = [
  { name: 'OpenAI', website: 'openai.com', email: 'contact@openai.com', color: 'bg-[#5A7BF7]' },
  { name: 'Anthropic', website: 'anthropic.com', email: 'contact@anthropic.com', color: 'bg-[#5E17EB]' },
  { name: 'Perplexity', website: 'perplexity.ai', email: 'contact@perplexity.ai', color: 'bg-[#0A0A0A]' },
];

function SaveCompanyBtn({ company, getToken, niche, location }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const token = getToken();
      const domain = company.website ? company.website.replace(/^https?:\/\//,'').split('/')[0].replace('www.','') : '';
      const res = await fetch(`${API_URL}/api/companies/save`, {
        method: 'POST', headers: { 'Content-Type':'application/json', Authorization: token ? 'Bearer '+token : '' }, credentials: 'include',
        body: JSON.stringify({
          companyName: company.name, domain,
          ownerName: company.ownerName || '', ownerEmail: company.email || company.ownerEmail || '',
          niche: niche || '', product: '', source: company.source || 'apollo', website: company.website
        })
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setMsg('Saved ✓'); }
      else if (data.error === 'already saved' || res.status===409) { setSaved(true); setMsg('Already in vault'); }
      else { setMsg(data.error || 'Failed'); }
    } catch { setMsg('Failed'); }
    setSaving(false);
  };
  return (
    <div className="flex flex-col items-end gap-1 min-w-[110px]">
      {msg && <span className={`text-[11px] font-bold ${msg.includes('Saved')||msg.includes('Already') ? 'text-emerald-600':'text-red-600'}`}>{msg}</span>}
      <button onClick={save} disabled={saving || saved} className={`${saved ? 'bg-emerald-500 text-white' : 'bg-[#0A0A0A] hover:bg-black text-white'} rounded-full px-5 py-2 text-[13px] font-bold transition-colors shrink-0 disabled:opacity-60`}>
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save to Vault'}
      </button>
    </div>
  );
}

export const FindCompanies = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [niche, setNiche] = useState('Skincare');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState(DEMO_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!niche.trim()) { setError('Enter a niche (e.g., Skincare, Real Estate)'); return; }
    setLoading(true); setError(''); setHasSearched(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/search`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ niche: niche.trim(), location: location.trim(), count: 20 })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
      if (!res.ok) { setError(data.error || `Search failed ${res.status}`); setResults([]); return; }
      const arr = data.leads || data.results || data.companies || [];
      if (Array.isArray(arr) && arr.length > 0) {
        setResults(arr.map(c => ({
          name: c.name || c.company || c.title || 'Company',
          website: c.website || c.domain || c.link || c.url || 'example.com',
          email: c.ownerEmail || c.email || (c.website ? `info@${String(c.website).replace(/^https?:\/\//,'').split('/')[0].replace('www.','')}` : ''),
          ownerName: c.ownerName || '', ownerEmail: c.ownerEmail || c.email || '',
          color: 'bg-[#5E17EB]', phone: c.phone || '', source: c.source || 'search', verified: !!c.verified, employeeCount: c.employeeCount || 0
        })));
        let src = data.source === 'apollo' ? 'Apollo ✓' : data.source === 'mock' ? 'Generated • Ready to save' : data.source || 'search';
        setError(`${arr.length} found • Source: ${src}`);
      } else {
        setResults([]); setError(data.error || 'No companies found — try broader niche like "tech"');
      }
    } catch (e) { setError(e.message); setResults([]); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif]">
      <div className="max-w-[760px] mx-auto">
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-3 flex items-center justify-between shadow-sm mb-6">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 border border-[#E5E7EB] rounded-full px-3 py-1.5 text-[13px] font-medium bg-white hover:bg-[#F9FAFB]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>
          <div className="text-center"><h1 className="text-[16px] md:text-[18px] font-black leading-none">Search Companies</h1><p className="text-[11px] text-[#6B7280]">Apollo verified • Global • Owner emails</p></div>
          <button onClick={() => navigate('/saved-companies')} className="bg-[#0A0A0A] text-white rounded-full px-3 py-1.5 text-[12px] font-bold">Vault</button>
        </div>

        <div className="bg-white rounded-[20px] border border-[#EDEDED] p-4 md:p-6 shadow-sm">
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-[#E5E7EB] px-3 py-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.9"><circle cx="11" cy="11" r="7"/><path d="M15.5 15.5L20 20"/></svg>
              <input value={niche} onChange={e=>setNiche(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Skincare, Real Estate, Hotels..." className="flex-1 text-[14px] focus:outline-none placeholder:text-[#9CA3AF]" />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-[#E5E7EB] px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input value={location} onChange={e=>setLocation(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="USA, UK, Dubai, Global" className="flex-1 text-[14px] focus:outline-none placeholder:text-[#9CA3AF]" />
            </div>
            <button onClick={handleSearch} disabled={loading} className="bg-[#5E17EB] hover:bg-[#4E0FD1] text-white rounded-xl px-6 py-2.5 text-[14px] font-bold disabled:opacity-60 shrink-0">{loading ? 'Searching...' : 'Search'}</button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-[#9CA3AF] font-medium">Try:</span>
            {[{n:'Skincare',l:'USA'},{n:'Real Estate',l:'Dubai'},{n:'Hotels',l:''},{n:'Gyms',l:'UK'}].map(ex=>(
              <button key={ex.n+ex.l} onClick={()=>{setNiche(ex.n); setLocation(ex.l); setTimeout(handleSearch,80);}} className="text-[11px] font-bold bg-[#F3F4F6] hover:bg-[#EDEDED] rounded-full px-2.5 py-1">{ex.n} {ex.l ? `• ${ex.l}`:'• Global'}</button>
            ))}
            <span className="ml-auto text-[11px] text-[#9CA3AF] hidden sm:inline">{!location.trim() || location.toLowerCase()==='global' ? '🌍 Global' : location}</span>
          </div>

          {error && <div className={`mt-3 rounded-xl px-3 py-2 text-[12px] font-medium text-center ${error.includes('found') ? 'bg-[#F0EFFF] border border-[#DDD6FE] text-[#5E17EB]':'bg-amber-50 border border-amber-200 text-amber-800'}`}>{error}</div>}

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i=> <div key={i} className="h-[88px] bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl animate-pulse"/> )}</div>
            ) : results.length===0 && hasSearched ? (
              <div className="bg-white border border-[#EDEDED] rounded-2xl p-8 text-center">
                <div className="w-10 h-10 bg-[#F0EFFF] rounded-xl flex items-center justify-center mx-auto mb-3 text-[#5E17EB]">⌕</div>
                <p className="text-[14px] font-bold">No companies found</p>
                <p className="text-[12px] text-[#6B7280] mt-1">Try broader niche like "tech", "saas", or leave location blank for Global.</p>
              </div>
            ) : (
              results.map(c=>(
                <div key={c.name + c.website} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.color} text-white font-black`}>{c.name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-bold truncate">{c.name}</h3>
                      <p className="text-[11px] text-[#6B7280] truncate flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18"/></svg>{c.website}</p>
                      {(c.ownerName || c.ownerEmail) && <p className="text-[11px] truncate"><span className="font-semibold">{c.ownerName}</span> {c.ownerEmail && <span className="text-[#5E17EB] ml-1">{c.ownerEmail}</span>} {c.verified && <span className="ml-1 text-emerald-600 text-[10px] font-bold">Apollo ✓</span>}</p>}
                      <p className="text-[11px] text-[#6B7280] truncate">{c.email}</p>
                    </div>
                  </div>
                  <SaveCompanyBtn company={c} getToken={getToken} niche={niche} location={location} />
                </div>
              ))
            )}
          </div>

          {!hasSearched && (
            <div className="mt-6 bg-[#FFFCF8] border border-[#F3F4F6] rounded-xl p-3 text-center">
              <p className="text-[11px] font-bold tracking-wide text-[#9CA3AF]">DEMO PREVIEW — Search to get live Apollo results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
