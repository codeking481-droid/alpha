// Email sending — Gmail API (replaces Resend). Every message appears in Gmail Sent folder.
// Uses gmail.js — falls back to mock only in non-production if Gmail not configured.

import { sendViaGmail } from './gmail.js'

export async function sendEmailResend(env, { to, subject, html, text, from }) {
  // Keep same function name for backward compat — now uses Gmail API
  try {
    const result = await sendViaGmail(env, { to, subject, html, text, from })
    console.log(`[email] Gmail sent id=${result.id} to=${to} subject=${subject?.slice(0,60)}`)
    return result
  } catch (e) {
    // In dev, Gmail mock already handled inside sendViaGmail; this is only for prod misconfig
    if (String(env.ENV||'development').toLowerCase() !== 'production') {
      console.log(`[email] Gmail fallback mock due to: ${e.message}`)
      return { id: `mock_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, mock: true, to, subject }
    }
    throw e
  }
}

// Also export Gmail-native names
export async function sendEmailGmail(env, opts) {
  return sendEmailResend(env, opts)
}
