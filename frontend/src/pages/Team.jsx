import { useState, useEffect } from 'react';
import { TeamList } from '../components/team/TeamList';
import { AddMember } from '../components/team/AddMember';
import { API_URL } from '../lib/api.js';

export const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('alpha.token') || '' : '';

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/team`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json().catch(()=>[]);
      if (Array.isArray(data)) setMembers(data);
      else if (data && Array.isArray(data.members)) setMembers(data.members);
      else setMembers([]);
    } catch { setMembers([]); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchTeam(); }, []);

  const handleAdd = async ({ email, role, name }) => {
    setAdding(true); setMsg('');
    try {
      const res = await fetch(`${API_URL}/api/team`, {
        method:'POST',
        headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ email, role, name }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMsg(`✅ Added ${email} as ${role}`);
      fetchTeam();
    } catch (e) { setMsg(`❌ ${e.message}`); }
    finally { setAdding(false); }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      const res = await fetch(`${API_URL}/api/team/${id}`, {
        method:'PUT',
        headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Update failed');
      fetchTeam();
    } catch (e) { setMsg(`❌ ${e.message}`); }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await fetch(`${API_URL}/api/team/${id}`, {
        method:'DELETE',
        headers: token ? { Authorization:`Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Remove failed');
      fetchTeam();
    } catch (e) { setMsg(`❌ ${e.message}`); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#0B0215] flex items-center justify-center font-black">◐</div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">TEAM — Roles & Permissions</h1>
          <p className="text-xs text-white/40 tracking-wide">Admin (you) • Manager (Genesis) • Member (Dominion) — mature RBAC.</p>
        </div>
        <button onClick={fetchTeam} className="ml-auto text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        {[
          ['Admin', 'Full access', 'You'],
          ['Manager', 'Clients • Campaigns', 'Genesis'],
          ['Member', 'Content • Outreach', 'Dominion'],
        ].map(([r,p,ex])=>(
          <div key={r} className="mature-card rounded-xl p-3 text-center">
            <div className="eyebrow text-white/40">{r}</div>
            <div className="text-white font-bold text-sm mt-1">{p}</div>
            <div className="text-white/25 text-[11px]">{ex}</div>
          </div>
        ))}
      </div>

      <AddMember onAdd={handleAdd} loading={adding} />
      {msg && <p className="text-xs text-white/60 whitespace-pre-wrap">{msg}</p>}
      <TeamList members={members} onUpdateRole={handleUpdateRole} onRemove={handleRemove} loading={loading} />

      <div className="mature-card rounded-xl p-4 text-xs leading-5 text-white/30">
        <span className="font-bold text-white/60">How it works:</span> POST /api/team (admin only) creates via Supabase team table or in-memory. PUT /api/team/:id updates role. DELETE removes. GET lists. Frontend enforces admin UI; backend enforces with requireAdmin.
      </div>
    </div>
  );
};

export default Team;
