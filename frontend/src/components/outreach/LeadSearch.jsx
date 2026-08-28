import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const LeadSearch = () => {
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [savedLeads, setSavedLeads] = useLocalStorage('alpha.leads', []);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

  const niches = [
    'restaurant', 'hotel', 'cafe', 'bar', 'shop', 'real_estate',
    'lawyer', 'doctor', 'school', 'bank', 'hospital', 'office'
  ];

  const handleSearch = async () => {
    if (!city || !niche) return;
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(`${API_URL}/api/leads/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, niche, limit: 50 })
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
    const existing = savedLeads.find(l => l.id === lead.id);
    if (existing) {
      alert('Lead already saved');
      return;
    }
    setSavedLeads([...savedLeads, { ...lead, saved_at: new Date().toISOString() }]);
  };

  return (
    <div className="glass p-6">
      <h3 className="text-xl font-bold text-white">🔍 Find Real Leads</h3>
      <p className="text-gray-400 text-sm mt-1">Search real businesses from OpenStreetMap — no API key needed.</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          type="text"
          placeholder="City (e.g., Port Harcourt)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 p-3 bg-white/10 text-white rounded-lg border border-white/10 focus:border-gold"
        />
        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="p-3 bg-white/10 text-white rounded-lg border border-white/10"
        >
          {niches.map(n => (
            <option key={n} value={n}>{n.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn-primary px-6 py-3"
        >
          {loading ? 'Searching...' : '🔍 Find Leads'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <p className="text-gold text-sm">Found {results.length} leads</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 max-h-96 overflow-y-auto">
            {results.map(lead => (
              <div key={lead.id} className="glass p-4 hover:border-gold/30 transition">
                <h4 className="text-white font-bold">{lead.name}</h4>
                <p className="text-gray-400 text-sm">{lead.address || 'No address'}</p>
                {lead.phone && <p className="text-gray-400 text-sm">📞 {lead.phone}</p>}
                {lead.website && <p className="text-gray-400 text-sm">🌐 {lead.website}</p>}
                <button
                  onClick={() => saveLead(lead)}
                  className="mt-2 text-gold text-sm hover:underline"
                >
                  + Save Lead
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
