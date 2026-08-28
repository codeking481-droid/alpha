import { useState } from 'react';

export const AddMember = ({ onAdd, loading }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    await onAdd?.({ email: email.trim().toLowerCase(), role, name: name.trim() || email.split('@')[0] });
    setEmail(''); setName('');
  };

  const presets = [
    { label:'Genesis (manager)', email:'genesis@alphatekx.name.ng', role:'manager' },
    { label:'Dominion (member)', email:'dominion@alphatekx.name.ng', role:'member' },
  ];

  return (
    <div className="mature-card rounded-[16px] p-5 sm:p-6">
      <h3 className="eyebrow text-white/40">Add team member</h3>
      <p className="text-xs text-white/30 mt-1">Genesis = manager • Dominion = member • Admin = you. Admin-only action.</p>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (e.g. Genesis)" className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25" />
        <select value={role} onChange={e=>setRole(e.target.value)} className="bg-[#0B0215] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
          <option value="member">Member — Content • Outreach</option>
          <option value="manager">Manager — Clients • Campaigns</option>
          <option value="admin">Admin — Everything</option>
        </select>
        <button type="submit" disabled={loading} className="bg-white text-[#0B0215] rounded-xl font-black text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-white/90 disabled:opacity-50">
          {loading ? 'Adding…' : '+ Add member'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4">
        {presets.map(p=>(
          <button key={p.email} onClick={()=>{ setEmail(p.email); setRole(p.role); setName(p.label.split(' ')[0]); }} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white">
            + {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AddMember;
