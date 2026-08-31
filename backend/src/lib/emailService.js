// Alpha Agency — Real Email Send via Gmail API + Supabase Marking
// Send one email via Gmail (appears in Sent folder), mark company as contacted.
// If bulk, loop with delays and mark each. Gmail API replaces Resend 100%.

import { sbSelect, sbInsert, getSupabase } from './supabase.js'
import { sendViaGmail } from './gmail.js'

// Helper: check if company already contacted in Supabase
export async function checkCompanyDuplicate(env, domain, ownerEmail) {
  try {
    const sb = getSupabase(env)
    if (!sb) return { skipped: false }
    const existing = await sbSelect(env, 'companies', `domain=eq.${domain.toLowerCase()}&limit=1`)
    if (existing && existing.length > 0) {
      const already = existing[0]
      if (already.contacted_at) {
        return { skipped: true, reason: 'already_contacted', last_contacted_at: already.contacted_at, outreach_count: already.outreach_count }
      }
    }
  } catch (e) {
    console.log('Dup check non-fatal:', e.message)
  }
  return { skipped: false }
}

// Real outreach template — Founding Member $250 (regular $500) with global 4,500+ audience
const OUTREACH_TEMPLATE = {
  subject: 'Quick win for {{companyName}} - 4,500+ audience',
  body: `Hi {{ownerName}},

I manage 4,500+ audience across 5 communities (3K YouTube, 700 LinkedIn followers, 500 connections, 130 WhatsApp channel, 113 Telegram channel, 85 cybersecurity). 

I will handle everything and post {{companyName}} on all my communities done-for-you for $250 Founding Member (regular $500 — you save $250, first 10 clients only). No work for you whatsoever.

If $250 is an issue, we can do $200 for 3 channels (YouTube + LinkedIn + WhatsApp, or any 3 you choose).

Reply YES and I will start immediately.

Dashboard: {{dashboardLink}}

— AlphaTekX`
}

// Dashboard link for the brand
const DASHBOARD_LINK = 'https://alpha-agency-api.alphatekxcompany.workers.dev/dashboard'

// Send a single outreach email via Gmail API (shows in Sent folder)
export async function sendOutreachEmail(env, lead) {
  const { companyName, domain, ownerName, ownerEmail, niche } = lead

  if (!ownerEmail || !String(ownerEmail).includes('@')) {
    throw new Error(`Invalid email for ${companyName || 'company'}`)
  }

  // Step 1: Check Supabase for duplicate - if already contacted, skip
  try {
    const sb = getSupabase(env)
    if (sb) {
      const existing = await sbSelect(env, 'companies', `domain=eq.${domain.toLowerCase()}&limit=1`)
      if (existing && existing.length > 0) {
        const already = existing[0]
        if (already.contacted_at) {
          console.log('SKIP duplicate outreach:', companyName, 'already contacted at', already.contacted_at)
          return { skipped: true, reason: 'already_contacted', company: companyName, last_contacted_at: already.contacted_at, outreach_count: already.outreach_count }
        }
        console.log('Company exists but not contacted yet:', companyName, '— proceeding with outreach')
      }
    }
  } catch (e) {
    console.log('Dup check non-fatal:', e.message)
  }

  // Step 2: Generate real email using outreachSender template
  const personalized = personalizeOutreach(lead)

  // Step 3: Send via Gmail API (replaces Resend — appears in Sent folder)
  let gmailId = null
  let sendError = null
  try {
    const sent = await sendViaGmail(env, {
      to: ownerEmail,
      subject: personalized.subject,
      html: `<pre style="font-family:system-ui;white-space:pre-wrap">${personalized.text}</pre>`,
      text: personalized.text,
      from: env.GMAIL_EMAIL || env.FROM_EMAIL || 'alpha@alphatekx.name.ng'
    })
    gmailId = sent.id || sent.gmail_id || null
    console.log('Gmail sent OK, id:', gmailId)
  } catch (e) {
    console.log('Gmail send exception:', e.message)
    // In dev, Gmail mock already returns id; if we are here, it's real error
    sendError = e
  }

  // Step 4: Upsert companies table - mark as contacted, increment outreach_count
  try {
    const sb = getSupabase(env)
    if (sb) {
      const now = new Date().toISOString()
      const findRes = await fetch(`${sb.url}/rest/v1/companies?domain=eq.${domain.toLowerCase()}&select=id,outreach_count`, {
        headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` }
      })
      if (findRes.ok) {
        const dbCompanies = await findRes.json()
        if (dbCompanies && dbCompanies.length > 0) {
          const co = dbCompanies[0]
          const followUpDue = new Date(Date.now() + 3*24*60*60*1000).toISOString()
          const followUpMsg = `Hi ${ownerName || 'there'},\n\nJust following up on my previous email about featuring ${companyName} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`
          await fetch(`${sb.url}/rest/v1/companies?id=eq.${co.id}`, {
            method: 'PATCH',
            headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
            body: JSON.stringify({
              status: 'contacted',
              contacted_at: now,
              outreach_count: (co.outreach_count || 0) + 1,
              last_outreach_at: now,
              follow_up_status: 'pending_approval',
              follow_up_due_at: followUpDue,
              follow_up_message: followUpMsg
            })
          }).catch(() => {})
        } else {
          const followUpDue2 = new Date(Date.now() + 3*24*60*60*1000).toISOString()
          const followUpMsg2 = `Hi ${ownerName || 'there'},\n\nJust following up on my previous email about featuring ${companyName} on our 4,500+ audience. Still open to a YES? Reply YES and we start immediately.\n\n— Alpha Agency ($250 Founding)`
          await fetch(`${sb.url}/rest/v1/companies`, {
            method: 'POST',
            headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: companyName,
              domain: domain.toLowerCase(),
              owner_email: ownerEmail,
              niche: niche || 'unknown',
              status: 'contacted',
              contacted_at: now,
              outreach_count: 1,
              last_outreach_at: now,
              follow_up_status: 'pending_approval',
              follow_up_due_at: followUpDue2,
              follow_up_message: followUpMsg2
            })
          }).catch(() => {})
        }
      }
    }
  } catch (e) {
    console.log('Supabase upsert non-fatal:', e.message)
  }

  // Step 5: Insert sent_emails record — provider gmail
  try {
    const sb = getSupabase(env)
    if (sb && gmailId) {
      const now = new Date().toISOString()
      await sbInsert(env, 'sent_emails', {
        company_id: null,
        to_email: ownerEmail,
        company_name: companyName,
        industry: niche || 'unknown',
        subject: personalized.subject,
        body: personalized.text,
        provider: 'gmail',
        gmail_id: gmailId,
        resend_id: gmailId,
        status: 'sent',
        sent_at: now
      })
      console.log('Inserted sent_email (gmail) record for', ownerEmail)
    }
  } catch (e) {
    console.log('Sent email DB non-fatal:', e.message)
  }

  return {
    success: !sendError,
    company: companyName,
    ownerEmail,
    gmail_id: gmailId,
    resend_id: gmailId,
    sendError: sendError?.message || null,
    outreach_count: 0,
    truthClause: OUTREACH_TEMPLATE.body
  }
}

// Personalize the outreach template for a lead
export function personalizeOutreach(lead) {
  const { companyName, domain, ownerName, ownerEmail, niche } = lead
  const vars = {
    companyName: companyName || 'your company',
    ownerName: ownerName || 'the owner',
    dashboardLink: DASHBOARD_LINK,
    ...lead
  }

  let subject = OUTREACH_TEMPLATE.subject
  let body = OUTREACH_TEMPLATE.body

  for (const [k, v] of Object.entries(vars)) {
    subject = subject.replaceAll(`{{${k}}}`, String(v ?? ''))
    body = body.replaceAll(`{{${k}}}`, String(v ?? ''))
  }

  return {
    subject: subject.slice(0, 120),
    text: body
  }
}

// Bulk send via Gmail — supports 50 at once with deduplication and delays
export async function sendBulkOutreach(env, leads, opts = {}) {
  const max = Math.min(leads.length, opts.max || 50)
  const slice = leads.slice(0, max)
  const results = []
  const delayMs = Number(opts.delayMs) || 500

  for (let i = 0; i < slice.length; i++) {
    const lead = slice[i]
    try {
      const result = await sendOutreachEmail(env, lead)
      results.push({ success: true, ...result, index: i })

      if (i < slice.length - 1 && delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs))
      }
    } catch (e) {
      console.log('Bulk Gmail send error at index', i, e.message)
      results.push({ success: false, error: e.message, index: i })
    }
  }

  const sent = results.filter(r => r.success && !r.skipped).length
  const skipped = results.filter(r => r.skipped && r.reason === 'already_contacted').length
  const failed = results.filter(r => !r.success && !r.skipped).length

  return {
    total: slice.length,
    sent,
    skipped_duplicates: skipped,
    failed,
    details: results
  }
}

// Legacy no-op exports
export async function sendEmail() { return { success: true } }
export function trackSentEmail() { return {} }
export function getSentEmails() { return [] }
export function personalizateMessage() { return {} }
export function formatEmailHTML() { return '' }
