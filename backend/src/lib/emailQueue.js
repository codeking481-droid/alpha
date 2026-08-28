// ============================================================
// EMAIL QUEUE — in-memory queue per campaign (Worker-compatible)
// ============================================================
// Structure per job: { id, campaign_id, leads:[], template, schedule:{ type:'daily'|'immediate', perDay, atHour }, sent:[], paused, created_at }

const memQueue = new Map(); // campaign_id -> job

export function enqueueCampaign(campaignId, { leads = [], template = '', schedule = { type:'immediate', perDay: 10, atHour: 9 } }) {
  const job = {
    id: `q_${Date.now()}`,
    campaign_id: campaignId,
    leads: leads.map(l => typeof l==='string' ? { email:l } : l),
    template: String(template||''),
    schedule,
    sent: [],
    paused: false,
    created_at: new Date().toISOString(),
  };
  memQueue.set(String(campaignId), job);
  return job;
}

export function getQueue(campaignId) {
  if (campaignId) return memQueue.get(String(campaignId)) || null;
  return Array.from(memQueue.values());
}

export function pauseQueue(campaignId) {
  const j = memQueue.get(String(campaignId));
  if (j) j.paused = true;
  return j || null;
}

export function resumeQueue(campaignId) {
  const j = memQueue.get(String(campaignId));
  if (j) j.paused = false;
  return j || null;
}

// Simulate sending: in Worker we cannot cron reliably, so we expose manual / scheduled tick
// sendNextBatch will mark perDay leads as sent (mock) and return them
export function sendNextBatch(campaignId, perDayOverride) {
  const job = memQueue.get(String(campaignId));
  if (!job || job.paused) return { sent: [], remaining: job ? job.leads.length - job.sent.length : 0, paused: !!job?.paused };
  const perDay = perDayOverride || job.schedule.perDay || 10;
  const remaining = job.leads.filter(l => !job.sent.includes(l.email || l.id || String(l)));
  const batch = remaining.slice(0, perDay);
  batch.forEach(l => job.sent.push(l.email || l.id || String(l)));
  return { sent: batch, remaining: remaining.length - batch.length, totalSent: job.sent.length };
}

export function queueStatus(campaignId) {
  const job = memQueue.get(String(campaignId));
  if (!job) return { exists:false, paused:false, total:0, sent:0, remaining:0, nextAt: null };
  const total = job.leads.length;
  const sent = job.sent.length;
  return {
    exists:true,
    paused: !!job.paused,
    total,
    sent,
    remaining: total - sent,
    nextAt: job.schedule.type === 'daily' ? `daily ${job.schedule.atHour||9}:00` : 'immediate',
    schedule: job.schedule,
  };
}
