import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const DEMO_RESULTS = [
  { name: 'OpenAI', website: 'openai.com', email: 'contact@openai.com', logo: 'openai', color: 'bg-[#5A7BF7]' },
  { name: 'Anthropic', website: 'anthropic.com', email: 'contact@anthropic.com', logo: 'anthropic', color: 'bg-[#5E17EB]' },
  { name: 'Perplexity', website: 'perplexity.ai', email: 'contact@perplexity.ai', logo: 'perplexity', color: 'bg-[#0A0A0A]' },
];

export const FindCompanies = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('AI startups');
  const [results, setResults] = useState(DEMO_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      let city = 'Lagos';
      let niche = search.trim();
      const inMatch = search.match(/^(.+)\s+in\s+(.+)$/i);
      if (inMatch) {
        niche = inMatch[1].trim();
        city = inMatch[2].trim();
      }
      const res = await fetch(apiUrl('/api/leads/find'), {
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
        setError('No companies found. Try "hotel in Lagos" or "skincare USA"');
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
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 border border-[#E0E0E0] rounded-full px-4 py-2 text-[15px] font-medium text-[#0A0A0A] bg-white hover:bg-[#FAFAFA]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-[#0A0A0A] leading-none">Find Companies</h1>
            <p className="text-[15px] text-[#6B7280] mt-1">Search any niche — real Apollo / Overpass data</p>
          </div>
          <div className="w-11 h-11 bg-[#5E17EB] rounded-full flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.9"><circle cx="11" cy="11" r="7"/><path d="M15.5 15.5L20 20"/></svg>
          </div>
        </div>

        <div className="bg-white border border-[#EDEDED] rounded-2xl p-3 flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter a niche (e.g., hotel in Lagos, skincare USA, AI startups)"
            className="flex-1 py-2 px-3 text-[17px] text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none bg-transparent"
          />
          <button onClick={handleSearch} disabled={loading} className={`${loading ? 'bg-[#A899D6] cursor-not-allowed' : 'bg-[#0A0A0A] hover:bg-black'} text-white rounded-xl px-7 py-3 text-[16px] font-medium shrink-0`}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className={`text-center text-xs mt-2 ${error.includes('Real results') || error.includes('found') ? 'text-emerald-600' : 'text-[#6B7280]'}`}>{error}</p>}

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-center text-sm text-[#6B7280] py-8">Searching real companies...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-[#6B7280] py-8">No companies found. Try "hotel in Lagos" or "skincare USA"</p>
          ) : (
            results.map((c) => (
              <div key={c.name + c.website} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 ${c.color}`}>
                    {c.name === 'OpenAI' && <svg width="48" height="48" viewBox="0 0 100 100" fill="none"><path d="M50 12 C30 18 12 35 12 50 C12 65 30 82 50 88 C70 82 88 65 88 50 C88 35 70 18 50 12 Z" stroke="white" strokeWidth="3" fill="none"/></svg>}
                    {c.name === 'Anthropic' && <svg width="44" height="44" viewBox="0 0 100 100" fill="white"><circle cx="50" cy="50" r="20"/></svg>}
                    {c.name === 'Perplexity' && <div className="grid grid-cols-5 gap-1 p-2">{Array.from({length:22}).map((_,i)=><div key={i} className="w-1.5 h-1.5 bg-white rounded-full"></div>)}</div>}
                    {c.name !== 'OpenAI' && c.name !== 'Anthropic' && c.name !== 'Perplexity' && <span className="text-white font-bold text-lg">{c.name[0]}</span>}
                  </div>
                  <div>
                    <h3 className="text-[18px] md:text-[22px] font-bold tracking-tight text-[#0A0A0A] leading-none">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[13px] text-[#6B7280]"><span>{c.website}</span></div>
                    <div className="flex items-center gap-1.5 mt-1 text-[13px] text-[#6B7280]"><span>{c.email}</span>{c.source && <span className="ml-2 text-[11px] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{c.source}</span>}</div>
                  </div>
                </div>
                <button onClick={async () => {
                  try {
                    await fetch(apiUrl('/api/outreach/leads'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: c.name, email: c.email, company: c.name, website: c.website }) });
                    alert(`Saved ${c.name}`);
                  } catch {}
                }} className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-[13px] font-semibold hover:bg-gray-50">Save</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
