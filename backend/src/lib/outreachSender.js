import { sendEmailResend } from './email.js'
import { sendViaGmail } from './gmail.js'
import { groqGenerate } from './groq.js'
import { COMMUNITY, COMMUNITIES, TRUTH_CLAUSE } from './community.js'

export const OUTREACH_TEMPLATE = {
  subject: 'Quick win for {{companyName}} - 4,500+ audience',
  body: `Hi {{ownerName}},

I manage 4,500+ audience across 5 communities (3K YouTube, 700 LinkedIn followers, 500 connections, 130 WhatsApp channel, 113 Telegram channel, 85 cybersecurity). 

I will handle everything and post {{companyName}} on all my communities done-for-you for $250 Founding Member (regular $500 — you save $250, first 10 clients only). No work for you whatsoever.

If $250 is an issue, we can do $200 for 3 channels (YouTube + LinkedIn + WhatsApp, or any 3 you choose).

Reply YES and I will start immediately.

Dashboard: {{dashboardLink}}

— AlphaTekX
alphatekxcompany@gmail.com
`,
}

function renderTemplate(str, vars) {
  let out = str
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v ?? ''))
  }
  return out
}

export function personalizeOffer(lead, opts = {}) {
  const totalWhatsapp = COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0)
  const vars = {
    name: lead.name || lead.contact || 'there',
    companyName: lead.company || lead.name || 'your company',
    ownerName: lead.owner || lead.name || 'the owner',
    dashboardLink: 'https://alpha-agency-api.alphatekxcompany.workers.dev/dashboard',
    price: '$250',
    originalPrice: '$500',
    ...opts.vars,
  }
  const includeTruth = opts.includeTruth !== false
  const bodySrc = opts.body || OUTREACH_TEMPLATE.body
  const finalBody = includeTruth && !bodySrc.includes(TRUTH_CLAUSE) ? bodySrc : bodySrc
  return {
    subject: renderTemplate(opts.subject || OUTREACH_TEMPLATE.subject, vars),
    text: renderTemplate(finalBody, vars),
    html: `<pre style="font-family:system-ui;white-space:pre-wrap">${renderTemplate(finalBody, vars)}</pre>`,
    vars,
    truthClause: TRUTH_CLAUSE,
  }
}

export async function personalizeWithGroq(env, lead, opts = {}) {
  const base = personalizeOffer(lead, { ...opts, includeTruth: false })
  if (!env.GROQ_API_KEY) return personalizeOffer(lead, opts)
  try {
    const prompt = `Rewrite this outreach email to ${lead.name} at ${lead.company} (${lead.industry || 'unknown'} in ${lead.location||''}). Keep offer: I manage 4,500+ audience (3K YouTube, 700 LinkedIn followers, 500 connections, 130 WhatsApp, 113 Telegram, 85 cybersecurity) and will handle everything done-for-you for $250 Founding Member (regular $500). If price issue we can do $200 for 3 channels. Always end with this truth clause verbatim: "${TRUTH_CLAUSE}". Original:\nSubject: ${base.subject}\nBody:\n${base.text}`
    const { text } = await groqGenerate(env, { prompt })
    const lines = text.split('\n').filter(Boolean)
    const subj = lines.find(l=>l.toLowerCase().includes('subject'))?.replace(/.*subject\s*:\s*/i,'') || base.subject
    const withTruth = text.includes(TRUTH_CLAUSE) ? text : `${text}\n\n🔒 ${TRUTH_CLAUSE}`
    return { subject: subj.slice(0,120), text: withTruth, html: `<pre style="font-family:system-ui;white-space:pre-wrap">${withTruth}</pre>`, vars: base.vars, ai: true, truthClause: TRUTH_CLAUSE }
  } catch { return personalizeOffer(lead, opts) }
}

export async function sendOffer(env, lead, opts = {}) {
  const to = lead.email
  if (!to || !String(to).includes('@')) throw new Error(`No email for ${lead.company || lead.name}`)
  const { subject, text, html } = opts.useAI ? await personalizeWithGroq(env, lead, opts) : personalizeOffer(lead, opts)
  // Gmail API — appears in Sent folder
  const res = await sendViaGmail(env, { to, subject, html, text, from: opts.from })
  return { lead, to, subject, text, res, gmail_id: res.id, sentAt: new Date().toISOString() }
}

export async function sendBulkOffers(env, leads, opts = {}) {
  const limit = Math.min(leads.length, opts.limit || 50)
  const slice = leads.slice(0, limit)
  const results = []
  const batch = Number(opts.batchSize) || 10
  for (let i = 0; i < slice.length; i += batch) {
    const chunk = slice.slice(i, i + batch)
    const settled = await Promise.allSettled(chunk.map(l => sendOffer(env, l, opts)))
    for (const s of settled) {
      if (s.status === 'fulfilled') results.push({ success: true, ...s.value })
      else results.push({ success: false, error: s.reason?.message || String(s.reason) })
    }
    if (opts.delayMs && i + batch < slice.length) await new Promise(r => setTimeout(r, opts.delayMs))
  }
  return {
    total: slice.length,
    sent: results.filter(r=>r.success).length,
    failed: results.filter(r=>!r.success).length,
    results,
  }
}

export function previewOffers(leads, n = 3) {
  return leads.slice(0, n).map(l => ({ lead: l.company || l.name, ...personalizeOffer(l) }))
}

export { TRUTH_CLAUSE }