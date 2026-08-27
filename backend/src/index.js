import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => c.json({ status: 'Alpha Agency API — Online 🚀', badges: ['Command Hub', 'Content Studio', 'Outreach Engine', 'Analytics', 'Deal Desk'] }))

app.get('/api/companies', (c) => c.json([
  { id: 1, name: 'Genesis', status: 'active' },
  { id: 2, name: 'Dominion', status: 'active' }
]))

app.get('/api/content', (c) => c.json({ message: 'Content Studio — Ready to create' }))
app.get('/api/outreach', (c) => c.json({ message: 'Outreach Engine — Ready to outreach' }))

// Content Studio — AI Writer (Groq via Workers AI)
app.post('/api/ai/generate', async (c) => {
  const { topic, format = 'post', company = 'Genesis' } = await c.req.json().catch(() => ({}))
  if (!topic) return c.json({ error: 'topic required' }, 400)
  const mock = `🚀 ${company} — ${topic} [${format}]\n\nHook: Most people overthink ${topic}. We systematized it.\n\n3 lessons:\n1. Speed > Perfection\n2. Systems > Hustle\n3. Content > Ads\n\nBuilt for ${company}. Reply ALPHA for the playbook.`
  return c.json({ text: mock, model: 'mock-groq', usage: { mocked: true } })
})

app.get('/api/content/projects', (c) => c.json([
  { id: 1, title: "Genesis Launch — The Invisible System", format: "script", company: "Genesis", status: "review" },
]))

// Outreach Engine — leads, campaigns, messages
const mockLeads = [
  { id: 1, name: "Adebayo Oke", company: "Paystack Alumni Co", industry: "Fintech", location: "Lagos, NG", email: "ade@payalum.co" },
  { id: 2, name: "Sarah Chen", company: "Dominion Labs", industry: "SaaS", location: "Remote • US", email: "sarah@dominionlabs.io" },
]
app.get('/api/outreach/leads', (c) => {
  const q = c.req.query('q') || ''
  const filtered = !q ? mockLeads : mockLeads.filter(l => `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase()))
  return c.json(filtered)
})

app.post('/api/outreach/generate', async (c) => {
  const { lead, company = 'Genesis', points = '', tone = 'friendly' } = await c.req.json().catch(() => ({}))
  if (!lead) return c.json({ error: 'lead required' }, 400)
  // TODO: wire Groq: fetch('https://api.groq.com/openai/v1/chat/completions', { headers:{ Authorization:`Bearer ${c.env.GROQ_API_KEY}` } })
  const text = `Subject: Quick idea for ${lead.company || 'your team'} — ${company}\n\nHi ${lead.name || 'there'},\n\nNoticed ${lead.company} in ${lead.industry || 'your space'} — ${points || 'we help teams systematize outreach to 25% reply rate.'} [tone: ${tone}]\n\nWorth a 15-min chat?\n\n— ${company} • Alpha Agency`
  return c.json({ text, mocked: true })
})

app.get('/api/outreach/campaigns', (c) => c.json([
  { id: 1, name: "Genesis — Lagos Fintechs", company: "Genesis", leads: 48, sent: 42, replied: 11, meetings: 4, status: "active" },
  { id: 2, name: "Dominion — SaaS Founders US", company: "Dominion", leads: 65, sent: 65, replied: 16, meetings: 6, status: "active" },
]))

app.get('/api/outreach/replies', (c) => c.json([
  { id: 1, from: "Adebayo Oke", company: "Paystack Alumni Co", snippet: "Love the loom idea. Tue 10am WAT?", status: "hot" },
  { id: 2, from: "Sarah Chen", company: "Dominion Labs", snippet: "25% reply rate is wild.", status: "warm" },
]))

app.get('/api/outreach/analytics', (c) => c.json({
  leadsFound: 127,
  sent: 119,
  replyRate: 24.3,
  meetings: 11,
  openRate: 61.2,
  topPerformer: "Loom + 3-step — 31% reply"
}))

// Analytics Badge — comprehensive
app.get('/api/analytics/overview', (c) => c.json({
  views: 12400,
  viewsChange: "+18.2%",
  engagement: "7.6%",
  engagementChange: "+2.1%",
  revenue: "$103k",
  revenueChange: "+12.4%",
  growth: "+24.3%",
  growthChange: "+5.6%",
  viewsOverTime: [
    { label: "Aug 1", value: 4200 },
    { label: "Aug 8", value: 6800 },
    { label: "Aug 15", value: 5900 },
    { label: "Aug 22", value: 9200 },
    { label: "Aug 29", value: 12400 },
    { label: "Sep 5", value: 10800 },
  ],
  platform: [
    { label: "LinkedIn", value: 5400 },
    { label: "Twitter", value: 3200 },
    { label: "Blog", value: 2100 },
    { label: "Newsletter", value: 1800 },
    { label: "YouTube", value: 1200 },
  ],
  outreach: [
    { label: "Sent", value: 119 },
    { label: "Opened", value: 73 },
    { label: "Replied", value: 29 },
    { label: "Meetings", value: 11 },
  ]
}))

app.post('/api/analytics/report', async (c) => {
  const { client = "Genesis", range = "Last 30 days", format = "PDF" } = await c.req.json().catch(() => ({}))
  // TODO: generate PDF via Workers + R2, email via Resend/SendGrid
  return c.json({ status: "generated", client, range, format, downloadUrl: `/reports/${client}-${Date.now()}.pdf`, mocked: true })
})

// Deal Desk — Money Engine
const mockClients = [
  { id: 1, name: "Adebayo Oke", company: "Paystack Alumni Co", status: "Active", totalBilled: "$42k", mrr: "$6k", lastInvoice: "INV-2026-1042" },
  { id: 2, name: "Sarah Chen", company: "Dominion Labs", status: "Active", totalBilled: "$68k", mrr: "$8.5k", lastInvoice: "INV-2026-1041" },
  { id: 3, name: "Chidi Nwosu", company: "Genesis Media", status: "Active", totalBilled: "$36k", mrr: "$4.2k", lastInvoice: "INV-2026-1039" },
]
let mockInvoices = [
  { id: "INV-2026-1042", client: "Genesis", amount: 6000, status: "Sent", due: "2026-08-30" },
  { id: "INV-2026-1041", client: "Dominion", amount: 8500, status: "Paid", due: "2026-08-25" },
  { id: "INV-2026-1039", client: "AlphaTek X", amount: 4200, status: "Overdue", due: "2026-08-20" },
]
const mockContracts = [
  { id: "CTR-2026-011", client: "Genesis", value: "$72k", status: "Signed", expiry: "2027-02-15" },
]

app.get('/api/deals/clients', (c) => c.json(mockClients))
app.get('/api/deals/clients/:id', (c) => {
  const client = mockClients.find(x => String(x.id) === c.req.param('id'))
  return client ? c.json(client) : c.json({ error: "not found" }, 404)
})
app.get('/api/deals/invoices', (c) => c.json(mockInvoices))
app.post('/api/deals/invoices', async (c) => {
  const body = await c.req.json().catch(()=>({}))
  const inv = { id: body.id || `INV-${Date.now()}`, client: body.client || "Genesis", amount: body.amount || 0, status: "Draft", due: body.due || new Date(Date.now()+14*24*60*60*1000).toISOString().slice(0,10), ...body }
  mockInvoices.unshift(inv)
  return c.json(inv, 201)
})
app.put('/api/deals/invoices/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(()=>({}))
  mockInvoices = mockInvoices.map(x => x.id === id ? { ...x, ...body } : x)
  return c.json(mockInvoices.find(x=>x.id===id))
})
app.post('/api/deals/invoices/:id/send', (c) => {
  const id = c.req.param('id')
  mockInvoices = mockInvoices.map(x => x.id === id ? { ...x, status: "Sent" } : x)
  return c.json({ status: "sent", id, mocked: true })
})
app.get('/api/deals/revenue', (c) => c.json({
  totalRevenue: "$103k",
  mrr: "$31k",
  churn: "2.1%",
  avgDeal: "$8.4k",
  mrrTrend: [
    { label: "Apr", value: 42000 },
    { label: "May", value: 56000 },
    { label: "Jun", value: 68000 },
    { label: "Jul", value: 82000 },
    { label: "Aug", value: 97000 },
    { label: "Sep", value: 103000 },
  ],
  byClient: [
    { label: "Dominion Labs", value: 28000, share: "27%" },
    { label: "Genesis Media", value: 22000, share: "21%" },
  ],
  projected: { total: "$318k", period: "Sep-Nov 2026" }
}))
app.get('/api/deals/contracts', (c) => c.json(mockContracts))
app.post('/api/deals/contracts', async (c) => {
  const body = await c.req.json().catch(()=>({}))
  const ctr = { id: body.id || `CTR-${Date.now()}`, client: body.client || "Genesis", value: body.value || "$0", status: "Pending", expiry: body.expiry || "2027-02-15", ...body }
  mockContracts.unshift(ctr)
  return c.json(ctr, 201)
})

export default app
