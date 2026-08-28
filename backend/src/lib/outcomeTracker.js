// ============================================================
// OUTCOME TRACKER — Revenue, ROI, and performance (Worker-compatible)
// Uses Supabase REST via helpers; falls back to in-memory via caller
// ============================================================
import { sbSelect, sbInsert, getSupabase } from './supabase.js';

export async function saveOutcome(env, { campaignId, revenue, cost, views, conversions }) {
  const roi = cost > 0 ? ((Number(revenue) - Number(cost)) / Number(cost)) * 100 : 0;
  const row = {
    campaign_id: campaignId,
    revenue: Number(revenue) || 0,
    cost: Number(cost) || 0,
    roi,
    views: Number(views) || 0,
    conversions: Number(conversions) || 0,
    created_at: new Date().toISOString(),
  };
  if (getSupabase(env)) {
    return await sbInsert(env, 'outcomes', row);
  }
  // No Supabase — return mock for in-memory fallback
  return { id: `mem_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, ...row };
}

export async function getOutcomes(env, campaignId = null) {
  if (!getSupabase(env)) return null; // signal caller to use mem
  let query = 'order=created_at.desc';
  if (campaignId) query = `campaign_id=eq.${campaignId}&order=created_at.desc`;
  const data = await sbSelect(env, 'outcomes', query);
  return data || [];
}

export async function getOutcomeSummary(env) {
  if (!getSupabase(env)) return null;
  const data = (await sbSelect(env, 'outcomes', '')) || [];
  const summary = {
    totalRevenue: 0,
    totalCost: 0,
    averageROI: 0,
    totalViews: 0,
    totalConversions: 0,
    campaigns: data.length,
  };
  data.forEach((item) => {
    summary.totalRevenue += Number(item.revenue) || 0;
    summary.totalCost += Number(item.cost) || 0;
    summary.totalViews += Number(item.views) || 0;
    summary.totalConversions += Number(item.conversions) || 0;
  });
  summary.averageROI = summary.totalCost > 0 ? ((summary.totalRevenue - summary.totalCost) / summary.totalCost) * 100 : 0;
  return summary;
}
