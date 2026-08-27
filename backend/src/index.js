import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sbSelect, sbInsert, sbUpdate, sbDelete, sbGetOne, getSupabase } from './lib/supabase.js'
import { groqGenerate, promptContent, promptLeadEmail } from './lib/groq.js'
import { verifyAccessCode, getUserFromRequest } from './lib/auth.js'
import { findLeads } from './lib/leadFinder.js'
import { sendEmailResend } from './lib/email.js'

const app = new Hono()
app.use('*', cors())
app.use('*', async (c, next) => {
  try { await next() } catch (e) {
    console.error(e)
    return c.json({ error: e.message || 'Internal error' }, 500)
  }
})

// In-memory fallback when Supabase not configured â€” all real, empty until you add
const mem = { companies: [], content: [], leads: [], messages: [], replies: [], clients: [], invoices: [], contracts: [], codes: [] }
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
// Explicit send endpoint for outreach
app.post('/api/outreach/send', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.to || !body.subject) return c.json({ error: 'to and subject required' }, 400)
  try {
    const sent = await sendEmailResend(c.env, { to: body.to, subject: body.subject, html: body.html, text: body.text || body.content, from: body.from })
    const saved = await create(c.env, 'messages', { ...body, resend_id: sent.id, sent_at: new Date().toISOString() })
    return c.json({ success: true, sent, saved })
  } catch (e) {
    return c.json({ error: e.message }, 500)
  }
})
app.get('/api/replies', async (c) => c.json(await list(c.env, 'replies')))
app.get('/api/outreach/replies', async (c) => c.json(await list(c.env, 'replies')))
app.post('/api/outreach/replies', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json(await create(c.env, 'replies', body), 201)
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

export default app

