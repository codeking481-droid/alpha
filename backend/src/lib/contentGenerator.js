import { groqGenerate } from './groq.js'
import { COMMUNITY, TRUTH_CLAUSE } from './community.js'
import { CAMPAIGN_TEMPLATE } from './campaignPlanner.js'

const PLATFORM_BRIEF = {
  linkedin: 'LinkedIn post — hook first line, 3-5 short paragraphs, 2 hashtags, CTA, professional tone, no emojis spam',
  whatsapp: 'WhatsApp broadcast — short, personal, 1 CTA, plain text, 1 emoji max, feels like a friend forwarded it',
  telegram: 'Telegram post — conversational, poll/question to spark replies, community vibe',
  youtube: 'YouTube script — title + hook (0:00) + 3 beats + CTA, 300-400 words, for 2-4 min video',
}

async function genOne(env, { platform, type, day, company, niche }) {
  const brief = PLATFORM_BRIEF[platform] || type
  const prompt = `Create a ${brief} for Day ${day} — theme "${type}" for company "${company}" in "${niche}". Alpha community sizes: LinkedIn ${COMMUNITY.linkedin.followers} followers, ${COMMUNITY.linkedin.connections}+ connections, WhatsApp ${COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0)}+ members (2 groups), Telegram ${COMMUNITY.telegram.members}, YouTube ${COMMUNITY.youtube.subscribers}+ subs. Keep it useful, no fake testimonials, no view/like guarantees. If relevant, include truth: "${TRUTH_CLAUSE}". Include CTA relevant to campaign. Return only the post content.`
  try {
    const { text, mocked } = await groqGenerate(env, { prompt, model: env.GROQ_MODEL || 'openai/gpt-oss-120b' })
    return { platform, type, day, content: text, mocked: !!mocked }
  } catch (e) {
    return { platform, type, day, content: `[${platform} Day ${day} — ${type}] for ${company} (${niche}): ${brief}. — Groq key missing, add GROQ_API_KEY for real AI.`, mocked: false, error: e.message }
  }
}

export async function generateWeekContent(env, { company, niche, plan } = {}) {
  const co = company || 'Your Client'
  const vertical = niche || 'business'
  const template = plan?.days || CAMPAIGN_TEMPLATE
  const items = []
  for (const d of template) {
    const day = d.day
    if (d.linkedin && d.linkedin !== '—') items.push(genOne(env, { platform: 'linkedin', type: d.linkedin, day, company: co, niche: vertical }))
    if (d.whatsapp && d.whatsapp !== '—') items.push(genOne(env, { platform: 'whatsapp', type: d.whatsapp, day, company: co, niche: vertical }))
    if (d.telegram && d.telegram !== '—') items.push(genOne(env, { platform: 'telegram', type: d.telegram, day, company: co, niche: vertical }))
    if (d.youtube && d.youtube !== '—') items.push(genOne(env, { platform: 'youtube', type: d.youtube, day, company: co, niche: vertical }))
  }
  const resolved = await Promise.all(items)
  // Expand to hit exact counts: LinkedIn 10, WhatsApp 10, Telegram 10, YouTube 2
  // Template already yields 7 each for first 3 + 2 YT = 23. We add extras for days 1-3 to reach 10 each.
  const extra = []
  const byPlat = (p) => resolved.filter(r=>r.platform===p)
  for (const plat of ['linkedin','whatsapp','telegram']) {
    const cur = byPlat(plat).length
    const need = 10 - cur
    for (let i=0;i<need;i++) extra.push(genOne(env, { platform: plat, type: `Bonus ${plat} #${i+1}`, day: (i%7)+1, company: co, niche: vertical }))
  }
  if (extra.length) {
    const extraResolved = await Promise.all(extra)
    resolved.push(...extraResolved)
  }
  // Group by day for delivery helper
  const byDay = {}
  for (const r of resolved) {
    if (!byDay[r.day]) byDay[r.day] = []
    byDay[r.day].push(r)
  }
  return {
    company: co,
    niche: vertical,
    total: resolved.length,
    breakdown: {
      linkedin: resolved.filter(r=>r.platform==='linkedin').length,
      whatsapp: resolved.filter(r=>r.platform==='whatsapp').length,
      telegram: resolved.filter(r=>r.platform==='telegram').length,
      youtube: resolved.filter(r=>r.platform==='youtube').length,
    },
    items: resolved,
    byDay,
  }
}

export async function generateSingle(env, opts) {
  return genOne(env, opts)
}

// Delivery helper — formats content for copy/paste delivery
export function prepareDelivery(contentPack) {
  const sections = []
  for (const plat of ['linkedin','whatsapp','telegram','youtube']) {
    const items = contentPack.items.filter(i=>i.platform===plat)
    sections.push({ platform: plat, count: items.length, items: items.map((it, idx)=> ({ n: idx+1, day: it.day, type: it.type, content: it.content })) })
  }
  return {
    company: contentPack.company,
    total: contentPack.total,
    deliverables: contentPack.breakdown,
    sections,
    checklist: contentPack.items.map(it=> ({ day: it.day, platform: it.platform, type: it.type, done: false })),
    truthClause: TRUTH_CLAUSE,
  }
}
