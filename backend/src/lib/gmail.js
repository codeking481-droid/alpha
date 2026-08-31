// Gmail API Sender — replaces Resend. Every message appears in Gmail Sent folder.
// Uses Gmail API messages.send with OAuth2 refresh token.
// Supports both global env token and per-user stored refresh_token (Supabase gmail_tokens / profiles).

export function getGmailConfig(env) {
  const clientId = env.GMAIL_CLIENT_ID || env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ''
  const clientSecret = env.GMAIL_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri = env.GMAIL_REDIRECT_URI || env.GOOGLE_REDIRECT_URI || 'https://alphatekx.name.ng/api/auth/gmail/callback'
  const refreshToken = env.GMAIL_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN || ''
  const gmailEmail = env.GMAIL_EMAIL || env.GOOGLE_EMAIL || env.FROM_EMAIL || 'alpha@alphatekx.name.ng'
  return { clientId, clientSecret, redirectUri, refreshToken, gmailEmail }
}

export async function getGmailAccessToken(env, overrideRefreshToken) {
  const { clientId, clientSecret, refreshToken } = getGmailConfig(env)
  const rt = overrideRefreshToken || refreshToken
  if (!rt || !clientId || !clientSecret) {
    throw new Error('Gmail OAuth not configured — need GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN')
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&refresh_token=${encodeURIComponent(rt)}&grant_type=refresh_token`
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gmail token refresh failed ${res.status}: ${t.slice(0,300)}`)
  }
  const data = await res.json()
  if (!data.access_token) throw new Error('Gmail token refresh returned no access_token')
  return data.access_token
}

// Build RFC2822 email and base64url encode for Gmail API
function buildRawEmail({ from, to, subject, html, text }) {
  const fromEmail = from || 'alpha@alphatekx.name.ng'
  const htmlBody = html || `<p>${(text||'').replace(/\n/g,'<br>')}</p>`
  const textBody = text || (html ? html.replace(/<[^>]+>/g,'') : '')
  // Use multipart/alternative if both present
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
  // str is utf-8 string, need to encode via TextEncoder then base64 url
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  const b64 = btoa(binary)
  return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}

export async function sendViaGmail(env, { to, subject, html, text, from, refreshToken }) {
  if (!to || !subject) throw new Error('to and subject required')
  const toStr = Array.isArray(to) ? to.join(', ') : to
  // If Gmail not configured and not production, mock (keep dev working)
  const cfg = getGmailConfig(env)
  const hasGmail = cfg.clientId && cfg.clientSecret && (cfg.refreshToken || refreshToken)
  if (!hasGmail) {
    if (String(env.ENV||'development').toLowerCase() !== 'production') {
      console.log(`[gmail] mock send to ${toStr} subject=${subject.slice(0,60)} — Gmail not configured, mock in dev`)
      return { id: `gmail_mock_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, mock: true, to: toStr, subject, threadId: `mock_thread_${Date.now()}` }
    }
    throw new Error('Gmail not configured — set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in Worker secrets')
  }
  const accessToken = await getGmailAccessToken(env, refreshToken)
  const fromEmail = from || cfg.gmailEmail || env.FROM_EMAIL || 'alpha@alphatekx.name.ng'
  const raw = buildRawEmail({ from: fromEmail, to: toStr, subject, html, text })
  const rawEncoded = base64UrlEncode(raw)
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: rawEncoded })
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gmail send ${res.status}: ${t.slice(0,500)}`)
  }
  const data = await res.json()
  // data: { id, threadId, labelIds }
  return { id: data.id, threadId: data.threadId, gmail_id: data.id, ...data, mock: false }
}

// Unified sender — tries Gmail first, falls back to mock in dev, throws in prod if Gmail missing
export async function sendEmailGmail(env, opts) {
  return sendViaGmail(env, opts)
}

// Bulk sender via Gmail — validates, deduplicates, cleans, handles 50 at once
export async function sendBulkViaGmail(env, emails, opts = {}) {
  const list = Array.isArray(emails) ? emails : []
  const max = Math.min(list.length, opts.max || 50)
  const slice = list.slice(0, max)
  // Deduplicate by to email lowercased
  const seen = new Set()
  const deduped = []
  for (const e of slice) {
    const key = String(e.to||e.email||e.ownerEmail||'').toLowerCase().trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    // Basic email validation
    if (!key.includes('@') || !key.includes('.')) continue
    deduped.push(e)
  }
  const results = []
  for (let i=0;i<deduped.length;i++) {
    const item = deduped[i]
    const to = item.to || item.email || item.ownerEmail
    const subject = item.subject || opts.subject || `Quick win for ${item.companyName||'your company'} — 4,500+ audience`
    const html = item.html || item.body || item.message || ''
    const text = item.text || html
    try {
      const sent = await sendViaGmail(env, { to, subject, html, text, from: opts.from, refreshToken: opts.refreshToken })
      results.push({ success: true, to, subject, gmail_id: sent.id, threadId: sent.threadId, index: i })
    } catch (e) {
      results.push({ success: false, to, error: e.message, index: i })
    }
    if (i < deduped.length - 1 && opts.delayMs) await new Promise(r=>setTimeout(r, opts.delayMs))
    else if (i < deduped.length - 1) await new Promise(r=>setTimeout(r, 300)) // small delay to avoid rate limit
  }
  return { total: deduped.length, sent: results.filter(r=>r.success).length, failed: results.filter(r=>!r.success).length, skipped_duplicates: slice.length - deduped.length, details: results }
}

// OAuth helpers — build auth URL and exchange code
export function getGmailAuthUrl(env, state) {
  const { clientId, redirectUri } = getGmailConfig(env)
  if (!clientId) throw new Error('GMAIL_CLIENT_ID not set')
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
    throw new Error(`Gmail code exchange ${res.status}: ${t.slice(0,300)}`)
  }
  return await res.json() // { access_token, refresh_token, expires_in, scope }
}

export async function getGmailProfile(env, refreshToken) {
  const accessToken = await getGmailAccessToken(env, refreshToken)
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error(`Gmail profile ${res.status}: ${await res.text().then(t=>t.slice(0,200))}`)
  return await res.json()
}
