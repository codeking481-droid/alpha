import { COMMUNITY, PRICING } from './community.js'

export const CAMPAIGN_TEMPLATE = [
  { day: 1, label: 'Launch', linkedin: 'Announcement', whatsapp: 'Teaser', telegram: 'Intro', youtube: '—', goal: 'Awareness' },
  { day: 2, label: 'Problem', linkedin: 'Problem-solution', whatsapp: 'Deep dive', telegram: 'Poll', youtube: '—', goal: 'Education' },
  { day: 3, label: 'Proof', linkedin: 'Social proof', whatsapp: 'Testimonial', telegram: 'Discussion', youtube: '—', goal: 'Trust' },
  { day: 4, label: 'Teach', linkedin: 'Educational', whatsapp: 'Tip', telegram: 'AMA', youtube: 'Video 1', goal: 'Authority' },
  { day: 5, label: 'Insight', linkedin: 'Industry insight', whatsapp: 'Offer', telegram: 'Feedback', youtube: '—', goal: 'Consideration' },
  { day: 6, label: 'Convert', linkedin: 'CTA', whatsapp: 'Reminder', telegram: 'Urgency', youtube: '—', goal: 'Conversion' },
  { day: 7, label: 'Close', linkedin: 'Recap', whatsapp: 'Final push', telegram: 'Thank you', youtube: 'Video 2', goal: 'Retention' },
]

export function generateCampaignPlan({ company, niche, offer, startDate, industry } = {}) {
  const start = startDate ? new Date(startDate) : new Date()
  const companyName = company || 'Approved Company'
  const vertical = niche || industry || 'general'
  return {
    company: companyName,
    niche: vertical,
    offer: offer || PRICING.oneWeekCampaign,
    price: PRICING.oneWeekCampaign.price,
    currency: PRICING.oneWeekCampaign.currency,
    community: COMMUNITY,
    deliverables: { ...PRICING.oneWeekCampaign.deliverables, total: PRICING.oneWeekCampaign.totalPosts },
    startDate: start.toISOString().slice(0,10),
    endDate: new Date(start.getTime() + 6*86400000).toISOString().slice(0,10),
    days: CAMPAIGN_TEMPLATE.map(t => {
      const d = new Date(start.getTime() + (t.day-1)*86400000)
      return {
        ...t,
        date: d.toISOString().slice(0,10),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        posts: [
          t.linkedin !== '—' && { platform: 'linkedin', type: t.linkedin, audience: `${COMMUNITY.linkedin.followers} followers`, count: t.day <= 3 ? 2 : 1 },
          t.whatsapp !== '—' && { platform: 'whatsapp', type: t.whatsapp, audience: `${COMMUNITY.whatsapp.groups.reduce((s,g)=>s+g.members,0)} members`, count: t.day <= 3 ? 2 : 1 },
          t.telegram !== '—' && { platform: 'telegram', type: t.telegram, audience: `${COMMUNITY.telegram.members} members`, count: 1 },
          t.youtube !== '—' && { platform: 'youtube', type: t.youtube, audience: `${COMMUNITY.youtube.subscribers} subs`, count: 1 },
        ].filter(Boolean),
      }
    }),
    summary: {
      linkedin: 10, whatsapp: 10, telegram: 10, youtube: 2, total: 32,
      note: '10 LinkedIn + 10 WhatsApp + 10 Telegram + 2 YouTube in 7 days',
    },
  }
}

export function planToChecklist(plan) {
  return plan.days.flatMap(d => d.posts.map(p => ({
    day: d.day,
    date: d.date,
    platform: p.platform,
    type: p.type,
    done: false,
    copyDue: d.date,
  })))
}
