// ============================================================
// AUTOMATION — schedule campaigns (Worker-compatible)
// Thin wrapper over emailQueue + campaigns status updates
// ============================================================
import { sbUpdate, getSupabase } from './supabase.js';
import { enqueueCampaign, getQueue, pauseQueue, resumeQueue, sendNextBatch, queueStatus } from './emailQueue.js';
import { setCampaignStatus } from './campaigns.js';

export async function scheduleCampaign(env, campaignId, { leads = [], template = '', schedule = { type:'daily', perDay:10, atHour:9 } }) {
  const job = enqueueCampaign(campaignId, { leads, template, schedule });
  // also mark campaign active if was draft
  try {
    if (getSupabase(env)) await sbUpdate(env, 'campaigns', campaignId, { status: 'active' });
  } catch {}
  // try mem path via setCampaignStatus fallback handled by caller
  try { await setCampaignStatus(env, campaignId, 'active'); } catch {}
  return job;
}

export async function getAutomationStatus(env, campaignId) {
  if (!campaignId) {
    const all = getQueue(null);
    return all.map(j=> queueStatus(j.campaign_id));
  }
  return queueStatus(campaignId);
}

export async function pauseAutomation(env, campaignId) {
  const job = pauseQueue(campaignId);
  try { await setCampaignStatus(env, campaignId, 'paused'); } catch {}
  if (getSupabase(env)) try { await sbUpdate(env, 'campaigns', campaignId, { status: 'paused' }); } catch {}
  return job;
}

export async function resumeAutomation(env, campaignId) {
  const job = resumeQueue(campaignId);
  try { await setCampaignStatus(env, campaignId, 'active'); } catch {}
  if (getSupabase(env)) try { await sbUpdate(env, 'campaigns', campaignId, { status: 'active' }); } catch {}
  return job;
}

export async function tickAutomation(env, campaignId, perDay) {
  const result = sendNextBatch(campaignId, perDay);
  // update campaign counters in mem/Supabase: messages_sent increment
  if (result.sent.length > 0) {
    try {
      if (getSupabase(env)) {
        // we don't have current count, use sbUpdate with increment via caller mem; fallback to just set status
      }
    } catch {}
  }
  return result;
}
