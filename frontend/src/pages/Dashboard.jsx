import { useState } from 'react';
import { Link } from 'react-router-dom';

// Existing mature modules — keep real functionality under violet shell
import ContentStudio from './ContentStudio.jsx';
import OutreachEngine from './OutreachEngine.jsx';
import Analytics from './Analytics.jsx';
import DealDesk from './DealDesk.jsx';
import Campaigns from './Campaigns.jsx';
import Approvals from './Approvals.jsx';

// Inline Command Hub — light violet brand, real data
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { store } from '../lib/store.js';
import { useEffect } from 'react';

function CommandHubLite() {
  const [companies, setCompanies] = useLocalStorage("alpha.companies", [])
  useEffect(()=>{ store.getCompanies().then(r=>{ if(r && r.length>0 && companies.length===0) setCompanies(r) }) }, [])
  const revenue = companies.length ? `$${companies.reduce((s,c)=> s + (parseInt(String(c.revenue||'0').replace(/[^0-9]/g,''))||0),0)}k` : '$0';
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{color:'#0A0A0A'}}>Command Hub</h2>
          <p className="text-sm" style={{color:'#777777'}}>Real data • {companies.length} companies • Empty until you add</p>
        </div>
        <Link to="/outreach" className="btn-primary" style={{background:'#5E17EB'}}>Find Leads →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card"><div className="text-xs font-bold tracking-widest uppercase" style={{color:'#999999'}}>Companies</div><div className="text-2xl font-bold mt-1" style={{color:'#0A0A0A'}}>{companies.length}</div><div className="text-xs mt-1" style={{color:'#999999'}}>Real</div></div>
        <div className="card"><div className="text-xs font-bold tracking-widest uppercase" style={{color:'#999999'}}>Revenue</div><div className="text-2xl font-bold mt-1" style={{color:'#5E17EB'}}>{revenue}</div><div className="text-xs mt-1" style={{color:'#999999'}}>Proof layer</div></div>
        <div className="card"><div className="text-xs font-bold tracking-widest uppercase" style={{color:'#999999'}}>Reach</div><div className="text-2xl font-bold mt-1" style={{color:'#0A0A0A'}}>4,469 <span className="text-xs font-normal" style={{color:'#999999'}}>LI+WA+TG+YT</span></div><div className="text-xs mt-1" style={{color:'#999999'}}>No bots</div></div>
      </div>
      {companies.length===0 ? (
        <div className="card text-center py-10">
          <div className="text-3xl mb-2">🚀</div>
          <p className="font-bold" style={{color:'#0A0A0A'}}>Your Agency Awaits</p>
          <p className="text-sm mt-1" style={{color:'#777777'}}>Add your first company to start.</p>
          <Link to="/outreach" className="btn-primary mt-4 inline-flex" style={{background:'#5E17EB'}}>Find Companies</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(c=> (
            <div key={c.id} className="card">
              <div className="font-bold" style={{color:'#0A0A0A'}}>{c.name || c.company || 'Company'}</div>
              <div className="text-xs mt-1" style={{color:'#777777'}}>{c.industry || '—'} • {c.status || 'active'}</div>
            </div>
          ))}
        </div>
      )}
      <div className="card mt-6" style={{background:'rgba(94,23,235,0.04)', borderColor:'rgba(94,23,235,0.15)'}}>
        <p className="text-sm" style={{color:'#5E17EB', fontWeight:600}}>🔒 Truth Clause: We have real communities (700 LI • 215 WA • 54 TG • 3k YT). We do not guarantee views — we guarantee delivery to real people.</p>
      </div>
    </div>
  )
}

const badges = [
  { id: 'hub', label: 'Command Hub', icon: '🚀' },
  { id: 'content', label: 'Content Studio', icon: '✍️' },
  { id: 'outreach', label: 'Outreach Engine', icon: '📧' },
  { id: 'approvals', label: 'Approvals', icon: '✓' },
  { id: 'campaigns', label: 'Campaigns', icon: '⬢' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'deals', label: 'Deal Desk', icon: '💰' },
];

export default function Dashboard() {
  const [activeBadge, setActiveBadge] = useState('hub');

  const renderBadge = () => {
    switch (activeBadge) {
      case 'hub': return <CommandHubLite />;
      case 'content': return <ContentStudio />;
      case 'outreach': return <OutreachEngine />;
      case 'approvals': return <Approvals />;
      case 'campaigns': return <Campaigns />;
      case 'analytics': return <Analytics />;
      case 'deals': return <DealDesk />;
      default: return <CommandHubLite />;
    }
  };

  return (
    <div className="min-h-screen" style={{background:'#FFFFFB'}}>
      {/* Top Navigation — violet brand, light */}
      <div className="border-b sticky top-0 z-10" style={{background:'#FFFFFB', borderColor:'#EAEAEA'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 py-3 overflow-x-auto">
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setActiveBadge(badge.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                style={activeBadge === badge.id ? {background:'#5E17EB', color:'#FFFFFB'} : {color:'#555555'}}
              >
                {badge.icon} {badge.label}
              </button>
            ))}
            <span className="ml-auto hidden sm:inline text-xs font-bold px-3 py-1 rounded-full" style={{background:'rgba(94,23,235,0.08)', color:'#5E17EB'}}>v1.0 • Violet OS</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderBadge()}
      </div>
    </div>
  )
}
