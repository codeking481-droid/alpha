// ============================================================
// REPLY TRACKER — Store and retrieve replies (Worker-compatible)
// Uses Supabase REST via supabase.js helpers; falls back to empty when not configured
// ============================================================
import { sbSelect, sbInsert, sbUpdate, getSupabase } from './supabase.js';

export async function saveSentMessage(env, { to, subject, html, leadId }) {
  const row = {
    lead_id: leadId || null,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    content: html,
    sent_at: new Date().toISOString(),
    replied: false,
  };
  // Try Supabase first
  if (getSupabase(env)) {
    return await sbInsert(env, 'messages', row);
  }
  // No Supabase configured — caller (index.js) will handle in-memory fallback
  return { id: `mem_${Date.now()}`, ...row };
}

export async function saveReply(env, { messageId, content, from }) {
  const row = {
    message_id: messageId,
    content,
    from: from || 'Unknown',
    received_at: new Date().toISOString(),
  };
  let data = null;
  if (getSupabase(env)) {
    data = await sbInsert(env, 'replies', row);
    // mark original message as replied
    try { await sbUpdate(env, 'messages', messageId, { replied: true }); } catch {}
  } else {
    data = { id: `mem_${Date.now()}`, ...row };
  }
  return data;
}

export async function getReplies(env, leadId = null) {
  if (!getSupabase(env)) return [];
  // Supabase REST filtering - if leadId provided, filter via lead_id or message_id join not available, fallback to client filter
  const all = (await sbSelect(env, 'replies', 'order=received_at.desc')) || [];
  if (!leadId) return all;
  // Try to filter by lead_id if column exists, otherwise filter by message linkage not possible — return filtered if field matches
  const filtered = all.filter(r => String(r.lead_id) === String(leadId) || String(r.message_id) === String(leadId));
  return filtered.length ? filtered : all.filter(r => String(r.lead_id) === String(leadId));
}

export async function getSentMessages(env, leadId = null) {
  if (!getSupabase(env)) return [];
  const all = (await sbSelect(env, 'messages', 'order=sent_at.desc')) || [];
  if (!leadId) return all;
  return all.filter(m => String(m.lead_id) === String(leadId) || String(m.to) === String(leadId));
}
