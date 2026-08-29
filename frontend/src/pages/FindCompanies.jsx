import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/companies/save`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ city, niche, limit: 20, query: search, industry: niche })
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
          color: 'bg-[#5E17EB]',
          logo: 'generic',
          phone: c.phone || '',
          source: c.source || 'OpenStreetMap'
        })));
        if (data.source) setError(`Real results from ${data.source} • ${data.count || arr.length} found`);
      } else {
        setResults([]);
        setError(data.error || 'No companies found. Try "hotel in Lagos" or "restaurant in Abuja" for real Overpass results');
      }
    } catch (e) {
      setError(e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCF8] px-4 py-6 font-['Inter',sans-serif]">
      <div className="max-w-[760px] mx-auto">
        <div className="bg-white rounded-[24px] border border-[#EDEDED]/60 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 border border-[#E0E0E0] rounded-full px-4 py-2 text-[15px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA] transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>
            <div className="text-center flex-1 mx-4">
              <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-[#0A0A0A] leading-none">Find Companies</h1>
              <p className="text-[15px] text-[#6B7280] mt-1">Search any niche</p>
            </div>
            <div className="w-11 h-11 bg-[#5E17EB] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-[15px] font-semibold tracking-widest">AA</span>
            </div>
          </div>

          <div className="relative bg-white border border-[#E0E0E0] rounded-2xl px-2 py-2 flex items-center gap-3 shadow-sm">
            <div className="pl-3 text-[#9CA3AF]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M15.5 15.5L20 20"/></svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter a niche (e.g., hotel in Lagos, AI startups)"
              className="flex-1 py-2 text-[17px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none bg-transparent"
            />
            <button onClick={handleSearch} className="bg-[#0A0A0A] hover:bg-black text-white rounded-xl px-7 py-3 text-[16px] font-medium transition-colors shrink-0 cursor-pointer">
              Search
            </button>
          </div>
          {error && <p className="text-center text-xs text-[#6B7280] mt-2">{error}</p>}

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-center text-sm text-[#6B7280] py-8">Searching real companies via OpenStreetMap...</p>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-[#6B7280] py-8">No companies found. Try "hotel in Lagos" or "pharmacy in Abuja"</p>
            ) : (
              results.map((c) => (
                <div key={c.name + c.website} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 ${c.color}`}>
                      {c.name === 'OpenAI' && <svg width="48" height="48" viewBox="0 0 100 100" fill="none"><path d="M50 12 C30 18 12 35 12 50 C12 65 30 82 50 88 C70 82 88 65 88 50 C88 35 70 18 50 12 Z M50 18 C65 24 80 36 80 50 C80 64 65 76 50 82 C35 76 20 64 20 50 C20 36 35 24 50 18 Z" stroke="white" strokeWidth="3" fill="none"/><path d="M38 28 C42 32 45 40 38 48 C32 56 22 58 18 52 C22 42 32 32 38 28 Z M62 28 C68 32 78 42 82 52 C78 58 68 56 62 48 C55 40 58 32 62 28 Z M30 62 C38 68 48 70 56 64 C48 58 38 56 30 62 Z" stroke="white" strokeWidth="2.5" fill="none"/></svg>}
                      {c.name === 'Anthropic' && <svg width="44" height="44" viewBox="0 0 100 100" fill="white"><path d="M15 75 Q30 20 55 35 Q70 45 85 35 Q90 55 75 75 Q60 85 45 75 Q30 65 15 75 Z M25 55 Q40 15 62 30 Q75 40 88 30" stroke="white" strokeWidth="4" fill="none"/><circle cx="68" cy="48" r="10" fill="white"/></svg>}
                      {c.name === 'Perplexity' && <div className="grid grid-cols-5 gap-1 p-2">{Array.from({length:22}).map((_,i)=><div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-90"></div>)}</div>}
                      {c.name !== 'OpenAI' && c.name !== 'Anthropic' && c.name !== 'Perplexity' && <span className="text-white font-bold text-lg">{c.name[0]}</span>}
                    </div>
                    <div>
                      <h3 className="text-[18px] md:text-[22px] font-bold tracking-tight text-[#0A0A0A] leading-none">{c.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[13px] md:text-[14px] text-[#6B7280]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3 12h18"/><path d="M12 7a5 15 0 0 0 0 10M12 7a5 15 0 0 1 0 10"/></svg>
                        {c.website}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[13px] md:text-[14px] text-[#6B7280]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.6"><path d="M4 4h16v16H4z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {c.email}
                      </div>
                    </div>
                  </div>
                  <SaveCompanyBtn company={c} getToken={getToken} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};