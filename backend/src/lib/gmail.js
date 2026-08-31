// Gmail API Sender — hardened: auto-refresh, retry, clear errors, secure storage.
// Every message appears in Gmail Sent folder via messages.send. Bulk 50 validated/deduped.

export function getGmailConfig(env) {
  const clientId = env.GMAIL_CLIENT_ID || env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ''
  const clientSecret = env.GMAIL_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = env.GMAIL_REDIRECT_URI || env.GOOGLE_REDIRECT_URI || 'https://alphatekx.name.ng/api/auth/gmail/callback'
  const refreshToken = env.GMAIL_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN || ''
  const gmailEmail = env.GMAIL_EMAIL || env.GOOGLE_EMAIL || env.FROM_EMAIL || 'alpha@alphatekx.name.ng'
  return { clientId, clientSecret, redirectUri, refreshToken, gmailEmail }
}

// Hardened token refresh: 3 retries with backoff, clear error on expired refresh_token
export async function getGmailAccessToken(env, overrideRefreshToken) {
  const { clientId, clientSecret, refreshToken } = getGmailConfig(env)
  const rt = overrideRefreshToken || refreshToken
  if (!rt || !clientId || !clientSecret) {
    throw new Error('Gmail OAuth not configured — set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in Worker secrets (or connect via /api/auth/gmail)')
  }
  let lastErr = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&refresh_token=${encodeURIComponent(rt)}&grant_type=refresh_token`
      })
      if (!res.ok) {
        const t = await res.text()
        // Detect expired/revoked refresh token — needs reconnect
        if (t.includes('invalid_grant') || t.includes('expired') || t.includes('revoked')) {
          throw new Error(`Gmail refresh token expired/revoked — reconnect via /api/auth/gmail. Details: ${t.slice(0,250)}`)
        }
        throw new Error(`Gmail token refresh failed ${res.status}: ${t.slice(0,300)}`)
      }
      const data = await res.json()
      if (!data.access_token) throw new Error('Gmail token refresh returned no access_token — check GMAIL_CLIENT_ID/SECRET')
      return data.access_token
    } catch (e) {
      lastErr = e
      if (String(e.message).includes('expired') || String(e.message).includes('revoked') || String(e.message).includes('not configured')) throw e
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 400))
      else throw lastErr
    }
  }
  throw lastErr
}

function buildRawEmail({ from, to, subject, html, text }) {
  const fromEmail = from || 'alpha@alphatekx.name.ng'
  const htmlBody = html || `<p>${(text||'').replace(/\n/g,'<br>')}</p>`
  const textBody = text || (html ? html.replace(/<[^>]+>/g,'') : '')
  const boundary = `b_${Date.now()}_${Math.random().toString(36).slice(2)}`
  let raw = ''
  raw += `From: ${fromEmail}\r\n`
  raw += `To: ${to}\r\n`
  raw += `Subject: ${subject}\r\n`
  raw += `MIME-Version: 1.0\r\n`
  if (html && text) {
    raw += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`
    raw += `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${textBody}\r\n\r\n`
    raw += `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlBody}\r\n\r\n`
    raw += `--${boundary}--`
  } else if (html) {
    raw += `Content-Type: text/html; charset=UTF-8\r\n\r\n${htmlBody}`
  } else {
    raw += `Content-Type: text/plain; charset=UTF-8\r\n\r\n${textBody}`
  }
  return raw
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  const b64 = btoa(binary)
  return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}

// Hardened send: auto-retry once on 401 (refresh), handle 429 rate-limit, clear errors
export async function sendViaGmail(env, { to, subject, html, text, from, refreshToken }) {
  if (!to || !subject) throw new Error('to and subject required — provide { to: "a@b.com", subject: "...", html/text }')
  const toStr = Array.isArray(to) ? to.join(', ') : String(to).trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(toStr.split(',')[0].trim())) throw new Error(`Invalid email: ${toStr}`)
  const cfg = getGmailConfig(env)
  const hasGmail = cfg.clientId && cfg.clientSecret && (cfg.refreshToken || refreshToken)
  if (!hasGmail) {
    if (String(env.ENV||'development').toLowerCase() !== 'production') {
      console.log(`[gmail] mock send to ${toStr} subject=${subject.slice(0,60)} — Gmail not configured, mock in dev`)
      return { id: `gmail_mock_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, mock: true, to: toStr, subject, threadId: `mock_thread_${Date.now()}` }
    }
    throw new Error('Gmail not configured — set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in Worker secrets or GET /api/auth/gmail to connect')
  }
  const fromEmail = from || cfg.gmailEmail || env.FROM_EMAIL || 'alpha@alphatekx.name.ng'
  const raw = buildRawEmail({ from: fromEmail, to: toStr, subject, html, text })
  const rawEncoded = base64UrlEncode(raw)

  // Try send with retry on 401 (token expired) and 429 (rate limit)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const accessToken = await getGmailAccessToken(env, refreshToken)
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: rawEncoded })
    })
    if (res.ok) {
      const data = await res.json()
      return { id: data.id, threadId: data.threadId, gmail_id: data.id, ...data, mock: false }
    }
    const t = await res.text()
    // 401 invalid token — retry once with fresh token
    if (res.status === 401 && attempt === 1) {
      console.log('[gmail] 401, refreshing token and retrying')
      await new Promise(r => setTimeout(r, 500))
      continue
    }
    // 429 rate limit — wait and retry
    if (res.status === 429 && attempt === 1) {
      console.log('[gmail] 429 rate limit, waiting 2s')
      await new Promise(r => setTimeout(r, 2000))
      continue
    }
    // User-friendly errors
    if (res.status === 403 && t.includes('Insufficient Permission')) throw new Error(`Gmail 403 insufficient scope — reconnect with gmail.send scope: ${t.slice(0,300)}`)
    if (t.includes('Invalid email')) throw new Error(`Gmail invalid email ${toStr}: ${t.slice(0,300)}`)
    throw new Error(`Gmail send ${res.status}: ${t.slice(0,500)}`)
  }
  throw new Error('Gmail send failed after retry')
}

export async function sendEmailGmail(env, opts) { return sendViaGmail(env, opts) }

// Bulk sender: validates, dedupes, cleans, handles 50 with progress + graceful failures
export async function sendBulkViaGmail(env, emails, opts = {}) {
  const list = Array.isArray(emails) ? emails : []
  const max = Math.min(list.length, opts.max || 50)
  const slice = list.slice(0, max)
  const seen = new Set()
  const deduped = []
  const invalid = []
  const duplicateSkipped = []
  for (const e of slice) {
    const raw = String(e.to||e.email||e.ownerEmail||'').trim().toLowerCase()
    if (!raw) { invalid.push({ input: e, reason: 'missing email' }); continue }
    if (!raw.includes('@') || !raw.includes('.') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) { invalid.push({ to: raw, reason: 'invalid email format' }); continue }
    if (seen.has(raw)) { duplicateSkipped.push(raw); continue }
    seen.add(raw)
    // clean
    deduped.push({ ...e, to: raw })
  }
  const results = []
  for (let i=0;i<deduped.length;i++) {
    const item = deduped[i]
    const to = item.to
    const subject = item.subject || opts.subject || `Quick win for ${item.companyName||item.company_name||'your company'} — 4,500+ audience`
    const html = item.html || item.body || item.message || ''
    const text = item.text || html
    if (!subject || (!html && !text)) {
      results.push({ success: false, to, error: 'missing subject or body', index: i })
      continue
    }
    try {
      const sent = await sendViaGmail(env, { to, subject, html, text, from: opts.from, refreshToken: opts.refreshToken })
      results.push({ success: true, to, subject, gmail_id: sent.id, threadId: sent.threadId, index: i, progress: `${i+1}/${deduped.length}` })
    } catch (e) {
      // Clear error message for UI
      const msg = String(e.message).slice(0,300)
      results.push({ success: false, to, error: msg, index: i, progress: `${i+1}/${deduped.length}` })
    }
    if (i < deduped.length - 1) {
      const delay = Number(opts.delayMs) || 300
      await new Promise(r => setTimeout(r, delay))
    }
  }
  return {
    total: slice.length,
    valid: deduped.length,
    invalid: invalid.length,
    invalid_details: invalid.slice(0,10),
    sent: results.filter(r=>r.success).length,
    failed: results.filter(r=>!r.success).length,
    skipped_duplicates: duplicateSkipped.length,
    duplicate_emails: duplicateSkipped.slice(0,10),
    details: results,
    note: `Bulk via Gmail API — ${results.filter(r=>r.success).length} sent, ${results.filter(r=>!r.success).length} failed, ${duplicateSkipped.length} duplicates skipped, ${invalid.length} invalid. All sent appear in Gmail Sent folder.`
  }
}

export function getGmailAuthUrl(env, state) {
  const { clientId, redirectUri } = getGmailConfig(env)
  if (!clientId) throw new Error('GMAIL_CLIENT_ID not set — add via wrangler secret put GMAIL_CLIENT_ID')
  const scopes = ['https://www.googleapis.com/auth/gmail.send','https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify'].join(' ')
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state: state || 'gmail_connect'
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGmailCode(env, code) {
  const { clientId, clientSecret, redirectUri } = getGmailConfig(env)
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gmail code exchange ${res.status}: ${t.slice(0,300)} — check GOOGLE_REDIRECT_URI matches Google Cloud console`)
  }
  return await res.json()
}

export async function getGmailProfile(env, refreshToken) {
  const accessToken = await getGmailAccessToken(env, refreshToken)
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error(`Gmail profile ${res.status}: ${await res.text().then(t=>t.slice(0,200))} — check Gmail API enabled`)
  return await res.json()
}
