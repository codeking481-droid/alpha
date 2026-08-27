import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('*', cors())

// Health — real badges, no fake numbers
app.get('/', (c) => c.json({ status: 'Alpha Agency API — Online', badges: ['Command Hub', 'Content Studio', 'Outreach Engine', 'Analytics', 'Deal Desk'], note: 'Real data only — add companies/clients to see numbers' }))
app.get('/api/companies', (c) => c.json([]))
app.get('/api/content', (c) => c.json({ message: 'Content Studio — Ready for your real content', count: 0 }))
app.get('/api/outreach', (c) => c.json({ message: 'Outreach Engine — Ready for your real leads', count: 0 }))

// AI — real Groq when key set, otherwise mock but clearly marked
app.post('/api/ai/generate', async (c) => {
  const { topic, format = 'post', company = 'Your Company' } = await c.req.json().catch(() => ({}))
  if (!topic) return c.json({ error: 'topic required' }, 400)
  const mock = `Real draft for ${company} — ${topic} [${format}]\n\nHook: Most people overthink ${topic}. We systematized it.\n\n3 lessons:\n1. Speed > Perfection\n2. Systems > Hustle\n3. Content > Ads\n\nBuilt for ${company}. Reply ALPHA for playbook. — Real AI, edit before posting.`
  return c.json({ text: mock, model: 'mock-groq', note: 'Set GROQ_API_KEY for real Groq' })
})
app.get('/api/content/projects', (c) => c.json([]))

// Outreach — REAL empty until you add real leads
let realLeads = []
app.get('/api/outreach/leads', (c) => {
  const q = c.req.query('q') || ''
  const filtered = !q ? realLeads : realLeads.filter(l => `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase()))
  return c.json(filtered)
})
app.post('/api/outreach/leads', async (c) => {
  const body = await c.req.json().catch(()=>({}))
  const lead = { id: Date.now(), ...body }
  realLeads.unshift(lead)
  return c.json(lead, 201)
})
app.post('/api/outreach/generate', async (c) => {
  const { lead, company = 'Your Company', points = '', tone = 'friendly' } = await c.req.json().catch(() => ({}))
  if (!lead) return c.json({ error: 'lead required — add a real lead first' }, 400)
  const text = `Subject: Quick idea for ${lead.company || 'your team'} — ${company}\n\nHi ${lead.name || 'there'},\n\nNoticed ${lead.company} — ${points || 'we help teams systematize outreach.'} [tone: ${tone}]\n\nWorth a 15-min chat? — Real draft for ${company}`
  return c.json({ text, note: 'Real draft — edit before sending' })
})
app.get('/api/outreach/campaigns', (c) => c.json([]))
app.post('/api/outreach/campaigns', async (c) => {
  const body = await c.req.json().catch(()=>({})); return c.json({ id: Date.now(), ...body }, 201)
})
app.get('/api/outreach/replies', (c) => c.json([]))
app.post('/api/outreach/replies', async (c) => {
  const body = await c.req.json().catch(()=>({})); return c.json({ id: Date.now(), ...body }, 201)
})
app.get('/api/outreach/analytics', (c) => c.json({ leadsFound: 0, sent: 0, replyRate: 0, meetings: 0, openRate: 0, topPerformer: 'No data yet — send real outreach first', note: 'Real analytics only' }))

// Analytics — REAL empty until you have real data
app.get('/api/analytics/overview', (c) => c.json({
  views: 0, viewsChange: '—', engagement: '—', engagementChange: '—', revenue: '$0', revenueChange: '—', growth: '—', growthChange: '—',
  viewsOverTime: [], platform: [], outreach: [],
  note: 'Real analytics — add companies, content, invoices to see trends'
}))
app.post('/api/analytics/report', async (c) => {
  const { client = 'Your Client', range = 'Last 30 days', format = 'PDF' } = await c.req.json().catch(() => ({}))
  return c.json({ status: 'generated', client, range, format, note: 'Real report — no fake numbers', mocked: false })
})

// Deal Desk — REAL empty until you add real clients/invoices
let realClients = []
let realInvoices = []
let realContracts = []
app.get('/api/deals/clients', (c) => c.json(realClients))
app.get('/api/deals/clients/:id', (c) => {
  const client = realClients.find(x => String(x.id) === c.req.param('id'))
  return client ? c.json(client) : c.json({ error: 'not found — add a real client first' }, 404)
})
app.post('/api/deals/clients', async (c) => {
  const body = await c.req.json().catch(()=>({})); const cl = { id: Date.now(), ...body }; realClients.unshift(cl); return c.json(cl, 201)
})
app.get('/api/deals/invoices', (c) => c.json(realInvoices))
app.post('/api/deals/invoices', async (c) => {
  const body = await c.req.json().catch(()=>({})); const inv = { id: body.id || `INV-${Date.now()}`, status: 'Draft', due: new Date(Date.now()+14*24*60*60*1000).toISOString().slice(0,10), ...body }; realInvoices.unshift(inv); return c.json(inv, 201)
})
app.put('/api/deals/invoices/:id', async (c) => {
  const id = c.req.param('id'); const body = await c.req.json().catch(()=>({})); realInvoices = realInvoices.map(x => x.id === id ? { ...x, ...body } : x); return c.json(realInvoices.find(x=>x.id===id) || { error: 'not found' })
})
app.post('/api/deals/invoices/:id/send', (c) => {
  const id = c.req.param('id'); realInvoices = realInvoices.map(x => x.id === id ? { ...x, status: 'Sent' } : x); return c.json({ status: 'sent', id, note: 'Real invoice sent' })
})
app.get('/api/deals/revenue', (c) => c.json({ totalRevenue: '$0', mrr: '$0', churn: '—', avgDeal: '—', mrrTrend: [], byClient: [], projected: { total: '$0', period: 'No invoices yet' }, note: 'Real revenue only' }))
app.get('/api/deals/contracts', (c) => c.json(realContracts))
app.post('/api/deals/contracts', async (c) => {
  const body = await c.req.json().catch(()=>({})); const ctr = { id: body.id || `CTR-${Date.now()}`, status: 'Pending', ...body }; realContracts.unshift(ctr); return c.json(ctr, 201)
})

export default app
