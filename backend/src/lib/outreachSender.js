import { sendEmailResend } from './email.js'
import { groqGenerate } from './groq.js'
import { COMMUNITY, COMMUNITIES, TRUTH_CLAUSE } from './community.js'

export const OFFER_TEMPLATE = {
  subject: 'We can advertise {{company}} to 4,500+ real audience this week — $500',
  body: `Hi {{name}},

Saw {{company}} in {{industry}} — great product.

We help brands like yours get seen by real people — not bots. For {{price}} we advertise your product for 7 days across OUR communities:

• LinkedIn — {{linkedinReach}} → 10 posts about {{company}}
• WhatsApp — {{whatsappReach}} members (2 groups) → 10 posts
• Telegram — {{telegramReach}} members → 10 posts
• YouTube — {{youtubeReach}}+ subscribers → 2 dedicated videos

That's 4,500+ targeted audience across 5 communities — we create everything, you approve, we post to our audiences.

Flat {{price}} for the full 7-day campaign. No hidden fees.

🔒 ${TRUTH_CLAUSE}

Want us to feature {{company}} this week? Reply YES and I'll send the calendar + samples in 10 mins.

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
    company: lead.company || lead.name || 'your company',
    industry: lead.industry || lead.niche || 'your industry',
    city: lead.location || lead.city || 'your city',
    linkedinReach: `${COMMUNITY.linkedin.followers} followers, ${COMMUNITY.linkedin.connections}+ connections`,
    whatsappReach: String(totalWhatsapp),
    telegramReach: String(COMMUNITY.telegram.members),
    youtubeReach: String(COMMUNITY.youtube.subscribers),
    price: `$${PRICING.oneWeekCampaign.price}`,
    ...opts.vars,
  }
  const includeTruth = opts.includeTruth !== false
  const bodySrc = opts.body || OFFER_TEMPLATE.body
  const finalBody = includeTruth && !bodySrc.includes(TRUTH_CLAUSE) ? bodySrc : bodySrc
  return {
    subject: renderTemplate(opts.subject || OFFER_TEMPLATE.subject, vars),
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
    const prompt = `Rewrite this outreach email to ${lead.name} at ${lead.company} (${lead.industry || 'unknown'} in ${lead.location||''}). Keep offer: we advertise their product on OUR communities - 3K+ YouTube subscribers, 700+ LinkedIn followers, 500+ LinkedIn connections, 130 WhatsApp channel members, 113 Telegram channel, 85 cybersecurity community = 4,500+ targeted audience for $500: 10 LinkedIn posts, 10 WhatsApp posts, 10 Telegram posts, 2 YouTube videos. Tone friendly expert, concise. No fake numbers beyond given. Always end with this truth clause verbatim: "${TRUTH_CLAUSE}". Original:\nSubject: ${base.subject}\nBody:\n${base.text}`
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
  const res = await sendEmailResend(env, { to, subject, html, text, from: opts.from })
  return { lead, to, subject, text, res, sentAt: new Date().toISOString() }
}

export async function sendBulkOffers(env, leads, opts = {}) {
  const limit = Math.min(leads.length, opts.limit || 100)
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