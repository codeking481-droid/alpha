import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/api';

const DEMO_RESULTS = [
  { name: 'OpenAI', website: 'openai.com', email: 'contact@openai.com', logo: 'openai', color: 'bg-[#5A7BF7]' },
  { name: 'Anthropic', website: 'anthropic.com', email: 'contact@anthropic.com', logo: 'anthropic', color: 'bg-[#5E17EB]' },
  { name: 'Perplexity', website: 'perplexity.ai', email: 'contact@perplexity.ai', logo: 'perplexity', color: 'bg-[#0A0A0A]' },
];

function SaveCompanyBtn({ company, getToken }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const save = async () => {
    setSaving(true); setMsg('');
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/companies/save`, {
        method: 'POST', headers: { 'Content-Type':'application/json', Authorization: token ? 'Bearer '+token : '' }, credentials: 'include',
        body: JSON.stringify({ companyName: company.name, domain: company.website ? company.website.replace(/^https?:\/\//,'').split('/')[0].replace('www.','') : '', ownerName: '', ownerEmail: company.email || '', niche: '', product: '', source: company.source || 'apollo', website: company.website })
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setMsg('Saved to vault'); }
      else if (data.error === 'already saved') { setSaved(true); setMsg('Already saved'); }
      else { setMsg(data.error || 'Failed'); }
    } catch { setMsg('Failed'); }
    setSaving(false);
  };
  return (
    <div className="flex flex-col items-end gap-1">
      {msg && <span className="text-[11px] font-bold text-emerald-600">{msg}</span>}
      <button onClick={save} disabled={saving || saved} className={`${saved ? 'bg-emerald-500 text-white' : 'bg-[#0A0A0A] hover:bg-black text-white'} rounded-xl px-5 py-2.5 text-[14px] font-black transition-colors shrink-0`}>
        {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save to Vault'}
      </button>
    </div>
  );
}

export const FindCompanies = () => {
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const [search, setSearch] = useState('AI startups');
  const [results, setResults] = useState(DEMO_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Parse city from input: "real estate in Lagos" => city=Lagos niche=real estate
      // For real search we need city + niche (Overpass). Default city Lagos.
      let city = 'Lagos';
      let niche = search.trim();
      const inMatch = search.match(/^(.+)\s+in\s+(.+)$/i);
      if (inMatch) {
        niche = inMatch[1].trim();
        city = inMatch[2].trim();
      } else if (search.toLowerCase().includes('lagos') || search.toLowerCase().includes('abuja') || search.toLowerCase().includes('port harcourt')) {
        // keep city Lagos, niche as is
      }
      const res = await fetch(`${API_URL}/api/companies/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ niche, location: city, count: 20 })
      });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
      if (!res.ok) {
        setError(data.error || `Search failed ${res.status}`);
        setResults([]);
        return;
      }
      const arr = data.leads || data.results || data.companies || [];
      if (Array.isArray(arr) && arr.length > 0) {
        setResults(arr.map(c => ({
          name: c.name || c.company || c.title || 'Company',
          website: c.website || c.domain || c.link || c.url || 'example.com',
          email: c.email || (c.website ? `info@${String(c.website).replace(/^https?:\/\//,'').split('/')[0].replace('www.','')}` : `contact@${(c.company||'company').toLowerCase().replace(/\s+/g,'')}.com`),
          ownerName: c.ownerName || '',
          ownerEmail: c.ownerEmail || c.email || '',
          color: 'bg-[#5E17EB]',
          logo: 'generic',
          phone: c.phone || '',
          source: c.source || 'search',
          verified: c.verified || false,
          employeeCount: c.employeeCount || 0
        })));
        const srcLabel = data.source === 'apollo' ? 'Apollo ✓ (verified emails)' : data.source === 'tavily' ? 'Tavily' : data.source || 'search';
        if (data.source) setError(`Source: ${srcLabel} • ${data.count || arr.length} found`);
      } else {
        setResults([]);
        setError(data.error || 'No companies found — Apollo returned 0. Try broader niche like "tech" or "software"');
      }
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-3 sm:px-4 py-4 sm:py-6 font-['Inter',sans-serif] overflow-x-hidden w-full max-w-[100vw]">
      <div className="max-w-[760px] mx-auto w-full max-w-full">
        <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#EDEDED]/60 shadow-sm p-4 sm:p-6 md:p-8 w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-5 sm:mb-6">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 sm:gap-2 border border-[#E0E0E0] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[15px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA] transition-colors cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-center flex-1 min-w-0 mx-2 sm:mx-4">
              <h1 className="text-[20px] sm:text-[28px] md:text-[34px] font-bold tracking-tight text-[#0A0A0A] leading-none truncate">Find Companies</h1>
              <p className="text-[13px] sm:text-[15px] text-[#6B7280] mt-1">Search any niche</p>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#5E17EB] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-[12px] sm:text-[15px] font-semibold tracking-widest">AA</span>
            </div>
          </div>

          <div className="relative bg-white border border-[#E0E0E0] rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 flex items-center gap-2 sm:gap-3 shadow-sm w-full overflow-hidden">
            <div className="pl-1 sm:pl-3 text-[#9CA3AF] shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]"><circle cx="11" cy="11" r="7"/><path d="M15.5 15.5L20 20"/></svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="hotel in Lagos, AI startups"
              className="flex-1 min-w-0 py-2 text-[14px] sm:text-[17px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none bg-transparent truncate"
            />
            <button onClick={handleSearch} className="bg-[#0A0A0A] hover:bg-black text-white rounded-lg sm:rounded-xl px-4 sm:px-7 py-2.5 sm:py-3 text-[14px] sm:text-[16px] font-medium transition-colors shrink-0 cursor-pointer">
              Search
            </button>
          </div>
          {error && <p className="text-center text-xs text-[#6B7280] mt-2">{error}</p>}

          <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4 w-full">
            {loading ? (
              <p className="text-center text-sm text-[#6B7280] py-8">Searching real companies via Apollo (verified owner emails)...</p>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8 px-2">No companies found. Try broader niche like "tech" or "saas"</p>
            ) : (
              results.map((c) => (
                <div key={c.name + c.website} className="bg-white border border-[#E5E7EB] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:shadow-sm transition-shadow w-full overflow-hidden">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${c.color}`}>
                      {c.name === 'OpenAI' && <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="sm:w-12 sm:h-12"><path d="M50 12 C30 18 12 35 12 50 C12 65 30 82 50 88 C70 82 88 65 88 50 C88 35 70 18 50 12 Z M50 18 C65 24 80 36 80 50 C80 64 65 76 50 82 C35 76 20 64 20 50 C20 36 35 24 50 18 Z" stroke="white" strokeWidth="3" fill="none"/><path d="M38 28 C42 32 45 40 38 48 C32 56 22 58 18 52 C22 42 32 32 38 28 Z M62 28 C68 32 78 42 82 52 C78 58 68 56 62 48 C55 40 58 32 62 28 Z M30 62 C38 68 48 70 56 64 C48 58 38 56 30 62 Z" stroke="white" strokeWidth="2.5" fill="none"/></svg>}
                      {c.name === 'Anthropic' && <svg width="32" height="32" viewBox="0 0 100 100" fill="white" className="sm:w-11 sm:h-11"><path d="M15 75 Q30 20 55 35 Q70 45 85 35 Q90 55 75 75 Q60 85 45 75 Q30 65 15 75 Z M25 55 Q40 15 62 30 Q75 40 88 30" stroke="white" strokeWidth="4" fill="none"/><circle cx="68" cy="48" r="10" fill="white"/></svg>}
                      {c.name === 'Perplexity' && <div className="grid grid-cols-5 gap-0.5 sm:gap-1 p-2">{Array.from({length:22}).map((_,i)=><div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-90"></div>)}</div>}
                      {c.name !== 'OpenAI' && c.name !== 'Anthropic' && c.name !== 'Perplexity' && <span className="text-white font-bold text-base sm:text-lg">{c.name[0]}</span>}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="text-[15px] sm:text-[18px] md:text-[22px] font-bold tracking-tight text-[#0A0A0A] leading-none truncate">{c.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#6B7280] min-w-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6" className="shrink-0"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3 12h18"/><path d="M12 7a5 15 0 0 0 0 10M12 7a5 15 0 0 1 0 10"/></svg>
                        <span className="truncate min-w-0 break-all">{c.website}</span>
                      </div>
                      {c.ownerName && <div className="flex items-center gap-1.5 mt-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#0A0A0A] font-medium min-w-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6" className="shrink-0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="truncate">{c.ownerName}</span>{c.verified && <span className="text-emerald-500 text-[10px] sm:text-xs font-bold shrink-0">Apollo ✓</span>}
                      </div>}
                      <div className="flex items-center gap-1.5 mt-1 text-[12px] sm:text-[13px] md:text-[14px] text-[#6B7280] min-w-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6" className="shrink-0"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span className="truncate min-w-0 break-all">{c.email}</span>{c.source === 'apollo' && <span className="text-emerald-500 text-xs font-bold shrink-0">✓</span>}
                      </div>
                    </div>
                  </div>
                  <div className="sm:shrink-0 w-full sm:w-auto flex justify-end">
                    <SaveCompanyBtn company={c} getToken={getToken} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};