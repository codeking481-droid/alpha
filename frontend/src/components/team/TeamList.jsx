import { useState } from 'react';
import { API_URL } from '../../lib/api.js';

const roleBadge = {
  admin: 'bg-white text-[#0B0215]',
  manager: 'bg-[#FFD700] text-[#0B0215]',
  member: 'bg-white/10 text-white/60 border border-white/10',
};

export const TeamList = ({ members, onUpdateRole, onRemove, loading }) => {
  const [updating, setUpdating] = useState(null);

  const handleRoleChange = async (id, newRole) => {
    setUpdating(id);
    await onUpdateRole?.(id, newRole);
    setUpdating(null);
  };

  if (loading) return <div className="text-center text-white/30 py-8 text-sm">Loading team…</div>;
  if (!members || members.length===0) return <div className="glass rounded-xl p-8 text-center text-white/30 text-sm">No team members yet — add Genesis (manager) or Dominion (member).</div>;

  return (
    <div className="mature-card rounded-[16px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="eyebrow text-white/30">
              <th className="text-left px-4 py-3 font-bold">Member</th>
              <th className="text-left px-4 py-3 font-bold">Role</th>
              <th className="text-left px-4 py-3 font-bold">Access</th>
              <th className="text-right px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map(m=>(
              <tr key={m.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0B0215] font-black text-xs">{(m.name||m.email||'?').slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className="font-bold text-white leading-none">{m.name || m.email.split('@')[0]}</div>
                      <div className="text-xs text-white/40">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={m.role || 'member'}
                    onChange={e=> handleRoleChange(m.id, e.target.value)}
                    disabled={updating===m.id}
                    className="bg-[#0B0215] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${roleBadge[m.role] || roleBadge.member}`}>
                    {m.role}
                  </span>
                  <div className="text-[11px] text-white/25 mt-1">
                    {m.role==='admin' ? 'Everything' : m.role==='manager' ? 'Clients • Campaigns • Content' : 'Content • Outreach'}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=> onRemove?.(m.id)} className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamList;
