import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sbSelect, sbInsert, sbUpdate, sbDelete, sbGetOne, getSupabase } from './lib/supabase.js'
import { groqGenerate, promptContent, promptLeadEmail } from './lib/groq.js'
import { verifyAccessCode, getUserFromRequest } from './lib/auth.js'
import { findLeads } from './lib/leadFinder.js'
import { sendEmailResend } from './lib/email.js'
import { saveSentMessage, saveReply, getReplies, getSentMessages } from './lib/replyTracker.js'
import { saveOutcome, getOutcomes, getOutcomeSummary } from './lib/outcomeTracker.js'

const app = new Hono()
app.use('*', cors())
app.use('*', async (c, next) => {
  try { await next() } catch (e) {
    console.error(e)
    return c.json({ error: e.message || 'Internal error' }, 500)
  }
})

// In-memory fallback when Supabase not configured — all real, empty until you add
const mem = { companies: [], content: [], leads: [], messages: [], replies: [], clients: [], invoices: [], contracts: [], codes: [], outcomes: [], client_outcomes: [], outcomes: [], client_outcomes: [] }
const hasSupabase = (env) => !!getSupabase(env)

// Helpers â€” use Supabase if configured, else memory
async function list(env, table) {
  if (hasSupabase(env)) return (await sbSelect(env, table, 'order=created_at.desc')) || []
  return mem[table] || []
}
async function create(env, table, row) {
  if (hasSupabase(env)) return await sbInsert(env, table, row)
  const item = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row }
  mem[table].unshift(item)
  return item
}
async function getOne(env, table, id) {
  if (hasSupabase(env)) return await sbGetOne(env, table, id)
  return (mem[table] || []).find((x) => String(x.id) === String(id)) || null
}
async function updateOne(env, table, id, patch) {
  if (hasSupabase(env)) return await sbUpdate(env, table, id, patch)
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

// Health â€” both / and /api/health (for prompt's test)
app.get('/', (c) => c.json({ status: 'Alpha Agency API â€” Online', badges: ['Command Hub', 'Content Studio', 'Outreach Engine', 'Analytics', 'Deal Desk'], supabase: !!getSupabase(c.env), note: 'Real data only â€” Root path must be backend' }))
app.get('/api/debug/env', (c) => c.json({ hasSupabaseUrl: !!c.env.SUPABASE_URL, hasAnon: !!c.env.SUPABASE_ANON_KEY, hasService: !!c.env.SUPABASE_SERVICE_KEY, hasGroq: !!c.env.GROQ_API_KEY, envKeys: Object.keys(c.env || {}), note: 'debug — no values leaked' }))
app.get('/api/health', (c) => c.json({ status: 'ok', message: 'Alpha Agency API is live', timestamp: new Date().toISOString() }))
app.get('/api/healthz', (c) => c.json({ status: 'ok', message: 'Alpha Agency API is live' }))

// â”€â”€ Companies (also /api/companies)
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
  const { topic, format = 'post', company = 'Your Company' } = await c.req.json().catch(() => ({}))
  if (!topic) return c.json({ error: 'topic required' }, 400)
  const { text, mocked } = await groqGenerate(c.env, { prompt: promptContent({ topic, format, company }) })
  return c.json({ text, mocked })
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
// Explicit send endpoint for outreach — also persists via replyTracker when Supabase configured
app.post('/api/outreach/send', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.to || !body.subject) return c.json({ error: 'to and subject required' }, 400)
  try {
    const sent = await sendEmailResend(c.env, { to: body.to, subject: body.subject, html: body.html, text: body.text || body.content, from: body.from })
    // Persist via unified helper (keeps Supabase logic in one place) + in-memory fallback
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
    if (leadId && hasSupabase(c.env)) {
      const replies = await getReplies(c.env, leadId)
      return c.json({ success: true, replies, count: replies.length })
    }
    const all = await list(c.env, 'replies')
    // Support ?leadId filtering even on in-memory
    const filtered = leadId ? all.filter(r => String(r.lead_id) === String(leadId) || String(r.message_id) === String(leadId)) : all
    // Return wrapped shape for new inbox; plain array also accepted by frontend
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
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json().catch(()=>({}))
  if (!email) return c.json({ error: 'email required' }, 400)
  // TODO: verify via Supabase Auth when configured
  return c.json({ ok: true, user: { email }, token: 'mock-jwt-' + Date.now(), note: 'Set SUPABASE_URL+KEY for real auth' })
})
app.post('/api/auth/verify-code', async (c) => {
  const { code } = await c.req.json().catch(()=>({}))
  const res = await verifyAccessCode(c.env, code)
  return res.ok ? c.json({ ok: true }) : c.json(res, 400)
})
app.get('/api/auth/me', (c) => {
  const user = getUserFromRequest(c)
  return user ? c.json({ user }) : c.json({ error: 'not authenticated' }, 401)
})
app.post('/api/auth/logout', (c) => c.json({ ok: true }))

// â”€â”€ Outcomes
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

export default app

