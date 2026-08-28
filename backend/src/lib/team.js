// ============================================================
// TEAM MANAGEMENT — roles + permissions (Worker-compatible)
// ============================================================
import { sbSelect, sbInsert, sbUpdate, sbDelete, getSupabase } from './supabase.js';

const ROLES = ['admin','manager','member'];
export const ROLE_PERMS = {
  admin:   { canManageTeam:true, canManageClients:true, canManageCampaigns:true, canCreateContent:true, canSendOutreach:true },
  manager: { canManageTeam:false, canManageClients:true, canManageCampaigns:true, canCreateContent:true, canSendOutreach:true },
  member:  { canManageTeam:false, canManageClients:false, canManageCampaigns:false, canCreateContent:true, canSendOutreach:true },
};

export function normalizeRole(r) {
  const v = String(r||'member').toLowerCase();
  return ROLES.includes(v) ? v : 'member';
}

export async function listTeam(env) {
  if (getSupabase(env)) {
    try {
      const data = await sbSelect(env, 'team', 'order=created_at.desc');
      return data || [];
    } catch { return []; }
  }
  return null; // signal mem fallback
}

export async function addTeamMember(env, { email, role, name }) {
  const r = normalizeRole(role);
  if (!email) throw new Error('email required');
  const row = { email: String(email).toLowerCase(), role: r, name: name || email.split('@')[0], created_at: new Date().toISOString() };
  if (getSupabase(env)) {
    return await sbInsert(env, 'team', row);
  }
  return { id: `mem_${Date.now()}`, ...row };
}

export async function updateTeamRole(env, id, role) {
  const r = normalizeRole(role);
  if (getSupabase(env)) {
    return await sbUpdate(env, 'team', id, { role: r });
  }
  return { id, role: r };
}

export async function removeTeamMember(env, id) {
  if (getSupabase(env)) {
    await sbDelete(env, 'team', id);
    return true;
  }
  return true;
}

export async function getTeamMember(env, id) {
  if (getSupabase(env)) {
    try {
      const rows = await sbSelect(env, 'team', `id=eq.${id}&limit=1`);
      return rows && rows[0] ? rows[0] : null;
    } catch { return null; }
  }
  return null;
}
