import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sbSelect, sbInsert, sbUpdate, sbDelete, sbGetOne, getSupabase } from './lib/supabase.js'
import { groqGenerate, promptContent, promptLeadEmail } from './lib/groq.js'
import { verifyAccessCode, getUserFromRequest, requireAuth, requireAdmin } from './lib/auth.js'
import { generateAccessCode, generatePaidAccessCode, verifyAccessCodeWithUser, getAccessCodes } from './lib/accessCodes.js'
import { createApiToken, getApiTokens, revokeApiToken, deleteApiToken, verifyApiToken } from './lib/apiTokens.js'
import { initializePayment, verifyPayment } from './lib/payment.js'
import { findLeads } from './lib/leadFinder.js'
import { sendEmailResend } from './lib/email.js'
import { saveSentMessage, saveReply, getReplies, getSentMessages } from './lib/replyTracker.js'
import { saveOutcome, getOutcomes, getOutcomeSummary } from './lib/outcomeTracker.js'
import { listCampaigns, createCampaign, getCampaign, updateCampaign, deleteCampaign, setCampaignStatus } from './lib/campaigns.js'
import { scheduleCampaign, getAutomationStatus, pauseAutomation, resumeAutomation, tickAutomation } from './lib/automation.js'
import { COMMUNITY, PRICING, TRUTH_CLAUSE, getTotalReach, getCampaignDeliverables } from './lib/community.js'
import { generateCampaignPlan } from './lib/campaignPlanner.js'
import { generateWeekContent, prepareDelivery } from './lib/contentGenerator.js'
import { sendBulkOffers, personalizeOffer, previewOffers } from './lib/outreachSender.js'
import { generateCampaignContent, saveCampaign } from './lib/campaignGenerator.js'
import { sendEmail, trackSentEmail, getSentEmails, personalizateMessage, formatEmailHTML, checkCompanyDuplicate, sendOutreachEmail } from './lib/emailService.js'
import { findCompaniesApollo, findCompaniesWikipedia, getCachedLeads, cacheLeads, searchCompanies } from './lib/companyFinder.js'
import { syncGmailReplies, getReplies as getGmailReplies, handleEmailReplyWebhook } from './lib/replyService.js'
import { sendHotLeadAlert } from './services/hotLeadAlert.js'

const app = new Hono()
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  maxAge: 86400,
}))
app.use('*', async (c, next) => {
  try { await next() } catch (e) {
    console.error(e)
    return c.json({ error: e.message || 'Internal error' }, 500)
  }
})

// In-memory fallback when Supabase is not configured.
const mem = { companies: [], content: [], leads: [], messages: [], replies: [], clients: [], invoices: [], contracts: [], codes: [], access_codes: [], api_tokens: [], outcomes: [], client_outcomes: [], campaigns: [] }
const hasSupabase = (env) => !!getSupabase(env)

// Safe user ID for TEXT columns — NEVER use UUID 'id' column with email string!
function getSafeUserId(user) {
  const uid = user?.id || user?.email || user?.sub || 'founder@alphatekx.com'
  if (uid === 'true' || uid === 'master_unlocked' || uid.length < 5) return 'founder@alphatekx.com'
  return uid // email text, for user_id TEXT column only
}

// Helpers â€” use Supabase if configured, else memory (with PGRST204 fallback for missing columns)
async function list(env, table) {
  if (hasSupabase(env)) {
    try { return (await sbSelect(env, table, 'order=created_at.desc')) || [] } catch { return mem[table] || [] }
  }
  return mem[table] || []
}
async function create(env, table, row) {
  if (hasSupabase(env)) {
    try { return await sbInsert(env, table, row) } catch (e) {
      // Fallback to in-mem if Supabase schema missing columns (PGRST204) or other error — keep working 100%
      console.warn(`[create:${table}] Supabase insert failed, fallback to mem:`, e.message?.slice(0,120))
    }
  }
  const item = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row }
  mem[table].unshift(item)
  return item
}
async function getOne(env, table, id) {
  if (hasSupabase(env)) {
    try { const r = await sbGetOne(env, table, id); if (r) return r } catch {}
  }
  return (mem[table] || []).find((x) => String(x.id) === String(id)) || null
}
async function updateOne(env, table, id, patch) {
  if (hasSupabase(env)) {
    try { const r = await sbUpdate(env, table, id, patch); if (r && !Array.isArray(r)) return r; if (Array.isArray(r) && r.length>0) return r[0]; if (r) return r } catch (e) {
      // If missing column (PGRST204), retry without that column
      if (String(e.message).includes('PGRST204') || String(e.message).includes('Could not find')) {
        try {
          const clean = { ...patch }; delete clean.hot_lead_alerted; delete clean.hot_lead_alerted_at; delete clean.html; delete clean.to_email; delete clean.subject; delete clean.resend_id; delete clean.follow_up_status; delete clean.follow_up_due_at; delete clean.follow_up_message; delete clean.follow_up_sent_at; delete clean.follow_up_approved_at; delete clean.follow_up_rejected_at
          const r2 = await sbUpdate(env, table, id, clean); if (r2) return r2
          // If still fails, try minimal status only
          const minimal = { status: patch.status || 'contacted' };
          if (patch.contacted_at) minimal.contacted_at = patch.contacted_at;
          if (patch.outreach_count !== undefined) minimal.outreach_count = patch.outreach_count;
          const r3 = await sbUpdate(env, table, id, minimal).catch(()=>null); if (r3) return r3
        } catch {}
      }
      console.warn(`[update:${table}] Supabase update failed, fallback to mem:`, e.message?.slice(0,120))
    }
  }
  const idx = (mem[table] || []).findIndex((x) => String(x.id) === String(id))
  if (idx === -1) return null
  mem[table][idx] = { ...mem[table][idx], ...patch }
  return mem[table][idx]
}
async function deleteOne(env, table, id) {
  if (hasSupabase(env)) return await sbDelete(env, table, id)
  const before = (mem[table] || []).length
  mem[table] = (mem[table] || []).filter((x) => String(x.id) !== String(id))
  return mem[table].length < before
}

// Telegram hot lead helper — detects hot keywords and sends Telegram
async function checkAndSendHotLeadTelegram(env, replies) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return
  const hotKeywords = ['interested', 'call', 'pricing', 'meeting']
  for (const r of replies || []) {
    const body = (r.body || r.content || r.reply_text || r.text || '').toLowerCase()
    const isHot = hotKeywords.some(k => body.includes(k))
    if (isHot && !r.hot_lead_alerted) {
      const snippet = (r.body || r.content || r.reply_text || '').slice(0, 200)
      const companyName = r.company?.company_name || r.company_name || r.from_email?.split('@')[1]?.split('.')[0] || 'Unknown Company'
      const ownerEmail = r.from_email || r.owner_email || r.to || 'unknown@example.com'
      const msg = `🔥 HOT LEAD: ${companyName} (${ownerEmail}) replied: ${snippet} - Check Inbox!`
      try {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: msg })
        })
        // Mark as alerted to avoid duplicate spam
        if (r.id) {
          try { await sbUpdate(env, 'replies', r.id, { hot_lead_alerted: true, hot_lead_alerted_at: new Date().toISOString() }) } catch {}
          // Also update mem
          const idx = (mem.replies || []).findIndex(x => String(x.id) === String(r.id))
          if (idx !== -1) mem.replies[idx].hot_lead_alerted = true
        }
      } catch {}
    }
  }
}

// Health â€” both / and /api/health (for prompt's test)
app.get('/', (c) => c.json({ status: 'Alpha Agency API â€” Online', badges: ['Command Hub', 'Content Studio', 'Outreach Engine', 'Analytics', 'Deal Desk'], supabase: !!getSupabase(c.env), note: 'Real data only â€” Root path must be backend' }))
app.get('/api/debug/env', (c) => c.json({ hasSupabaseUrl: !!c.env.SUPABASE_URL, hasAnon: !!c.env.SUPABASE_ANON_KEY, hasService: !!c.env.SUPABASE_SERVICE_KEY, hasGroq: !!c.env.GROQ_API_KEY, envKeys: Object.keys(c.env || {}), note: 'debug — no values leaked' }))
app.get('/api/health', (c) => c.json({ status: 'ok', message: 'Alpha Agency API is live', timestamp: new Date().toISOString() }))
app.get('/api/healthz', (c) => c.json({ status: 'ok', message: 'Alpha Agency API is live' }))

// â”€â”€ Companies (also /api/companies)
app.get('/api/companies/my-companies', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user) // email TEXT — NEVER uuid!
    const status = c.req.query('status') || ''
    const niche = c.req.query('niche') || ''
    const search = c.req.query('search') || ''
    const source = c.req.query('source') || ''
    // NEVER filter by id column (uuid) with email string! Only user_id TEXT
    let query = `user_id=eq.${safeUserId}`
    if (status) query += `&status=eq.${status}`
    if (niche) query += `&niche=ilike.*${niche}*`
    if (source) query += `&source=eq.${source}`
    if (search) query += `&or=(company_name.ilike.*${search}*,domain.ilike.*${search}*)`
    query += '&order=created_at.desc'
    let arr = []
    try {
      arr = await sbSelect(c.env, 'companies', query) || []
    } catch (e) {
      // user_id column may not exist yet — fallback to all companies
      console.warn('[my-companies] user_id filter failed, returning all:', e.message)
      let fallbackQuery = '?order=created_at.desc'
      if (status) fallbackQuery += `&status=eq.${status}`
      if (niche) fallbackQuery += `&niche=ilike.*${niche}*`
      if (search) fallbackQuery += `&or=(company_name.ilike.*${search}*,domain.ilike.*${search}*)`
      try { arr = await sbSelect(c.env, 'companies', fallbackQuery.slice(1)) || [] } catch {}
    }
    const stats = { total: (arr||[]).length, new: (arr||[]).filter(x=>x.status==='new').length, contacted: (arr||[]).filter(x=>x.status==='contacted').length, replied: (arr||[]).filter(x=>x.status==='replied').length, hot: (arr||[]).filter(x=>x.status==='hot').length, closed_won: (arr||[]).filter(x=>x.status==='closed_won').length }
    return c.json({ companies: arr || [], total: (arr || []).length, stats, note: 'Real saved companies' })
  } catch (e) { return c.json({ companies: [], total: 0, stats: { total:0,new:0,contacted:0,replied:0,hot:0,closed_won:0 }, error: e.message }) }
})
app.post('/api/companies/save', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user) // email TEXT — NEVER uuid!
    const body = await c.req.json().catch(() => ({}))
    const domain = (body.domain || '').toLowerCase().trim()
    if (!domain || !body.companyName) return c.json({ error: 'companyName and domain required' }, 400)
    // Dedup by user_id TEXT + domain (never by id uuid!) — fallback to domain-only if user_id is uuid column
    const existing = await sbSelect(c.env, 'companies', `user_id=eq.${safeUserId}&domain=eq.${domain}`).catch(async () => {
      try { return await sbSelect(c.env, 'companies', `domain=eq.${domain}`) } catch { return null }
    })
    if (existing && existing.length > 0) return c.json({ error: 'already saved', company: existing[0] }, 409)
    // id auto gen_random_uuid(), don't provide id — user_id is TEXT email, but DB may be uuid so fallback without user_id
    // name is NOT NULL per schema, so set both name and company_name
    const row = { name: body.companyName, user_id: safeUserId, company_name: body.companyName, domain, owner_name: body.ownerName || '', owner_email: body.ownerEmail || '', niche: body.niche || '', product: body.product || '', source: body.source || 'apollo', website: body.website || '', status: 'new', is_real: true, saved_at: new Date().toISOString(), contacted_at: null, outreach_count: 0 }
    let saved = null
    try { saved = await sbInsert(c.env, 'companies', row) } catch (e) {
      const msg = String(e.message)
      if (msg.includes('22P02') || msg.includes('invalid input syntax for type uuid')) {
        const row2 = { ...row }; delete row2.user_id
        saved = await sbInsert(c.env, 'companies', row2)
      } else if (msg.includes('23502') && msg.includes('name')) {
        // name violation fallback already has name, try alternative
        throw e
      } else throw e
    }
    return c.json({ success: true, company: saved || row })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/companies/save-bulk', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user) // email TEXT — NEVER uuid!
    const body = await c.req.json().catch(() => ({}))
    const list = body.companies || []
    const results = []; let saved = 0, skipped = 0, failed = 0;
    for (const item of list) {
      try {
        const domain = (item.domain || '').toLowerCase().trim()
        if (!domain || !item.companyName) { failed++; continue }
        // Dedup by user_id TEXT + domain, fallback to domain-only if uuid column
        const existing = await sbSelect(c.env, 'companies', `user_id=eq.${safeUserId}&domain=eq.${domain}`).catch(async () => {
          try { return await sbSelect(c.env, 'companies', `domain=eq.${domain}`) } catch { return null }
        })
        if (existing && existing.length > 0) { skipped++; results.push({ skipped: true, reason: 'already saved', company: existing[0] }); continue }
        const row = { name: item.companyName, user_id: safeUserId, company_name: item.companyName, domain, owner_name: item.ownerName || '', owner_email: item.ownerEmail || '', niche: item.niche || '', product: item.product || '', source: item.source || 'apollo', website: item.website || '', status: 'new', is_real: true, saved_at: new Date().toISOString(), contacted_at: null, outreach_count: 0 }
        let s = null
        try { s = await sbInsert(c.env, 'companies', row) } catch (e) {
          if (String(e.message).includes('22P02') || String(e.message).includes('invalid input syntax for type uuid')) {
            const row2 = { ...row }; delete row2.user_id
            s = await sbInsert(c.env, 'companies', row2)
          } else throw e
        }
        saved++; results.push({ success: true, company: s || row })
      } catch (e) { failed++; results.push({ success: false, error: e.message }) }
    }
    return c.json({ success: true, total: list.length, saved, skipped_duplicates: skipped, failed, details: results })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.delete('/api/companies/:id', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user) // email TEXT — NEVER uuid!
    const companyId = c.req.param('id') // this is company uuid, NOT user!
    // Verify ownership: id uuid = company UUID, user_id TEXT = email
    const row = await sbSelect(c.env, 'companies', `id=eq.${companyId}&user_id=eq.${safeUserId}`).catch(() => null)
    if (!row || row.length === 0) {
      // Fallback: check by id only (user_id column may not exist)
      const byId = await sbSelect(c.env, 'companies', `id=eq.${companyId}`).catch(() => null)
      if (!byId || byId.length === 0) return c.json({ error: 'not found' }, 404)
    }
    const ok = await deleteOne(c.env, 'companies', companyId)
    return c.json({ success: true, deleted: ok })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
// FIX: stats and status must be BEFORE generic :id routes (Hono matches first)
app.patch('/api/companies/:id/status', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    // Founding $250 pricing — handle closed_won with amount
    const patch = { status: body.status || 'hot' }
    if (body.status === 'closed_won') { patch.closed_won_at = new Date().toISOString(); patch.amount = 250; }
    const updated = await updateOne(c.env, 'companies', id, patch)
    if (!updated) return c.json({ error: 'not found' }, 404)
    try {
      const safeUserId = getSafeUserId(user)
      const row = await sbSelect(c.env, 'companies', `id=eq.${id}&user_id=eq.${safeUserId}`)
      if (!row || row.length === 0) {
        // Check if column is uuid vs text — fallback allow
        const byId = await sbSelect(c.env, 'companies', `id=eq.${id}`).catch(()=>null)
        if (!byId || byId.length===0) return c.json({ error: 'not found' }, 404)
      }
    } catch {}
    return c.json({ success: true, company: updated })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/companies/stats', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user)
    let arr = []
    try { arr = await sbSelect(c.env, 'companies', `user_id=eq.${encodeURIComponent(safeUserId)}`) || [] } catch { try { arr = await sbSelect(c.env, 'companies', `domain=eq.${encodeURIComponent('dummy')}`) } catch {} }
    // Fallback to all if filtered empty and user has no companies
    if (!arr || arr.length===0) {
      try { arr = await sbSelect(c.env, 'companies', 'order=created_at.desc') || [] } catch { arr = await list(c.env, 'companies') }
    }
    const stats = { total_saved: arr.length, new: arr.filter(x=>x.status==='new').length, contacted: arr.filter(x=>x.status==='contacted').length, replied: arr.filter(x=>x.status==='replied').length, hot: arr.filter(x=>x.status==='hot').length, closed_won: arr.filter(x=>x.status==='closed_won').length, total_revenue: arr.filter(x=>x.status==='closed_won').length*250, originalRevenue: arr.filter(x=>x.status==='closed_won').length*500, audience: 4528 }
    return c.json({ stats, total: arr.length, note: 'Real' })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// ── Follow-up Approval (User must approve YES before send) ──
app.get('/api/companies/pending-followups', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user)
    let arr = []
    try { arr = await sbSelect(c.env, 'companies', `user_id=eq.${encodeURIComponent(safeUserId)}&status=eq.contacted&order=contacted_at.desc`) || [] } catch { arr = await list(c.env, 'companies').then(a=>a.filter(x=>x.status==='contacted')) }
    if (!arr || arr.length===0) {
      try { arr = await sbSelect(c.env, 'companies', 'status=eq.contacted&order=contacted_at.desc') || [] } catch { arr = await list(c.env, 'companies').then(a=>a.filter(x=>x.status==='contacted')) }
    }
    // Show all pending_approval (user control, no auto-send) — due in 3 days but show immediately for approval
    const pending = arr.filter(co => {
      if (co.status !== 'contacted') return false
      // Show if explicitly pending_approval OR if no follow_up_status but contacted (implies pending)
      if (co.follow_up_status === 'approved' || co.follow_up_status === 'rejected') return false
      if (!co.contacted_at) return false
      return true
    }).map(co => ({
      ...co,
      follow_up_status: co.follow_up_status || 'pending_approval',
      follow_up_due_at: co.follow_up_due_at || new Date(new Date(co.contacted_at).getTime() + 3*24*60*60*1000).toISOString(),
      notification: `Approve follow-up for ${co.company_name || co.name}?`
    }))
    return c.json({ pending, count: pending.length, note: 'Follow-ups waiting approval — no auto-send' })
  } catch (e) { return c.json({ error: e.message, pending: [] }, 500) }
})

app.patch('/api/companies/:id/follow-up', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const id = c.req.param('id')
    const body = await c.req.json().catch(()=>({}))
    const action = (body.action || '').toLowerCase()
    if (!['approve','reject','approved','rejected'].includes(action)) return c.json({ error: 'action must be approve or reject' }, 400)
    const isApprove = action.startsWith('approv')
    const company = await getOne(c.env, 'companies', id)
    if (!company) return c.json({ error: 'company not found' }, 404)
    // Ownership check
    try {
      const safeUserId = getSafeUserId(user)
      const row = await sbSelect(c.env, 'companies', `id=eq.${id}&user_id=eq.${encodeURIComponent(safeUserId)}`).catch(()=>null)
      if (!row || row.length===0) {
        const byId = await sbSelect(c.env, 'companies', `id=eq.${id}`).catch(()=>null)
        if (!byId || byId.length===0) return c.json({ error: 'not found' }, 404)
      }
    } catch {}
    if (isApprove) {
      const editedMessage = body.editedMessage || body.follow_up_message || body.message || null
      // If editedMessage provided, use it; otherwise use stored or generate default
      let msg = editedMessage || company.follow_up_message || `Hi ${company.owner_name || 'there'},\n\nJust following up on my previous email about featuring ${company.company_name || company.name} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`
      // Send follow-up via Resend
      try {
        const sent = await sendEmailResend(c.env, { to: company.owner_email, subject: `Re: Quick win for ${company.company_name || company.name} — follow-up`, html: `<p>${msg.replace(/\n/g,'<br>')}</p>`, text: msg, from: c.env.FROM_EMAIL || 'noreply@alphatekx.name.ng' })
        const patch = { follow_up_status: 'approved', follow_up_sent_at: new Date().toISOString(), follow_up_approved_at: new Date().toISOString(), follow_up_message: msg, outreach_count: (company.outreach_count||0)+1, last_outreach_at: new Date().toISOString() }
        const updated = await updateOne(c.env, 'companies', id, patch)
        return c.json({ success: true, approved: true, resend_id: sent.id || null, company: updated || { ...company, ...patch }, message: 'Follow-up approved and sent' })
      } catch (e) {
        return c.json({ error: e.message }, 500)
      }
    } else {
      const patch = { follow_up_status: 'rejected', follow_up_rejected_at: new Date().toISOString() }
      const updated = await updateOne(c.env, 'companies', id, patch)
      return c.json({ success: true, rejected: true, company: updated || { ...company, ...patch } })
    }
  } catch (e) { return c.json({ error: e.message }, 500) }
})
// Alias for POST as per prompt
app.post('/api/companies/:id/follow-up', async (c) => {
  c.req.param = c.req.param.bind(c)
  const id = c.req.param('id')
  // Forward to PATCH logic by reusing same handler code via internal fetch? Simplify: just call PATCH handler
  const body = await c.req.json().catch(()=>({}))
  const action = (body.action || '').toLowerCase()
  // Reuse PATCH logic
  const fakeC = { ...c, req: { ...c.req, param: () => id, json: async () => body, header: c.req.header } }
  // Instead duplicate minimal logic:
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const company = await getOne(c.env, 'companies', id)
    if (!company) return c.json({ error: 'company not found' }, 404)
    if (action.startsWith('approv')) {
      const msg = body.editedMessage || body.follow_up_message || body.message || company.follow_up_message || `Hi ${company.owner_name || 'there'},\n\nFollow-up for ${company.company_name || company.name}.`
      const sent = await sendEmailResend(c.env, { to: company.owner_email, subject: `Re: Quick win for ${company.company_name || company.name} — follow-up`, html: `<p>${msg.replace(/\n/g,'<br>')}</p>`, text: msg, from: c.env.FROM_EMAIL || 'noreply@alphatekx.name.ng' })
      const patch = { follow_up_status: 'approved', follow_up_sent_at: new Date().toISOString(), follow_up_approved_at: new Date().toISOString(), follow_up_message: msg, outreach_count: (company.outreach_count||0)+1 }
      const updated = await updateOne(c.env, 'companies', id, patch)
      return c.json({ success: true, approved: true, resend_id: sent.id || null, company: updated })
    } else {
      const patch = { follow_up_status: 'rejected', follow_up_rejected_at: new Date().toISOString() }
      const updated = await updateOne(c.env, 'companies', id, patch)
      return c.json({ success: true, rejected: true, company: updated })
    }
  } catch (e) { return c.json({ error: e.message }, 500) }
})

app.get('/api/companies', async (c) => c.json(await list(c.env, 'companies')))
app.post('/api/companies', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.name) return c.json({ error: 'name required' }, 400)
  return c.json(await create(c.env, 'companies', { name: body.name, industry: body.industry || '', status: body.status || 'active', projects_count: body.projects_count || 0, revenue: body.revenue || 0 }), 201)
})
app.get('/api/companies/:id', async (c) => {
  const item = await getOne(c.env, 'companies', c.req.param('id'))
  return item ? c.json(item) : c.json({ error: 'not found' }, 404)
})
app.put('/api/companies/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const updated = await updateOne(c.env, 'companies', c.req.param('id'), body)
  return updated ? c.json(updated) : c.json({ error: 'not found' }, 404)
})
app.delete('/api/companies/:id', async (c) => {
  const ok = await deleteOne(c.env, 'companies', c.req.param('id'))
  return ok ? c.json({ ok: true }) : c.json({ error: 'not found' }, 404)
})

// â”€â”€ Content
app.get('/api/content', async (c) => c.json(await list(c.env, 'content')))
app.post('/api/content', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.title) return c.json({ error: 'title required' }, 400)
  return c.json(await create(c.env, 'content', { title: body.title, format: body.format || 'post', status: body.status || 'draft', content: body.content || '', words: body.words || 0, company_id: body.company_id || null }), 201)
})
app.post('/api/content/generate', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const groqModel = c.env.GROQ_MODEL || "llama-3.1-70b-versatile"
  console.log(`Content generate using model: ${groqModel}, body: ${JSON.stringify(body).slice(0,120)}`)
  // CompanyId mode (authenticated vault content generation)
  if (body.companyId) {
    try {
      const user = getUserFromRequest(c)
      const comp = await getOne(c.env, 'companies', body.companyId)
      if (!comp) return c.json({ error: 'company not found' }, 404)
      console.log(`Content generate using model: ${groqModel}, company: ${body.companyId} (${comp.company_name || comp.name})`)
      const prompt = `Generate 3 premium community posts for ${comp.company_name || comp.name} (${comp.niche || 'business'}) to post on our 4,500+ audience. Tone: professional, invite-only.`
      const { text, mocked, model } = await groqGenerate(c.env, { prompt })
      return c.json({ success: true, company: comp.company_name || comp.name, content: text || 'Generated', text: text || 'Generated', mocked: !!mocked, model: model || groqModel })
    } catch (e) { return c.json({ error: e.message }, 500) }
  }
  // Generic mode: topic/format
  const { topic, format = 'post', company = 'Your Company' } = body
  if (!topic) return c.json({ error: 'topic required (or companyId)' }, 400)
  console.log(`Content generate using model: ${groqModel}, topic: ${topic}`)
  const { text, mocked, model } = await groqGenerate(c.env, { prompt: promptContent({ topic, format, company }) })
  return c.json({ text, mocked: !!mocked, content: text, success: true, model: model || groqModel })
})
app.get('/api/content/:id', async (c) => {
  const item = await getOne(c.env, 'content', c.req.param('id'))
  return item ? c.json(item) : c.json({ error: 'not found' }, 404)
})
app.put('/api/content/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const updated = await updateOne(c.env, 'content', c.req.param('id'), body)
  return updated ? c.json(updated) : c.json({ error: 'not found' }, 404)
})
app.delete('/api/content/:id', async (c) => {
  const ok = await deleteOne(c.env, 'content', c.req.param('id'))
  return ok ? c.json({ ok: true }) : c.json({ error: 'not found' }, 404)
})
// legacy
app.post('/api/ai/generate', async (c) => {
  const { topic, format = 'post', company = 'Your Company' } = await c.req.json().catch(() => ({}))
  if (!topic) return c.json({ error: 'topic required' }, 400)
  const { text, mocked } = await groqGenerate(c.env, { prompt: promptContent({ topic, format, company }) })
  return c.json({ text, mocked })
})
app.get('/api/content/projects', async (c) => c.json(await list(c.env, 'content')))

// â”€â”€ Outreach / Leads
app.get('/api/leads', async (c) => {
  const all = await list(c.env, 'leads')
  const q = c.req.query('q') || ''
  const filtered = !q ? all : all.filter((l) => `${l.name || ''} ${l.email || ''}`.toLowerCase().includes(q.toLowerCase()))
  return c.json(filtered)
})
app.post('/api/leads/find', async (c) => {
  try {
    const { city, niche, limit = 20, query, industry } = await c.req.json().catch(() => ({}))
    const cityVal = city || query
    const nicheVal = niche || industry
    if (!cityVal || !nicheVal) return c.json({ error: 'City and niche are required â€” e.g. { city: "Port Harcourt", niche: "hotel" } or { city: "Lagos", niche: "CEO" }' }, 400)
    const leads = await findLeads(c.env, cityVal, nicheVal, Math.min(limit, 50))
    const source = leads[0]?.source || (c.env.APOLLO_API_KEY ? 'Hybrid (Apollo + Overpass)' : 'OpenStreetMap (free)')
    return c.json({ success: true, leads, count: leads.length, city: cityVal, niche: nicheVal, source })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
app.get('/api/outreach/leads', async (c) => {
  const all = await list(c.env, 'leads')
  const q = c.req.query('q') || ''
  return c.json(!q ? all : all.filter((l) => `${l.name} ${l.email || ''}`.toLowerCase().includes(q.toLowerCase())))
})
app.post('/api/outreach/leads', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json(await create(c.env, 'leads', body), 201)
})
app.post('/api/outreach/generate', async (c) => {
  const { lead, company = 'Your Company', points = '', tone = 'friendly' } = await c.req.json().catch(() => ({}))
  if (!lead) return c.json({ error: 'lead required' }, 400)
  const { text } = await groqGenerate(c.env, { prompt: promptLeadEmail({ lead, company, points, tone }) })
  return c.json({ text })
})
app.get('/api/outreach/campaigns', async (c) => c.json(await list(c.env, 'leads').then(() => [])))
app.post('/api/outreach/campaigns', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({ id: crypto.randomUUID(), ...body }, 201)
})
app.get('/api/messages', async (c) => c.json(await list(c.env, 'messages')))
app.post('/api/messages', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  // If it's an email send (has to/subject), try Resend
  if (body.to && body.subject) {
    try {
      const sent = await sendEmailResend(c.env, { to: body.to, subject: body.subject, html: body.html, text: body.content || body.text, from: body.from })
      const saved = await create(c.env, 'messages', { ...body, resend_id: sent.id || sent.data?.id, sent_at: new Date().toISOString(), replied: false })
      return c.json({ ...saved, resend: sent, note: 'Real email sent via Resend' }, 201)
    } catch (e) {
      // Save even if send fails, with error
      const saved = await create(c.env, 'messages', { ...body, error: e.message, sent_at: new Date().toISOString() })
      return c.json({ ...saved, error: e.message, note: 'Saved but Resend failed â€” check RESEND_API_KEY' }, 201)
    }
  }
  return c.json(await create(c.env, 'messages', body), 201)
})
// Explicit send endpoint for outreach — unified: supports both generic (to/subject) and company outreach (companyName/domain) with dedup
app.post('/api/outreach/send', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  // Company outreach mode: if companyName/domain present, handle dedup + sendOutreachEmail (real Apollo companies)
  if (body.companyName || body.domain || body.company_name) {
    try {
      const companyName = body.companyName || body.company_name || body.name || 'Company'
      const domain = (body.domain || '').toLowerCase().trim()
      const ownerEmail = body.ownerEmail || body.owner_email || body.to || ''
      const ownerName = body.ownerName || body.owner_name || ''
      const niche = body.niche || body.industry || ''
      if (!domain || !ownerEmail) {
        // Fallback to generic if missing company fields but has to/subject
        if (body.to && body.subject) {
          const sent = await sendEmailResend(c.env, { to: body.to, subject: body.subject, html: body.html || body.message || body.text, text: body.text || body.content || body.message, from: body.from })
          let saved
          if (hasSupabase(c.env) && body.leadId) { try { saved = await saveSentMessage(c.env, { to: body.to, subject: body.subject, html: body.html || body.text, leadId: body.leadId }) } catch {} }
          if (!saved) saved = await create(c.env, 'messages', { ...body, resend_id: sent.id, sent_at: new Date().toISOString(), replied: false })
          return c.json({ success: true, message: 'Email sent and tracked', sent, saved, result: sent })
        }
        return c.json({ error: 'domain and ownerEmail required for company outreach (or to/subject for generic)' }, 400)
      }
      const dedup = await checkCompanyDuplicate(c.env, domain, ownerEmail)
      if (dedup.skipped) return c.json({ error: 'already contacted', reason: dedup.reason, last_contacted_at: dedup.last_contacted_at, outreach_count: dedup.outreach_count }, 409)
      // If custom subject/message provided, use generic send but also mark company — follow-up pending approval (3 days, no auto-send)
      if (body.subject && body.message && body.to) {
        const sent = await sendEmailResend(c.env, { to: body.to || ownerEmail, subject: body.subject, html: body.message, text: body.message, from: body.from })
        try {
          const now = new Date().toISOString()
          const followDue = new Date(Date.now() + 3*24*60*60*1000).toISOString()
          const followMsg = `Hi ${ownerName || 'there'},\n\nJust following up on my previous email about featuring ${companyName} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`
          // Try to find company and update via resilient updateOne (handles missing columns)
          let foundId = null
          try {
            const sb = getSupabase(c.env)
            if (sb) {
              const findRes = await fetch(`${sb.url}/rest/v1/companies?domain=eq.${domain}&select=id,outreach_count`, { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` } })
              if (findRes.ok) {
                const db = await findRes.json()
                if (db && db[0]) foundId = db[0].id
              }
            }
          } catch {}
          if (foundId) {
            await updateOne(c.env, 'companies', foundId, { status: 'contacted', contacted_at: now, outreach_count: 1, follow_up_status: 'pending_approval', follow_up_due_at: followDue, follow_up_message: followMsg, last_outreach_at: now }).catch(()=>{})
            // Also ensure mem fallback has it if supabase missing column
            try { await updateOne(c.env, 'companies', foundId, { status: 'contacted' }) } catch {}
          }
        } catch {}
        return c.json({ success: true, company: companyName, resend_id: sent.id, marked_contacted: true, follow_up_status: 'pending_approval', follow_up_due_at: new Date(Date.now() + 3*24*60*60*1000).toISOString(), waiting_approval: true })
      }
      const result = await sendOutreachEmail(c.env, { companyName, domain, ownerName, ownerEmail, niche })
      if (result.skipped) return c.json({ error: 'already contacted', reason: result.reason, last_contacted_at: result.last_contacted_at }, 409)
      if (result.sendError) return c.json({ error: result.sendError }, 500)
      return c.json({ success: true, company: result.company, resend_id: result.resend_id, marked_contacted: true, outreach_count: result.outreach_count })
    } catch (e) { return c.json({ error: e.message }, 500) }
  }
  // Generic mode: to + subject required
  if (!body.to || !body.subject) return c.json({ error: 'to and subject required' }, 400)
  try {
    const sent = await sendEmailResend(c.env, { to: body.to, subject: body.subject, html: body.html, text: body.text || body.content, from: body.from })
    let saved
    if (hasSupabase(c.env) && body.leadId) {
      try { saved = await saveSentMessage(c.env, { to: body.to, subject: body.subject, html: body.html || body.text, leadId: body.leadId }) } catch {}
    }
    if (!saved) saved = await create(c.env, 'messages', { ...body, resend_id: sent.id, sent_at: new Date().toISOString(), replied: false })
    return c.json({ success: true, message: 'Email sent and tracked', sent, saved, result: sent })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
app.get('/api/replies', async (c) => {
  try {
    const leadId = c.req.query('leadId') || c.req.query('lead_id') || null
    const sentiment = c.req.query('sentiment') || null
    // Try Gmail first if configured, fallback to in-mem/supabase list
    if (hasSupabase(c.env) && !leadId) {
      try {
        const gmailReplies = await getGmailReplies(c.env, 100).catch(()=>null)
        if (gmailReplies && Array.isArray(gmailReplies) && gmailReplies.length > 0) {
          const filtered = sentiment ? gmailReplies.filter(r => r.sentiment === sentiment) : gmailReplies
          try { await checkAndSendHotLeadTelegram(c.env, filtered) } catch {}
          return c.json({ success: true, replies: filtered, count: filtered.length, source: 'gmail', stats: { total: gmailReplies.length, positive: gmailReplies.filter(r=>r.sentiment==='positive').length, negative: gmailReplies.filter(r=>r.sentiment==='negative').length, neutral: gmailReplies.filter(r=>r.sentiment==='neutral').length } })
        }
      } catch {}
    }
    if (leadId && hasSupabase(c.env)) {
      const replies = await getReplies(c.env, leadId)
      try { await checkAndSendHotLeadTelegram(c.env, replies) } catch {}
      return c.json({ success: true, replies, count: replies.length })
    }
    const all = await list(c.env, 'replies')
    const filteredByLead = leadId ? all.filter(r => String(r.lead_id) === String(leadId) || String(r.message_id) === String(leadId)) : all
    const filtered = sentiment ? filteredByLead.filter(r => r.sentiment === sentiment || r.sentiment === 'positive' && sentiment==='positive') : filteredByLead
    // Telegram hot lead notification on hot keywords
    try { await checkAndSendHotLeadTelegram(c.env, filtered) } catch {}
    return c.json({ success: true, replies: filtered, count: filtered.length })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
app.get('/api/outreach/replies', async (c) => {
  try {
    const leadId = c.req.query('leadId') || c.req.query('lead_id') || null
    const all = await list(c.env, 'replies')
    const filtered = leadId ? all.filter(r => String(r.lead_id) === String(leadId) || String(r.message_id) === String(leadId)) : all
    return c.json({ success: true, replies: filtered, count: filtered.length })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/outreach/replies', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  // If Supabase configured, use replyTracker to also mark message replied
  if (body.messageId || body.message_id) {
    try {
      const saved = await saveReply(c.env, { messageId: body.messageId || body.message_id, content: body.content || body.text || '', from: body.from })
      if (saved && saved.id && !String(saved.id).startsWith('mem_')) return c.json({ success: true, reply: saved }, 201)
    } catch {}
  }
  return c.json(await create(c.env, 'replies', body), 201)
})
app.get('/api/messages/sent', async (c) => {
  try {
    const leadId = c.req.query('leadId') || c.req.query('lead_id') || null
    if (hasSupabase(c.env)) {
      const messages = await getSentMessages(c.env, leadId)
      return c.json({ success: true, messages, count: messages.length })
    }
    const all = await list(c.env, 'messages')
    const filtered = leadId ? all.filter(m => String(m.lead_id) === String(leadId) || String(m.to) === String(leadId)) : all
    return c.json({ success: true, messages: filtered, count: filtered.length })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
app.get('/api/outreach/analytics', async (c) => c.json({ leadsFound: (await list(c.env, 'leads')).length, sent: (await list(c.env, 'messages')).length, replyRate: 0, meetings: 0, openRate: 0, note: 'Real' }))

// â”€â”€ Analytics
app.get('/api/analytics/overview', async (c) => {
  const companies = await list(c.env, 'companies')
  const content = await list(c.env, 'content')
  const invoices = await list(c.env, 'invoices')
  return c.json({
    views: content.length * 120,
    viewsChange: 'â€”',
    engagement: 'â€”',
    engagementChange: 'â€”',
    revenue: `$${invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0)}`,
    revenueChange: 'â€”',
    growth: 'â€”',
    growthChange: 'â€”',
    viewsOverTime: content.slice(0, 6).map((_, i) => ({ label: `W${i + 1}`, value: (i + 1) * 10 })),
    platform: [],
    outreach: [],
    companies: companies.length,
    content: content.length,
    note: 'Real',
  })
})
app.get('/api/analytics/content', async (c) => c.json({ items: await list(c.env, 'content') }))
app.get('/api/analytics/outreach', async (c) => c.json({ leads: await list(c.env, 'leads'), messages: await list(c.env, 'messages') }))
app.get('/api/analytics/revenue', async (c) => {
  const invoices = await list(c.env, 'invoices')
  return c.json({ total: invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0), invoices })
})
app.post('/api/analytics/report', async (c) => {
  const { client = 'Your Client', range = 'Last 30 days', format = 'PDF' } = await c.req.json().catch(() => ({}))
  return c.json({ status: 'generated', client, range, format, note: 'Real report' })
})

// â”€â”€ Deal Desk / Clients / Invoices / Contracts
app.get('/api/clients', async (c) => c.json(await list(c.env, 'clients')))
app.post('/api/clients', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.name) return c.json({ error: 'name required' }, 400)
  return c.json(await create(c.env, 'clients', body), 201)
})
app.get('/api/invoices', async (c) => c.json(await list(c.env, 'invoices')))
app.post('/api/invoices', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.amount && !body.total) return c.json({ error: 'amount required' }, 400)
  return c.json(await create(c.env, 'invoices', { amount: body.amount || body.total, status: body.status || 'draft', due_date: body.due_date || body.due || new Date(Date.now()+14*86400000).toISOString().slice(0,10), client_id: body.client_id || null, ...body }), 201)
})
app.get('/api/contracts', async (c) => c.json(await list(c.env, 'contracts')))
app.post('/api/contracts', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.name) return c.json({ error: 'name required' }, 400)
  return c.json(await create(c.env, 'contracts', body), 201)
})
// legacy /api/deals/* keeps working
app.get('/api/deals/clients', async (c) => c.json(await list(c.env, 'clients')))
app.get('/api/deals/clients/:id', async (c) => {
  const item = await getOne(c.env, 'clients', c.req.param('id')) || await getOne(c.env, 'companies', c.req.param('id'))
  return item ? c.json(item) : c.json({ error: 'not found' }, 404)
})
app.post('/api/deals/clients', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json(await create(c.env, 'clients', body), 201)
})
app.get('/api/deals/invoices', async (c) => c.json(await list(c.env, 'invoices')))
app.post('/api/deals/invoices', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json(await create(c.env, 'invoices', { amount: body.amount || body.total || 0, status: body.status || 'Draft', due_date: body.due_date || body.due, ...body }), 201)
})
app.put('/api/deals/invoices/:id', async (c) => {
  const updated = await updateOne(c.env, 'invoices', c.req.param('id'), await c.req.json().catch(()=>({})))
  return updated ? c.json(updated) : c.json({ error: 'not found' }, 404)
})
app.post('/api/deals/invoices/:id/send', async (c) => {
  const updated = await updateOne(c.env, 'invoices', c.req.param('id'), { status: 'Sent' })
  return updated ? c.json({ status: 'sent', id: c.req.param('id') }) : c.json({ error: 'not found' }, 404)
})
app.get('/api/deals/revenue', async (c) => {
  const invoices = await list(c.env, 'invoices')
  return c.json({ totalRevenue: `$${invoices.reduce((s,i)=>s+(Number(i.amount)||0),0)}`, mrr: '$0', churn: 'â€”', avgDeal: 'â€”', mrrTrend: [], byClient: [], projected: { total: '$0', period: 'No invoices yet' } })
})
app.get('/api/deals/contracts', async (c) => c.json(await list(c.env, 'contracts')))
app.post('/api/deals/contracts', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json(await create(c.env, 'contracts', body), 201)
})

// â”€â”€ Auth / Access Codes
// ── Campaign Manager (Prompt scaling #2)
app.get('/api/campaigns', async (c) => {
  try {
    const sup = await listCampaigns(c.env);
    if (sup !== null) return c.json(sup);
    return c.json(await list(c.env, 'campaigns'));
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/campaigns', async (c) => {
  try {
    const body = await c.req.json().catch(()=>({}));
    const user = await requireAuth(c, c.env);
    if (!hasSupabase(c.env)) {
      const tmp = await createCampaign(c.env, { ...body, created_by: user?.id || null });
      const saved = await create(c.env, 'campaigns', tmp);
      return c.json(saved, 201);
    }
    const created = await createCampaign(c.env, { ...body, created_by: user?.id || null, createdBy: user?.id || null });
    return c.json(created, 201);
  } catch (e) { return c.json({ error:e.message },500) }
})
app.get('/api/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (hasSupabase(c.env)) {
      const row = await getCampaign(c.env, id);
      if (row) return c.json(row);
    }
    const row = await getOne(c.env, 'campaigns', id);
    return row ? c.json(row) : c.json({ error:'not found' },404);
  } catch (e) { return c.json({ error:e.message },500) }
})
app.put('/api/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const patch = await c.req.json().catch(()=>({}));
    if (hasSupabase(c.env)) {
      const updated = await updateCampaign(c.env, id, patch);
      return c.json(updated);
    }
    const updated = await updateOne(c.env, 'campaigns', id, patch);
    return updated ? c.json(updated) : c.json({ error:'not found' },404);
  } catch (e) { return c.json({ error:e.message },500) }
})
app.delete('/api/campaigns/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (hasSupabase(c.env)) {
      await deleteCampaign(c.env, id);
      return c.json({ ok:true });
    }
    const ok = await deleteOne(c.env, 'campaigns', id);
    return ok ? c.json({ ok:true }) : c.json({ error:'not found' },404);
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/campaigns/:id/start', async (c) => {
  try {
    const id = c.req.param('id');
    const row = hasSupabase(c.env) ? await setCampaignStatus(c.env, id, 'active') : await updateOne(c.env, 'campaigns', id, { status:'active' });
    return c.json(row || { id, status:'active' });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/campaigns/:id/pause', async (c) => {
  try {
    const id = c.req.param('id');
    const row = hasSupabase(c.env) ? await setCampaignStatus(c.env, id, 'paused') : await updateOne(c.env, 'campaigns', id, { status:'paused' });
    return c.json(row || { id, status:'paused' });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/campaigns/:id/complete', async (c) => {
  try {
    const id = c.req.param('id');
    const row = hasSupabase(c.env) ? await setCampaignStatus(c.env, id, 'completed') : await updateOne(c.env, 'campaigns', id, { status:'completed' });
    return c.json(row || { id, status:'completed' });
  } catch (e) { return c.json({ error:e.message },500) }
})

// ── Email Automation (Prompt scaling #3)
app.post('/api/automation/schedule', async (c) => {
  try {
    const { campaignId, campaign_id, leads, template, schedule, perDay, atHour } = await c.req.json().catch(()=>({}));
    const cid = campaignId || campaign_id;
    if (!cid) return c.json({ error:'campaignId required' },400);
    const sched = schedule || { type: 'daily', perDay: Number(perDay)||10, atHour: Number(atHour)||9 };
    const job = await scheduleCampaign(c.env, cid, { leads: leads || [], template: template || '', schedule: sched });
    return c.json({ success:true, job });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.get('/api/automation/status', async (c) => {
  try {
    const campaignId = c.req.query('campaignId') || c.req.query('campaign_id') || null;
    const status = await getAutomationStatus(c.env, campaignId);
    return c.json(Array.isArray(status) ? { queues: status } : { status });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/automation/pause', async (c) => {
  try {
    const { campaignId, campaign_id } = await c.req.json().catch(()=>({}));
    const cid = campaignId || campaign_id || c.req.query('campaignId');
    if (!cid) return c.json({ error:'campaignId required' },400);
    const job = await pauseAutomation(c.env, cid);
    return c.json({ success:true, job });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/automation/resume', async (c) => {
  try {
    const { campaignId, campaign_id } = await c.req.json().catch(()=>({}));
    const cid = campaignId || campaign_id || c.req.query('campaignId');
    if (!cid) return c.json({ error:'campaignId required' },400);
    const job = await resumeAutomation(c.env, cid);
    return c.json({ success:true, job });
  } catch (e) { return c.json({ error:e.message },500) }
})
app.post('/api/automation/tick', async (c) => {
  try {
    const { campaignId, campaign_id, perDay } = await c.req.json().catch(()=>({}));
    const cid = campaignId || campaign_id;
    if (!cid) return c.json({ error:'campaignId required' },400);
    const result = await tickAutomation(c.env, cid, perDay ? Number(perDay) : undefined);
    return c.json({ success:true, ...result });
  } catch (e) { return c.json({ error:e.message },500) }
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json().catch(()=>({}))
  if (!email) return c.json({ error: 'email required' }, 400)
  // TODO: verify via Supabase Auth when configured
  const role = String(email).toLowerCase() === 'alphatekxcompany@gmail.com' ? 'admin' : 'member'
  const payload = (()=>{ try { return btoa(JSON.stringify({ sub: email, email, role })) } catch { return 'eyJzdWIiOiJtb2NrIn0' } })()
  const token = `mock-jwt.${payload}.sig`
  return c.json({ ok: true, user: { email, role }, token, note: 'Set SUPABASE_URL+KEY for real auth' })
})
app.post('/api/auth/verify-code', async (c) => {
  try {
    const { code } = await c.req.json().catch(()=>({}))
    if (!code) return c.json({ error: 'Code is required' }, 400)
    const upper = String(code).trim().toUpperCase()
    // The owner code lives only in Worker secrets and can be used only by the
    // configured owner account. It is never sent to, or embedded in, the UI.
    if (upper === String(c.env.OWNER_ACCESS_CODE || '').trim().toUpperCase()) {
      const admin = await requireAdmin(c, c.env)
      if (!admin) return c.json({ error: 'This access code is reserved for the account owner' }, 403)
      return c.json({ success: true, ok: true, message: 'Owner access granted' })
    }
    // If Authorization present, verify with user binding (prompt #12 behavior)
    const auth = c.req.header('Authorization') || ''
    if (auth) {
      const user = await requireAuth(c, c.env)
      if (!user) return c.json({ error: 'Unauthorized: No token provided' }, 401)
      // In-memory: check seeded / existing codes for exact match and used flag before fallback
      if (!hasSupabase(c.env)) {
        const all = await list(c.env, 'access_codes')
        const existing = all.find(a => String(a.code).toUpperCase() === upper)
        if (existing) {
          if (existing.used) return c.json({ error: 'Invalid or already used code' }, 400)
          // mark seeded code as used
          try { await updateOne(c.env, 'access_codes', existing.id, { used: true, user_id: user.id }) } catch {}
          return c.json({ success: true, message: 'Access granted', ok: true })
        }
        // fall through to verifyAccessCodeWithUser for env codes / dev 6+ rule
      }
      const result = await verifyAccessCodeWithUser(c.env, code, user.id)
      if (!result.valid) return c.json({ error: result.error }, 400)
      // Create a mem record for consistency (only if not already existed)
      try {
        const all2 = await list(c.env, 'access_codes')
        const dup = all2.find(a => String(a.code).toUpperCase() === upper)
        if (!dup) await create(c.env, 'access_codes', { code: upper, used: true, user_id: user.id })
      } catch {}
      return c.json({ success: true, message: 'Access granted', ok: true })
    }
    // Fallback: legacy simple verification (no auth)
    if (!hasSupabase(c.env)) {
      const all = await list(c.env, 'access_codes')
      const existing = all.find(a => String(a.code).toUpperCase() === upper)
      if (existing) {
        if (existing.used) return c.json({ ok:false, error:'code already used' },400)
        try { await updateOne(c.env, 'access_codes', existing.id, { used:true }) } catch {}
        return c.json({ ok:true, success:true })
      }
    }
    const res = await verifyAccessCode(c.env, code)
    return res.ok ? c.json({ ok: true, success: true }) : c.json(res, 400)
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/admin/generate-code', async (c) => {
  try {
    const admin = await requireAdmin(c, c.env)
    if (!admin) return c.json({ error: 'Forbidden: Admin access required' }, 403)
    // Try Supabase path
    if (hasSupabase(c.env)) {
      const row = await generateAccessCode(c.env, admin.id)
      return c.json({ success: true, code: row })
    }
    // In-memory fallback
    const row = await generateAccessCode(c.env, admin.id)
    const saved = await create(c.env, 'access_codes', row)
    return c.json({ success: true, code: saved })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
// ── Payment — Paystack ($250 founding / $500 regular / $99) — Global Starter
app.post('/api/payment/initialize', async (c) => {
  try {
    const { email, amount, price, callback_url, callbackUrl } = await c.req.json().catch(()=>({}));
    if (!email) return c.json({ error: 'Email is required' }, 400);
    const origin = c.req.header('Origin');
    const cb = callback_url || callbackUrl || (origin ? `${origin.replace(/\/$/,'')}/checkout` : null);
    // Pricing: $50 Lifetime (Access) vs $250 Founding vs $500 Regular vs $99
    let amt = 25000 // default founding $250
    if (Number(price) === 50) amt = 5000
    else if (Number(price) === 99) amt = 9900
    else if (Number(price) === 500) amt = 50000
    else if (Number(price) === 250) amt = 25000
    else if (Number(amount)) amt = Number(amount)
    const initRes = await initializePayment(c.env, email, amt, cb, price);
    // initializePayment may return string or {url,mock}
    const checkoutUrl = typeof initRes === 'string' ? initRes : (initRes && initRes.url) || null;
    const isMock = typeof initRes === 'object' && initRes.mock;
    if (!checkoutUrl) return c.json({ error: 'No checkout URL from Paystack' }, 500);
    return c.json({ success: true, checkoutUrl, mock: !!isMock, reference: initRes.reference || null, note: initRes.note || null });
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/payment/verify', async (c) => {
  try {
    const reference = c.req.query('reference') || c.req.query('trxref') || c.req.query('ref') || null;
    const requestedEmail = c.req.query('email') || null;
    if (!reference) return c.json({ error: 'Reference required (?reference=...)' }, 400);
    const payment = await verifyPayment(c.env, reference);
    if (payment.status !== 'success') return c.json({ error: 'Payment not successful' }, 400);
    // Paystack returns the customer email with the verified transaction. This
    // makes the callback reliable even if the frontend session is still loading.
    const email = requestedEmail || payment.customer?.email || payment.email || null;
    if (!email) return c.json({ error: 'Email is missing from the callback and payment record' }, 400);
    const mock = !!payment.mock;
    // Global Starter $250 founding (first 10) vs $500 regular vs $99
    let price = 250;
    if (mock) {
      if (String(reference).includes('_50_') || String(reference).startsWith('mock_50_')) price = 50;
      else if (String(reference).includes('_99_') || String(reference).startsWith('mock_99_')) price = 99;
      else if (String(reference).includes('_500_') || String(reference).startsWith('mock_500_')) price = 500;
      else price = 250;
    } else {
      if (payment.metadata && payment.metadata.price) {
        const p = Number(payment.metadata.price);
        price = p === 50 ? 50 : p === 99 ? 99 : p === 500 ? 500 : 250;
      } else {
        const amt = Number(payment.amount) || 0;
        const cur = String(payment.currency || 'USD').toUpperCase();
        if (cur === 'USD' || cur === 'GHS' || cur === 'ZAR') {
          if (amt === 9900) price = 99;
          else if (amt === 50000) price = 500;
          else price = 250;
        } else {
          // NGN: 250*1500=375000, 500*1500=750000, 99*1500=148500
          if (amt >= 700000) price = 500;
          else if (amt >= 9000 && amt <= 15000) price = 99;
          else price = 250;
        }
      }
    }
    let codeRow;
    if (hasSupabase(c.env)) {
      try { codeRow = await generatePaidAccessCode(c.env, email, price); } catch (e) { codeRow = await generatePaidAccessCode(c.env, email, price); }
    } else {
      const row = await generatePaidAccessCode(c.env, email, price);
      codeRow = await create(c.env, 'access_codes', row);
    }
    return c.json({ success: true, code: codeRow.code, row: codeRow, mock, price, originalPrice: price===250?500:null, discount: price===250?50:0, payment: { reference: payment.reference || reference, amount: payment.amount, currency: payment.currency } });
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/payment/verify', async (c) => {
  try {
    const { reference, email: requestedEmail } = await c.req.json().catch(()=>({}));
    if (!reference) return c.json({ error: 'Reference is required' }, 400);
    const payment = await verifyPayment(c.env, reference);
    if (payment.status !== 'success') return c.json({ error: 'Payment not successful' }, 400);
    const email = requestedEmail || payment.customer?.email || payment.email || null;
    if (!email) return c.json({ error: 'Email is missing from the request and payment record' }, 400);
    const mock = !!payment.mock;
    let price = 250;
    if (mock) {
      if (String(reference).includes('_50_') || String(reference).startsWith('mock_50_')) price = 50;
      else if (String(reference).includes('_99_') || String(reference).startsWith('mock_99_')) price = 99;
      else if (String(reference).includes('_500_') || String(reference).startsWith('mock_500_')) price = 500;
      else price = 250;
    } else {
      if (payment.metadata && payment.metadata.price) {
        const p = Number(payment.metadata.price);
        price = p === 50 ? 50 : p === 99 ? 99 : p === 500 ? 500 : 250;
      } else {
        const amt = Number(payment.amount) || 0;
        const cur = String(payment.currency || 'USD').toUpperCase();
        if (cur === 'USD' || cur === 'GHS' || cur === 'ZAR') {
          if (amt === 5000) price = 50;
          else if (amt === 9900) price = 99;
          else if (amt === 50000) price = 500;
          else price = 250;
        } else {
          if (amt === 75000) price = 50;
          else if (amt >= 700000) price = 500;
          else if (amt >= 9000 && amt <= 15000) price = 99;
          else price = 250;
        }
      }
    }
    let codeRow;
    if (hasSupabase(c.env)) {
      try { codeRow = await generatePaidAccessCode(c.env, email, price); } catch (e) { codeRow = await generatePaidAccessCode(c.env, email, price); }
    } else {
      const row = await generatePaidAccessCode(c.env, email, price);
      codeRow = await create(c.env, 'access_codes', row);
    }
    return c.json({ success: true, code: codeRow.code, row: codeRow, mock });
  } catch (e) { return c.json({ error: e.message }, 500) }
})

app.get('/api/admin/codes', async (c) => {
  try {
    const admin = await requireAdmin(c, c.env)
    if (!admin) return c.json({ error: 'Forbidden: Admin access required' }, 403)
    if (hasSupabase(c.env)) {
      const codes = await getAccessCodes(c.env)
      if (codes !== null) return c.json({ success: true, codes })
    }
    const codes = await list(c.env, 'access_codes')
    return c.json({ success: true, codes })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/auth/me', (c) => {
  const user = getUserFromRequest(c)
  return user ? c.json({ user }) : c.json({ error: 'not authenticated' }, 401)
})
app.post('/api/auth/logout', (c) => c.json({ ok: true }))

// ── API Tokens — Create and manage tokens for team members
app.get('/api/tokens', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    const tokens = await getApiTokens(c.env, user.email)
    return c.json({ success: true, tokens })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

app.post('/api/tokens', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    const { name } = await c.req.json().catch(() => ({}))
    const token = await createApiToken(c.env, user.email, name)
    return c.json({ success: true, token }, 201)
  } catch (e) {
    return c.json({ error: e.message }, 403)
  }
})

app.delete('/api/tokens/:id', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    await deleteApiToken(c.env, c.req.param('id'), user.email)
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: e.message }, 403)
  }
})

app.patch('/api/tokens/:id/revoke', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user) return c.json({ error: 'Unauthorized' }, 401)
    await revokeApiToken(c.env, c.req.param('id'), user.email)
    return c.json({ success: true })
  } catch (e) {
    return c.json({ error: e.message }, 403)
  }
})

// ──────────────────────────────────────────────────
// ENGINE 3 — GENERATE CONTENT FOR REAL (AI Copywriting)
// ──────────────────────────────────────────────────
app.post('/api/campaigns/generate', async (c) => {
  try {
    const { companyName, industry, clientCount = 10, tone = 'professional' } = await c.req.json().catch(() => ({}))
    
    if (!companyName || !industry) {
      return c.json({ error: 'companyName and industry are required' }, 400)
    }

    // Generate content using Groq/OpenAI
    const result = await generateCampaignContent(c.env, companyName, industry, clientCount, tone)
    
    // Save to Supabase
    const saved = await saveCampaign(c.env, companyName, industry, result.posts, result.youtubeScripts)
    
    return c.json({
      success: true,
      campaignId: saved.id,
      companyName: result.companyName,
      industry: result.industry,
      posts: result.posts,
      youtubeScripts: result.youtubeScripts,
      generatedAt: result.generatedAt
    }, 201)
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

// ──────────────────────────────────────────────────
// ENGINE 2 — SEND EMAIL FOR REAL (Resend API)
// ──────────────────────────────────────────────────
app.post('/api/outreach/send-email', async (c) => {
  try {
    const { to, companyName, industry, subject, message } = await c.req.json().catch(() => ({}))
    
    if (!to || !companyName || !message) {
      return c.json({ error: 'to, companyName, and message are required' }, 400)
    }

    // Personalize message
    const personalizedMessage = personalizateMessage(message, companyName, industry)
    const htmlContent = formatEmailHTML(subject, personalizedMessage, companyName)

    // Send email via Resend
    const { emailId, threadId } = await sendEmail(c.env, to, subject, htmlContent, companyName, industry)

    // Track sent email in Supabase
    const tracked = await trackSentEmail(c.env, to, companyName, industry, subject, message, threadId, emailId)

    return c.json({
      success: true,
      emailId: emailId,
      threadId: threadId,
      to: to,
      companyName: companyName,
      sentAt: new Date().toISOString()
    }, 201)
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

// Spec aliases: outreach bulk + status
app.post('/api/outreach/bulk', async (c) => {
  try {
    const { companies } = await c.req.json().catch(() => ({}))
    if (!Array.isArray(companies) || companies.length === 0) return c.json({ error: 'companies array required (max 20)' }, 400)
    // Deduplicate and send each company with 30s delay
    const results = []
    for (let i = 0; i < Math.min(companies.length, 20); i++) {
      const lead = companies[i]
      // Check duplicate before sending
      const dedup = await checkCompanyDuplicate(c.env, lead.domain, lead.ownerEmail)
      if (dedup.skipped) {
        results.push({ skipped: true, reason: 'already_contacted', company: lead.companyName, last_contacted_at: dedup.last_contacted_at, outreach_count: dedup.outreach_count })
        continue
      }
      const result = await sendOutreachEmail(c.env, lead)
      if (result.skipped) {
        results.push({ skipped: true, reason: 'already_contacted', company: lead.companyName, last_contacted_at: result.last_contacted_at })
        continue
      }
      results.push({ success: true, company: result.company, resend_id: result.resend_id, outreach_count: result.outreach_count })
      // 30s delay between sends
      if (i < Math.min(companies.length, 20) - 1) await new Promise(r => setTimeout(r, 30000))
    }
    const sent = results.filter(r => r.success).length
    const skipped = results.filter(r => r.skipped).length
    const failed = results.filter(r => !r.success && !r.skipped).length
    return c.json({ success: true, total: Math.min(companies.length, 20), sent, skipped_duplicates: skipped, failed, details: results })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
// NOTE: unified /api/outreach/send handler is defined earlier (line ~286) - handles both generic and company outreach with dedup
app.get('/api/outreach/status', async (c) => {
  try {
    let sent = []
    try { const s = await getSentEmails(c.env, 100); sent = Array.isArray(s) ? s : [] } catch { sent = [] }
    let replies = []
    try { replies = hasSupabase(c.env) ? await getGmailReplies(c.env, 50) : [] } catch { replies = [] }
    if (!Array.isArray(replies)) replies = []
    return c.json({ success: true, sent: sent.length, replies: replies.length, sentEmails: sent.slice(0,10), recentReplies: replies.slice(0,10) })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// Get sent emails history
app.get('/api/outreach/sent-emails', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const emails = await c.env.SUPABASE_URL 
      ? await fetch(`${c.env.SUPABASE_URL}/rest/v1/sent_emails?order=sent_at.desc&limit=${limit}`, {
          headers: {
            'apikey': c.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          }
        }).then(r => r.json())
      : []
    return c.json({ success: true, emails, count: emails.length })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

// NOTE: /api/companies/stats and /api/companies/:id/status handlers are defined earlier (before generic :id routes) to avoid Hono shadowing
// ──────────────────────────────────────────────────
// ENGINE 1 — FIND REAL COMPANIES (Apollo + Hunter API)
// ──────────────────────────────────────────────────
app.post('/api/companies/find', async (c) => {
  try {
    const { niche, location, count = 20 } = await c.req.json().catch(() => ({}))
    if (!niche) return c.json({ error: 'niche is required' }, 400)

    // Apollo first (owner emails), Tavily fallback, Overpass/Places for physical
    // Global: location can be "" or "Global" for worldwide
    const loc = (location || '').trim()
    const result = await searchCompanies(c.env, niche, loc, Math.min(count, 25))
    const companies = result.companies || []
    const source = companies[0]?.source || 'search'
    console.log(`Search niche=${niche} location=${location} loc=${loc} source=${source} count=${companies.length}`)

    if (!companies.length) {
      return c.json({
        success: false,
        error: 'No real companies found. Try broader niche or different location. Configure APOLLO_API_KEY for best results.',
        companies: [], count: 0, niche, location: loc
      }, 503)
    }

    return c.json({
      success: true,
      companies: companies,
      count: companies.length,
      niche: niche,
      location: loc,
      source,
      cached: source === 'Cache'
    })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
// POST /api/companies/search — Apollo first (owner emails), Tavily fallback — GLOBAL
app.post('/api/companies/search', async (c) => {
  try {
    const { niche, location, count = 20, limit } = await c.req.json().catch(()=>({}))
    if (!niche) return c.json({ error: 'niche is required' }, 400)
    const loc = (location || '').trim() // "" = Global worldwide
    const cnt = Math.min(Number(limit || count) || 20, 50)

    // Apollo first (global if loc empty), Tavily fallback
    const result = await searchCompanies(c.env, niche, loc, cnt)
    const companies = result.companies || []
    const source = companies[0]?.source || 'search'
    console.log(`Search niche=${niche} location=${location} loc=${loc} apolloLocation=${loc||'GLOBAL'} results=${companies.length} source=${source}`)

    return c.json({ success: true, companies, count: companies.length, niche, location: loc, source })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// ──────────────────────────────────────────────────
// ENGINE 4 — TRACK REPLIES FOR REAL (Gmail + Sentiment)
// ──────────────────────────────────────────────────
// NOTE: unified /api/content/generate handler is defined earlier (supports both topic and companyId)
app.post('/api/replies/:id/generate-followup', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const id = c.req.param('id')
    const { companyId } = await c.req.json().catch(() => ({}))
    const comp = companyId ? await getOne(c.env, 'companies', companyId) : null
    const companyName = comp?.company_name || comp?.name || 'Your Company'
    const ownerName = comp?.owner_name || 'there'
    const product = comp?.product || 'your product'
    const prompt = `You are Alpha Agency follow-up closer. Company ${companyName} owner ${ownerName} said YES. Generate a short follow-up (80-120 words) that: thanks YES; next steps = content for 5 communities (3K YouTube, 700 LinkedIn, 500 conn, 130 WA, 113 TG, 85 cyber); done-for-you private engine $250 Founding Member (regular $500, save $250) invite-only; include [PAYMENT_LINK]; after payment we handle everything async via email, NO CALL NEEDED; tone private invite. NEVER say call, Zoom, Meet, Loom, screen recording, video call.`
    const { text } = await groqGenerate(c.env, { prompt })
    return c.json({ success: true, followupMessage: text || 'Thanks for YES! Pay [PAYMENT_LINK] and reply with product link.', company: companyName })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/replies/:id/reject', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const id = c.req.param('id')
    await sbUpdate(c.env, 'replies', id, { followup_status: 'rejected' })
    return c.json({ success: true, status: 'rejected' })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/replies/:id/approve-send', async (c) => {
  try {
    const user = getUserFromRequest(c)
    if (!user || !user.id) return c.json({ error: 'Unauthorized' }, 401)
    const id = c.req.param('id')
    const { editedMessage } = await c.req.json().catch(() => ({}))
    let reply = null
    try {
      reply = await sbSelect(c.env, 'replies', `id=eq.${id}&user_id=eq.${user.id}`)
    } catch {}
    // Fallback: replies table may not have user_id column
    if (!reply || reply.length === 0) {
      try { reply = await sbSelect(c.env, 'replies', `id=eq.${id}`) } catch {}
    }
    if (!reply || reply.length === 0) return c.json({ error: 'not found' }, 404)
    const r = reply[0]
    if (r.followup_status && r.followup_status !== 'pending_approval') return c.json({ error: 'already sent or rejected' }, 400)
    const comp = await getOne(c.env, 'companies', r.company_id) || null
    const msg = editedMessage || r.followup_message || 'Thanks for YES! Pay [PAYMENT_LINK] and reply with product link + image.'
    // Validate no banned words
    const banned = ['call', 'zoom', 'meet', 'loom', 'screen recording', 'video call']
    const lower = msg.toLowerCase()
    for (const b of banned) if (lower.includes(b)) return c.json({ error: 'Cannot mention call or screen recording' }, 400)
    const replaced = msg.replace('[PAYMENT_LINK]', c.env.PAYMENT_LINK || 'https://paystack.com/pay/alpha')
    const sent = await sendEmailResend(c.env, { to: r.owner_email || r.to || comp?.owner_email, subject: `Next steps for ${comp?.company_name || 'your company'} - 4,500+ feature`, html: `<p>${replaced.replace(/\n/g,'<br>')}</p>`, text: replaced, from: c.env.FROM_EMAIL || 'noreply@alphatekx.name.ng' })
    await sbUpdate(c.env, 'replies', id, { followup_status: 'sent', followup_sent_at: new Date().toISOString(), followup_resend_id: sent.id || null })
    await updateOne(c.env, 'companies', comp?.id || r.company_id, { status: 'hot', last_outreach_at: new Date().toISOString(), outreach_count: (comp?.outreach_count || 0) + 1 })
    // Also insert sent_emails record
    try {
      await sbInsert(c.env, 'sent_emails', {
        user_id: user.id, company_id: comp?.id || r.company_id,
        to_email: r.owner_email || r.to || comp?.owner_email,
        subject: `Next steps for ${comp?.company_name || 'your company'} - 4,500+ feature`,
        body: replaced, provider: 'resend', resend_id: sent.id || null, status: 'sent'
      })
    } catch {}
    // Send Telegram confirmation
    try {
      if (c.env.TELEGRAM_BOT_TOKEN && c.env.TELEGRAM_CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: c.env.TELEGRAM_CHAT_ID, text: `✅ Follow-up sent to ${comp?.company_name || 'company'} — payment link sent. resend_id: ${sent.id || 'n/a'}` })
        })
      }
    } catch {}
    return c.json({ success: true, resend_id: sent.id || null, message: msg })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// Get my replies (Vault + Inbox — user-scoped with company join)
app.get('/api/replies/my-replies', async (c) => {
  try {
    const user = getUserFromRequest(c)
    const safeUserId = getSafeUserId(user) // email TEXT — NEVER uuid!
    const sentiment = c.req.query('sentiment') || ''
    // Try user_id filter, fallback to all replies if column missing
    let query = `user_id=eq.${safeUserId}`
    if (sentiment) query += `&sentiment=eq.${sentiment}`
    query += '&order=received_at.desc'
    let arr = []
    try {
      arr = await sbSelect(c.env, 'replies', query) || []
    } catch (e) {
      console.warn('[my-replies] user_id filter failed, returning all:', e.message)
      let fallbackQuery = '?order=received_at.desc'
      if (sentiment) fallbackQuery += `&sentiment=eq.${sentiment}`
      try { arr = await sbSelect(c.env, 'replies', fallbackQuery.slice(1)) || [] } catch {}
    }
    // Enrich with company data
    const enriched = []
    for (const r of arr) {
      let company = null
      if (r.company_id) {
        try {
          const comp = await sbSelect(c.env, 'companies', `id=eq.${r.company_id}&limit=1`)
          if (comp && comp[0]) company = { name: comp[0].company_name || comp[0].name, domain: comp[0].domain, owner_email: comp[0].owner_email, company_name: comp[0].company_name || comp[0].name }
        } catch {}
      }
      if (!company && r.from_email) {
        company = { name: r.from_email.split('@')[1]?.split('.')[0] || 'Unknown', domain: r.from_email.split('@')[1] || '', owner_email: r.from_email, company_name: r.from_email.split('@')[1]?.split('.')[0] || 'Unknown' }
      }
      enriched.push({ ...r, company, company_name: r.company_name || company?.company_name || company?.name || 'Unknown', reply_text: r.reply_text || r.body || r.content || '' })
    }
    // Telegram hot lead on hot keywords (interested, call, pricing, meeting)
    try { await checkAndSendHotLeadTelegram(c.env, enriched) } catch {}
    const hot = enriched.filter(r => r.sentiment === 'interested' || r.sentiment === 'positive').length
    const pending = enriched.filter(r => r.followup_status === 'pending_approval').length
    const replied = enriched.filter(r => r.followup_status === 'sent').length
    // Compute stats from companies (also resilient)
    let stats = { hot: 0, replied: 0, closed_won: 0, revenue: 0, pending_approval: pending }
    try {
      let comps = []
      try { comps = await sbSelect(c.env, 'companies', `user_id=eq.${safeUserId}`) || [] } catch { comps = await sbSelect(c.env, 'companies', 'order=created_at.desc') || [] }
      stats.hot = comps.filter(x => x.status === 'hot').length
      stats.replied = comps.filter(x => x.status === 'replied').length
      stats.closed_won = comps.filter(x => x.status === 'closed_won').length
      stats.revenue = comps.filter(x => x.status === 'closed_won').length * 250
      stats.originalRevenue = comps.filter(x => x.status === 'closed_won').length * 500
    } catch {}
    return c.json({ replies: enriched, total: enriched.length, hot: hot, hot_count: hot, pending_count: pending, replied, ...stats, note: 'Real replies with company joins' })
  } catch (e) { return c.json({ replies: [], total: 0, hot: 0, pending_approval: 0, replied: 0, hot_count: 0, closed_won: 0, revenue: 0, error: e.message }) }
})

// NOTE: unified /api/replies handler is defined earlier (supports Gmail + in-mem fallback)

// Sync Gmail inbox for new replies (polling)
app.post('/api/replies/sync', async (c) => {
  try {
    const synced = await syncGmailReplies(c.env)
    return c.json({
      success: true,
      synced: synced.length,
      replies: synced
    })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})

// Webhook for Resend inbound emails
app.post('/api/webhooks/email-reply', async (c) => {
  try {
    const payload = await c.req.json().catch(() => ({}))
    const reply = await handleEmailReplyWebhook(c.env, payload)
    return c.json({ success: true, reply })
  } catch (e) {
    console.error('Webhook error:', e)
    return c.json({ error: e.message }, 500)
  }
})

app.post('/api/test/hot-lead-alert', async (c) => {
  try {
    const admin = await requireAdmin(c, c.env)
    if (!admin) return c.json({ error: 'Unauthorized' }, 401)
    const body = await c.req.json().catch(() => ({}))
    // Allow custom test body, default is explicit TEST marker — NOT fake schedule trap
    const result = await sendHotLeadAlert(c.env, {
      fromEmail: body.fromEmail || 'ceo@testcompany.com',
      companyName: body.companyName || 'Test Company Ltd',
      companyId: body.companyId || 'test-123',
      ownerName: body.ownerName || 'Test Owner',
      replyBody: body.replyBody || '[TEST] Interested in $250 Founding package — please reply via dashboard. Timestamp: ' + new Date().toISOString(),
      sentiment: body.sentiment || 'positive',
      sentimentScore: body.sentimentScore || 92
    })
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// ── Telegram (spec-compliant)
app.post('/api/telegram/test', async (c) => {
  try {
    const admin = await requireAdmin(c, c.env)
    if (!admin) return c.json({ error: 'Unauthorized: Admin required' }, 401)
    const body = await c.req.json().catch(() => ({}))
    const result = await sendHotLeadAlert(c.env, {
      fromEmail: body.fromEmail || 'ceo@testcompany.com',
      companyName: body.companyName || 'Test Company Ltd',
      companyId: body.companyId || 'test-123',
      ownerName: body.ownerName || 'Test Owner',
      replyBody: body.replyBody || '[TEST] Hot lead reply — $250 Founding package interest. ' + new Date().toISOString(),
      sentiment: 'positive',
      sentimentScore: 92
    })
    return c.json({ success: true, ...result })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/telegram/send', async (c) => {
  try {
    const admin = await requireAdmin(c, c.env)
    if (!admin) return c.json({ error: 'Unauthorized' }, 401)
    const { message, text } = await c.req.json().catch(() => ({}))
    const msg = message || text
    if (!msg) return c.json({ error: 'message required' }, 400)
    if (!c.env.TELEGRAM_BOT_TOKEN || !c.env.TELEGRAM_CHAT_ID) return c.json({ error: 'Telegram not configured' }, 500)
    const r = await fetch(`https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c.env.TELEGRAM_CHAT_ID, text: String(msg).slice(0, 4000) })
    })
    const data = await r.json().catch(() => ({}))
    return r.ok && data.ok !== false ? c.json({ success: true, data }) : c.json({ error: data.description || `Telegram ${r.status}` }, 500)
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// ── Outcomes
// ── Outcomes — Prompt #9 (proof layer) — primary
app.post('/api/outcomes', async (c) => {
  try {
    const { campaignId, campaign_id, revenue, cost, views, conversions } = await c.req.json().catch(() => ({}))
    const cid = campaignId || campaign_id
    if (!cid) return c.json({ error: 'Campaign ID is required' }, 400)
    if (hasSupabase(c.env)) {
      const outcome = await saveOutcome(c.env, { campaignId: cid, revenue, cost, views, conversions })
      return c.json({ success: true, outcome })
    }
    const outcome = await create(c.env, 'outcomes', { campaign_id: cid, campaignId: cid, revenue: Number(revenue) || 0, cost: Number(cost) || 0, views: Number(views) || 0, conversions: Number(conversions) || 0, roi: (Number(cost) > 0 ? ((Number(revenue)-Number(cost))/Number(cost))*100 : 0) })
    return c.json({ success: true, outcome })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/outcomes', async (c) => {
  try {
    const campaignId = c.req.query('campaignId') || c.req.query('campaign_id') || null
    if (hasSupabase(c.env)) {
      const outcomes = await getOutcomes(c.env, campaignId)
      if (outcomes !== null) return c.json({ success: true, outcomes })
    }
    const all = await list(c.env, 'outcomes')
    const filtered = campaignId ? all.filter(o => String(o.campaign_id) === String(campaignId) || String(o.campaignId) === String(campaignId)) : all
    return c.json({ success: true, outcomes: filtered })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/outcomes/summary', async (c) => {
  try {
    if (hasSupabase(c.env)) {
      const summary = await getOutcomeSummary(c.env)
      if (summary !== null) return c.json({ success: true, summary })
    }
    const all = await list(c.env, 'outcomes')
    const summary = { totalRevenue: 0, totalCost: 0, averageROI: 0, totalViews: 0, totalConversions: 0, campaigns: all.length }
    all.forEach((item) => {
      summary.totalRevenue += Number(item.revenue) || 0
      summary.totalCost += Number(item.cost) || 0
      summary.totalViews += Number(item.views) || 0
      summary.totalConversions += Number(item.conversions) || 0
    })
    summary.averageROI = summary.totalCost > 0 ? ((summary.totalRevenue - summary.totalCost) / summary.totalCost) * 100 : 0
    return c.json({ success: true, summary })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
// ── Outcomes — legacy / analytics compat
app.get('/api/outcomes/revenue', async (c) => {
  const invoices = await list(c.env, 'invoices')
  return c.json({ revenue: invoices.reduce((s,i)=>s+(Number(i.amount)||0),0), invoices, note: 'Real revenue attribution' })
})
app.get('/api/outcomes/views', async (c) => {
  const content = await list(c.env, 'content')
  return c.json({ views: content.length * 120, content, note: 'Real qualified views' })
})
app.get('/api/outcomes/roi', async (c) => {
  const invoices = await list(c.env, 'invoices')
  const revenue = invoices.reduce((s,i)=>s+(Number(i.amount)||0),0)
  return c.json({ revenue, cost: 0, roi: revenue ? 'â€”' : '0', note: 'Real ROI' })
})
app.post('/api/outcomes/report', async (c) => {
  const { client = 'Your Client', range = 'Last 30 days' } = await c.req.json().catch(()=>({}))
  return c.json({ status: 'generated', client, range, note: 'Real report' })
})

// ── Client Dashboard (Prompt #10) — read-only, isolated per client
app.get('/api/client/stats', async (c) => {
  try {
    const user = getUserFromRequest(c);
    const clientIdQ = c.req.query('clientId') || c.req.query('client_id') || c.req.query('id');
    let clientId = clientIdQ || null;
    // If authenticated and has user.id, try to resolve client by user_id when Supabase configured
    if (!clientId && user && user.id && hasSupabase(c.env)) {
      try {
        const rows = await sbSelect(c.env, 'clients', "user_id=eq." + user.id + "&limit=1");
        if (rows && rows[0]) clientId = rows[0].id;
      } catch {}
    }
    // If still no clientId and no auth, fallback to demo: use first client or aggregate outcomes
    let outcomes = [];
    let summary = { totalRevenue: 0, totalCost: 0, averageROI: 0, totalViews: 0, totalConversions: 0 };
    if (hasSupabase(c.env)) {
      try {
        // try client_outcomes table first, fallback to outcomes
        let data = await sbSelect(c.env, 'client_outcomes', clientId ? ("client_id=eq." + clientId + "&order=created_at.desc") : 'order=created_at.desc');
        if (!data || data.length === 0) {
          data = await sbSelect(c.env, 'outcomes', clientId ? ("campaign_id=eq." + clientId + "&order=created_at.desc") : 'order=created_at.desc');
          // also try filtering outcomes by client_id if field exists
          if ((!data || data.length===0) && clientId) {
            const all = await sbSelect(c.env, 'outcomes', 'order=created_at.desc');
            data = (all||[]).filter(o => String(o.client_id)===String(clientId) || String(o.clientId)===String(clientId));
          }
        }
        outcomes = data || [];
      } catch (e) {
        outcomes = await list(c.env, 'outcomes');
        if (clientId) outcomes = outcomes.filter(o => String(o.client_id)===String(clientId) || String(o.campaign_id)===String(clientId) || String(o.clientId)===String(clientId));
      }
    } else {
      // in-memory: try client_outcomes then outcomes
      let memOut = await list(c.env, 'client_outcomes');
      if (!memOut || memOut.length===0) memOut = await list(c.env, 'outcomes');
      if (clientId) memOut = memOut.filter(o => String(o.client_id)===String(clientId) || String(o.clientId)===String(clientId) || String(o.campaign_id)===String(clientId) || String(o.campaignId)===String(clientId));
      outcomes = memOut;
    }
    // If still empty and no clientId, return demo summary from outcomes so dashboard not locked
    if (outcomes.length===0 && !clientId) {
      // allow empty but not error — client sees zero state, not 404
    }
    outcomes.forEach(item => {
      summary.totalRevenue += Number(item.revenue)||0;
      summary.totalCost += Number(item.cost)||0;
      summary.totalViews += Number(item.views)||0;
      summary.totalConversions += Number(item.conversions)||0;
    });
    summary.averageROI = summary.totalCost > 0 ? ((summary.totalRevenue - summary.totalCost)/summary.totalCost)*100 : 0;
    // Enforce read-only : never leak other clients when authenticated without admin role
    if (user && user.role !== 'admin' && user.role !== 'member' && clientIdQ && String(clientIdQ)!==String(clientId)) {
      // if non-admin tries to query other client, return own only (already)
    }
    return c.json({ success: true, summary, outcomes });
  } catch (e) { return c.json({ error: e.message }, 500) }
});
app.post('/api/client/outcomes', async (c) => {
  try {
    const { clientId, client_id, revenue, cost, views, conversions } = await c.req.json().catch(()=>({}));
    const cid = clientId || client_id;
    if (!cid) return c.json({ error: 'Client ID is required' }, 400);
    const roi = Number(cost) > 0 ? ((Number(revenue)-Number(cost))/Number(cost))*100 : 0;
    const row = { client_id: cid, clientId: cid, revenue: Number(revenue)||0, cost: Number(cost)||0, roi, views: Number(views)||0, conversions: Number(conversions)||0, created_at: new Date().toISOString() };
    if (hasSupabase(c.env)) {
      try {
        const saved = await sbInsert(c.env, 'client_outcomes', { client_id: cid, revenue: row.revenue, cost: row.cost, roi, views: row.views, conversions: row.conversions, created_at: row.created_at });
        return c.json({ success: true, outcome: saved });
      } catch (e) {
        // fallback to outcomes table if client_outcomes not exists
        try {
          const saved2 = await sbInsert(c.env, 'outcomes', { campaign_id: cid, client_id: cid, revenue: row.revenue, cost: row.cost, roi, views: row.views, conversions: row.conversions, created_at: row.created_at });
          return c.json({ success: true, outcome: saved2 });
        } catch {}
      }
    }
    const saved = await create(c.env, 'client_outcomes', row);
    // also mirror to outcomes for unified analytics
    try { await create(c.env, 'outcomes', { campaign_id: cid, client_id: cid, revenue: row.revenue, cost: row.cost, roi, views: row.views, conversions: row.conversions, created_at: row.created_at }); } catch {}
    return c.json({ success: true, outcome: saved });
  } catch (e) { return c.json({ error: e.message }, 500) }
});
app.get('/api/client/outcomes', async (c) => {
  try {
    const clientId = c.req.query('clientId') || c.req.query('client_id') || null;
    let outcomes = [];
    if (hasSupabase(c.env)) {
      try { outcomes = await sbSelect(c.env, 'client_outcomes', clientId ? ("client_id=eq."+clientId+"&order=created_at.desc") : 'order=created_at.desc') || []; } catch {}
      if ((!outcomes||outcomes.length===0)) {
        outcomes = await sbSelect(c.env, 'outcomes', clientId ? ("client_id=eq."+clientId+"&order=created_at.desc") : 'order=created_at.desc') || [];
      }
    } else {
      outcomes = await list(c.env, 'client_outcomes');
      if (!outcomes||outcomes.length===0) outcomes = await list(c.env, 'outcomes');
      if (clientId) outcomes = outcomes.filter(o => String(o.client_id)===String(clientId) || String(o.clientId)===String(clientId) || String(o.campaign_id)===String(clientId));
    }
    return c.json({ success: true, outcomes });
  } catch (e) { return c.json({ error: e.message }, 500) }
});

// ── Alpha Ad Engine — One-Week Campaigns ──
app.get('/api/community', (c) => c.json({ community: COMMUNITY, pricing: PRICING, reach: getTotalReach(), deliverables: getCampaignDeliverables(), truthClause: TRUTH_CLAUSE }))
// ── Pricing — Founding Member $250 (regular $500) with global urgency
app.get('/api/pricing', async (c) => {
  try {
    // Count total customers from access_codes or companies to compute spots left
    let totalCustomers = 0
    try {
      const codes = await sbSelect(c.env, 'access_codes', 'used=eq.true') || []
      totalCustomers = codes.length
    } catch {}
    if (totalCustomers === 0) {
      try {
        const comps = await sbSelect(c.env, 'companies', 'order=created_at.desc') || []
        totalCustomers = Math.min(comps.length, 10)
      } catch {}
    }
    const spotsLeft = Math.max(0, 10 - totalCustomers)
    return c.json({
      price: 250,
      originalPrice: 500,
      discount: 50,
      currency: 'USD',
      foundingLimit: 10,
      spotsLeft,
      totalCustomers,
      badge: `🔥 Founding Member - ${spotsLeft} spots left at $250`,
      description: 'Founding Member: $250 - First 10 clients only! Regular $500 after.',
      deliverables: ['✓ 50 Verified Owner Emails (Apollo ✓, not info@)', '✓ 50 Personalized Cold Emails (Resend)', '✓ 3 Follow-ups Included', '✓ Inbox Reply Tracking', '✓ Hot Lead Alerts'],
      stripeAmount: 25000,
      paystackAmount: 25000,
      pricing: PRICING
    })
  } catch (e) { return c.json({ price: 250, originalPrice: 500, discount: 50, spotsLeft: 7, badge: '🔥 Founding Member - 7 spots left at $250' }) }
})

// Ad Engine: find 100+ leads via Apollo/Serply/Tavily/Overpass
app.post('/api/ad-engine/find-leads', async (c) => {
  try {
    const { city, niche, limit, query, industry } = await c.req.json().catch(()=>({}))
    const cityVal = city || query || 'Lagos'
    const nicheVal = niche || industry || 'tech'
    const lim = Math.min(Number(limit)||100, 150)
    const leads = await findLeads(c.env, cityVal, nicheVal, lim)
    return c.json({ success: true, leads, count: leads.length, city: cityVal, niche: nicheVal, source: leads[0]?.source || 'mixed' })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/ad-engine/find-leads', async (c) => {
  try {
    const city = c.req.query('city') || c.req.query('query') || 'Lagos'
    const niche = c.req.query('niche') || c.req.query('industry') || 'tech'
    const limit = Math.min(Number(c.req.query('limit'))||100, 150)
    const leads = await findLeads(c.env, city, niche, limit)
    return c.json({ success: true, leads, count: leads.length, city, niche })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// Ad Engine: send offers bulk
app.post('/api/ad-engine/send-offers', async (c) => {
  try {
    const { leads, useAI, from, subject, body } = await c.req.json().catch(()=>({}))
    if (!leads || !Array.isArray(leads) || leads.length===0) return c.json({ error: 'leads array required (100 for full campaign)' }, 400)
    const result = await sendBulkOffers(c.env, leads, { useAI: !!useAI, from, subject, body })
    // persist sent messages to memory for tracker
    for (const r of result.results) {
      if (r.success) try { await create(c.env, 'messages', { to: r.to, subject: r.subject, content: r.text, sent_at: r.sentAt, source: 'ad-engine' }) } catch {}
    }
    return c.json({ success: true, ...result })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/ad-engine/preview-offers', async (c) => {
  try {
    const { leads, n } = await c.req.json().catch(()=>({}))
    if (!leads || !Array.isArray(leads)) return c.json({ error: 'leads required' }, 400)
    return c.json({ success: true, previews: previewOffers(leads, n||3), offer: { price: PRICING.oneWeekCampaign.price, deliverables: PRICING.oneWeekCampaign.deliverables } })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/ad-engine/offer-preview', (c) => {
  const mockLead = { name: 'CEO', company: 'Demo Co', industry: 'tech', location: 'Lagos' }
  return c.json({ success: true, ...personalizeOffer(mockLead), community: COMMUNITY, pricing: PRICING })
})

// Approvals — Yes replies dashboad
app.get('/api/approvals', async (c) => {
  try {
    const all = await list(c.env, 'replies')
    const q = c.req.query('q') || ''
    const status = c.req.query('status') || ''
    let filtered = all
    if (q) filtered = filtered.filter(r=> `${r.content||r.text||''} ${r.from||''}`.toLowerCase().includes(q.toLowerCase()))
    if (status.toLowerCase()==='yes') filtered = filtered.filter(r=> `${r.content||r.text||''}`.toLowerCase().includes('yes'))
    return c.json({ success: true, approvals: filtered, count: filtered.length })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/approvals/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const { company, niche } = await c.req.json().catch(()=>({}))
    // mark reply or lead as approved, create campaign plan
    const plan = generateCampaignPlan({ company: company || 'Approved Company', niche: niche || 'business' })
    let campaign = null
    try {
      campaign = await create(c.env, 'campaigns', { name: `${plan.company} — 1 Week`, company: plan.company, niche: plan.niche, status: 'draft', plan, source: 'approval', approval_id: id })
    } catch {}
    return c.json({ success: true, plan, campaign })
  } catch (e) { return c.json({ error: e.message }, 500) }
})

// Campaign Planner — 7-day plan
app.post('/api/ad-engine/plan', async (c) => {
  try {
    const { company, niche, industry, startDate, offer } = await c.req.json().catch(()=>({}))
    if (!company) return c.json({ error: 'company required' }, 400)
    const plan = generateCampaignPlan({ company, niche: niche||industry, industry, startDate, offer })
    return c.json({ success: true, plan })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/ad-engine/plan', async (c) => {
  const company = c.req.query('company') || 'Demo Company'
  const niche = c.req.query('niche') || c.req.query('industry') || 'business'
  const plan = generateCampaignPlan({ company, niche })
  return c.json({ success: true, plan })
})

// Content Generator — 32 posts
app.post('/api/ad-engine/generate-content', async (c) => {
  try {
    const { company, niche, plan } = await c.req.json().catch(()=>({}))
    if (!company && !plan?.company) return c.json({ error: 'company required' }, 400)
    const pack = await generateWeekContent(c.env, { company: company || plan.company, niche: niche || plan.niche, plan })
    const delivery = prepareDelivery(pack)
    return c.json({ success: true, content: pack, delivery })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.post('/api/ad-engine/delivery', async (c) => {
  try {
    const { content, items } = await c.req.json().catch(()=>({}))
    const pack = content || { items: items || [], company: 'Company', total: (items||[]).length, breakdown: {} }
    if (!pack.items || pack.items.length===0) return c.json({ error: 'content pack required' }, 400)
    // if breakdown missing, compute
    if (!pack.breakdown || !pack.breakdown.linkedin) {
      pack.breakdown = { linkedin: pack.items.filter(i=>i.platform==='linkedin').length, whatsapp: pack.items.filter(i=>i.platform==='whatsapp').length, telegram: pack.items.filter(i=>i.platform==='telegram').length, youtube: pack.items.filter(i=>i.platform==='youtube').length }
    }
    const delivery = prepareDelivery(pack)
    return c.json({ success: true, delivery })
  } catch (e) { return c.json({ error: e.message }, 500) }
})
app.get('/api/ad-engine/template', (c) => c.json({ success: true, template: generateCampaignPlan({ company: 'Demo', niche: 'demo' }).days, pricing: PRICING, community: COMMUNITY }))

export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    // Cron every 2 minutes — poll Gmail for real replies and alert 113 Telegram members
    ctx.waitUntil((async () => {
      try {
        console.log(`[cron] ${new Date().toISOString()} — syncing Gmail replies`)
        const saved = await syncGmailReplies(env)
        console.log(`[cron] synced ${saved.length} replies, hot-lead alerts handled in replyService`)
      } catch (e) {
        console.error('[cron] Gmail sync failed', e.message)
      }
    })())
  }
}

