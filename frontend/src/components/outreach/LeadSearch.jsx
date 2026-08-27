import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { API_URL } from '../../lib/api.js';

export default function LeadSearch() {
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [savedLeads, setSavedLeads] = useLocalStorage('alpha.leads', []);

  const niches = [
    'restaurant', 'hotel', 'cafe', 'bar', 'shop', 'real_estate',
    'lawyer', 'doctor', 'school', 'bank', 'hospital', 'office'
  ];

  const handleSearch = async () => {
    if (!city.trim() || !niche.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(`${API_URL}/api/leads/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: city.trim(), niche: niche.trim(), limit: 50 })
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.leads);
      } else {
        alert(data.error || 'Search failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveLead = (lead) => {
    const existing = savedLeads.find(l => String(l.id) === String(lead.id));
    if (existing) {
      alert('Lead already saved');
      return;
    }
    setSavedLeads([...savedLeads, { ...lead, saved_at: new Date().toISOString() }]);
  };

  const isSaved = (lead) => savedLeads.some(l => String(l.id) === String(lead.id));

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center text-[#0B0215]">🔍</div>
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Find Real Leads</h3>
          <p className="text-xs text-white/40">Search real businesses from OpenStreetMap — no API key needed.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          type="text"
          placeholder="City (e.g., Port Harcourt)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 focus:border-[#FFD700]/50 focus:outline-none placeholder:text-white/30"
        />
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="p-3 bg-[#0B0215] text-white rounded-xl border border-white/10 min-w-[140px]"
        >
          {niches.map(n => (
            <option key={n} value={n}>{n.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F59E0B] text-black font-black text-xs tracking-widest uppercase hover:scale-105 transition disabled:opacity-50 min-h-[48px]"
        >
          {loading ? 'Searching...' : '🔍 Find Leads'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <p className="text-[#FFD700] text-sm font-bold">Found {results.length} leads in {city} for {niche}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 max-h-96 overflow-y-auto pr-1">
            {results.map(lead => (
              <div key={lead.id} className="bg-[#0B0215] border border-white/10 rounded-xl p-4 hover:border-[#FFD700]/20 transition">
                <h4 className="text-white font-bold truncate">{lead.name}</h4>
                <p className="text-white/40 text-sm truncate">{lead.address || 'No address'}</p>
                {lead.phone && <p className="text-white/40 text-sm">📞 {lead.phone}</p>}
                {lead.website && <p className="text-white/40 text-sm truncate">🌐 {lead.website}</p>}
                <p className="text-white/20 text-xs mt-1">{lead.lat?.toFixed(4)}, {lead.lon?.toFixed(4)} • {lead.source}</p>
                <button
                  onClick={() => saveLead(lead)}
                  disabled={isSaved(lead)}
                  className={`mt-3 w-full py-2 rounded-full text-xs font-black tracking-widest uppercase transition ${isSaved(lead) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-[#0B0215] hover:bg-white/90'}`}
                >
                  {isSaved(lead) ? '✓ Saved' : '+ Save Lead'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !loading && (
        <p className="text-xs text-white/20 mt-4 text-center">Enter a city and niche, then search to find real businesses.</p>
      )}
    </div>
  );
}
