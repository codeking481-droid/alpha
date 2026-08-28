// ============================================================
// CAMPAIGNS — full model + lifecycle (Worker-compatible)
// ============================================================
import { sbSelect, sbInsert, sbUpdate, sbDelete, getSupabase } from './supabase.js';

const STATUSES = ['draft','active','paused','completed'];

export function normalizeStatus(s) {
  const v = String(s||'draft').toLowerCase();
  return STATUSES.includes(v) ? v : 'draft';
}

export async function listCampaigns(env) {
  if (getSupabase(env)) {
    try {
      const data = await sbSelect(env, 'campaigns', 'order=created_at.desc');
      return data || [];
    } catch { return []; }
  }
  return null;
}

export async function createCampaign(env, { name, client_id, clientId, status, niche, target_city, targetCity, budget, created_by, createdBy }) {
  if (!name) throw new Error('name required');
  const row = {
    name: String(name).trim(),
    client_id: client_id || clientId || null,
    status: normalizeStatus(status),
    niche: niche || null,
    target_city: target_city || targetCity || null,
    budget: Number(budget)||0,
    leads_found: 0,
    messages_sent: 0,
    replies_received: 0,
    meetings_booked: 0,
    revenue_generated: 0,
    created_by: created_by || createdBy || null,
    created_at: new Date().toISOString(),
  };
  if (getSupabase(env)) {
    return await sbInsert(env, 'campaigns', row);
  }
  return { id: `mem_${Date.now()}_${Math.random().toString(36).slice(2,5)}`, ...row };
}

export async function getCampaign(env, id) {
  if (getSupabase(env)) {
    try {
      const rows = await sbSelect(env, 'campaigns', `id=eq.${id}&limit=1`);
      return rows && rows[0] ? rows[0] : null;
    } catch { return null; }
  }
  return null;
}

export async function updateCampaign(env, id, patch) {
  const allowed = ['name','client_id','status','niche','target_city','budget','leads_found','messages_sent','replies_received','meetings_booked','revenue_generated'];
  const clean = {};
  for (const k of allowed) {
    if (patch[k] !== undefined) clean[k] = patch[k];
    if (patch.clientId !== undefined && k==='client_id') clean.client_id = patch.clientId;
    if (patch.targetCity !== undefined && k==='target_city') clean.target_city = patch.targetCity;
  }
  if (clean.status) clean.status = normalizeStatus(clean.status);
  if (clean.budget !== undefined) clean.budget = Number(clean.budget)||0;
  if (getSupabase(env)) {
    return await sbUpdate(env, 'campaigns', id, clean);
  }
  return { id, ...clean };
}

export async function deleteCampaign(env, id) {
  if (getSupabase(env)) {
    await sbDelete(env, 'campaigns', id);
    return true;
  }
  return true;
}

export async function setCampaignStatus(env, id, status) {
  return await updateCampaign(env, id, { status });
}
