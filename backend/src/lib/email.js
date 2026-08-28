// Email sending — Resend + fallback
// Uses env.RESEND_API_KEY and env.FROM_EMAIL

export async function sendEmailResend(env, { to, subject, html, text, from }) {
  const key = env.RESEND_API_KEY
  const fromEmail = from || env.FROM_EMAIL || 'alphatekxcompany@gmail.com'
  if (!key) throw new Error('RESEND_API_KEY not set — set it in Worker secrets')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: fromEmail, to: Array.isArray(to) ? to : [to], subject, html: html || `<p>${text || ''}</p>`, text }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Resend ${res.status}: ${t.slice(0, 300)}`)
  }
  return await res.json()
}

// Content helper — uses Groq via existing groq.js, no extra key needed
