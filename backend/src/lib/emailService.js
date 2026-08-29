// Alpha Agency — Real Email Send via Resend + Supabase Marking
// Send one email, mark company as contacted in Supabase.
// If bulk, loop with delays and mark each.

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

// Real outreach template with correct audience numbers
const OUTREACH_TEMPLATE = {
  subject: 'Quick win for {{companyName}} - 4,500+ audience',
  body: `Hi {{ownerName}},

I manage 4,500+ audience across 5 communities (3K YouTube, 700 LinkedIn followers, 500 connections, 130 WhatsApp channel, 113 Telegram channel, 85 cybersecurity). 

I will handle everything and post {{companyName}} on all my communities done-for-you for $500. No work for you whatsoever.

If $500 is an issue, we can negotiate down to $300 for 3 channels (YouTube + LinkedIn + WhatsApp, or any 3 you choose).

Reply YES and I will start immediately.

Dashboard: {{dashboardLink}}

— AlphaTekX`
}

// Dashboard link for the brand
const DASHBOARD_LINK = 'https://alpha-agency-api.alphatekxcompany.workers.dev/dashboard'

// Send a single outreach email
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
        // Company exists but not contacted yet - proceed but mark
        console.log('Company exists but not contacted yet:', companyName, '— proceeding with outreach')
      }
    }
  } catch (e) {
    console.log('Dup check non-fatal:', e.message)
  }

  // Step 2: Generate real email using outreachSender template
  const personalized = personalizeOutreach(lead)

  // Step 3: Send via Resend API
  let resendId = null
  let sendError = null
  try {
    const resendKey = env.RESEND_API_KEY
    if (!resendKey) throw new Error('RESEND_API_KEY missing')

    const resendRes = await fetch('https://api.resend.com emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'outreach@alphatekx.name.ng',
        to: ownerEmail,
        subject: personalized.subject,
        html: `<pre style="font-family:system-ui;white-space:pre-wrap">${personalized.text}</pre>`
      })
    })

    if (!resendRes.ok) {
      const txt = await resendRes.text()
      console.log('Resend error:', resendRes.status, txt.slice(0, 300))
      sendError = new Error('Resend send failed: ' + txt.slice(0, 200))
    } else {
      const data = await resendRes.json()
      resendId = data.id || data.uuid || null
      console.log('Resend sent OK, id:', resendId)
    }
  } catch (e) {
    console.log('Resend exception:', e.message)
    sendError = e
  }

  // Step 4: Upsert companies table - mark as contacted, increment outreach_count
  try {
    const sb = getSupabase(env)
    if (sb) {
      const now = new Date().toISOString()
      // First try to find the company by domain and update it
      const findRes = await fetch(`${sb}/rest/v1/companies?domain=eq.${domain.toLowerCase()}&select=id,outreach_count`, {
        headers: { apikey: sb, Authorization: `Bearer ${sb}` }
      })
      if (findRes.ok) {
        const dbCompanies = await findRes.json()
        if (dbCompanies && dbCompanies.length > 0) {
          const co = dbCompanies[0]
          await fetch(`${sb}/rest/v1/companies?id=eq.${co.id}`, {
            method: 'PATCH',
            headers: { apikey: sb, Authorization: `Bearer ${sb}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
            body: JSON.stringify({
              status: 'contacted',
              contacted_at: now,
              outreach_count: (co.outreach_count || 0) + 1,
              last_outreach_at: now
            })
          }).catch(() => {})
        } else {
          // Company not in DB yet - insert it
          await fetch(`${sb}/rest/v1/companies`, {
            method: 'POST',
            headers: { apikey: sb, Authorization: `Bearer ${sb}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: companyName,
              domain: domain.toLowerCase(),
              owner_email: ownerEmail,
              niche: niche || 'unknown',
              status: 'contacted',
              contacted_at: now,
              outreach_count: 1,
              last_outreach_at: now
            }).catch(() => {})
          })
        }
      }
    }
  } catch (e) {
    console.log('Supabase upsert non-fatal:', e.message)
  }

  // Step 5: Insert sent_emails record
  try {
    const sb = getSupabase(env)
    if (sb && resendId) {
      const now = new Date().toISOString()
      await sbInsert(env, 'sent_emails', {
        company_id: null,
        to_email: ownerEmail,
        company_name: companyName,
        industry: niche || 'unknown',
        subject: personalized.subject,
        body: personalized.text,
        provider: 'resend',
        resend_id: resendId,
        status: 'sent',
        sent_at: now
      })
      console.log('Inserted sent_email record for', ownerEmail)
    }
  } catch (e) {
    console.log('Sent email DB non-fatal:', e.message)
  }

  return {
    success: !sendError,
    company: companyName,
    ownerEmail,
    resend_id: resendId,
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

// Bulk send with 30s delay between each, dedup check per company
export async function sendBulkOutreach(env, leads, opts = {}) {
  const max = Math.min(leads.length, opts.max || 20)
  const slice = leads.slice(0, max)
  const results = []
  const delayMs = Number(opts.delayMs) || 30000

  for (let i = 0; i < slice.length; i++) {
    const lead = slice[i]
    try {
      const result = await sendOutreachEmail(env, lead)
      results.push({ success: true, ...result, index: i })

      // Delay between sends (not after the last)
      if (i < slice.length - 1 && delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs))
      }
    } catch (e) {
      console.log('Bulk send error at index', i, e.message)
      results.push({ success: false, error: e.message, index: i })
    }
  }

  const sent = results.filter(r => r.success).length
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

// Legacy no-op exports — old route handlers replaced but imports still referenced
export async function sendEmail() { return { success: true } }
export function trackSentEmail() { return {} }
export function getSentEmails() { return [] }
export function personalizateMessage() { return {} }
export function formatEmailHTML() { return '' }