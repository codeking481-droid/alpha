// Reply tracking service for email replies
// Uses Gmail API polling to sync replies
import { sendWhatsAppAlert } from '../services/whatsappAlert.js'

export async function syncGmailReplies(env) {
  if (!env.GMAIL_REFRESH_TOKEN || !env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET) {
    throw new Error('Gmail credentials not configured')
  }

  // Get fresh access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${env.GMAIL_CLIENT_ID}&client_secret=${env.GMAIL_CLIENT_SECRET}&refresh_token=${env.GMAIL_REFRESH_TOKEN}&grant_type=refresh_token`
  })

  if (!tokenRes.ok) throw new Error('Failed to refresh Gmail token')
  
  const { access_token } = await tokenRes.json()

  // Get recent email messages (last 7 days)
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)
  const query = `after:${sevenDaysAgo} subject:Re:`

  const gmailRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  })

  if (!gmailRes.ok) throw new Error('Failed to fetch Gmail messages')

  const { messages = [] } = await gmailRes.json()
  const replies = []

  for (const msg of messages) {
    const detailRes = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )

    if (!detailRes.ok) continue

    const detail = await detailRes.json()
    const headers = detail.payload?.headers || []

    const getHeader = (name) => headers.find((h) => h.name === name)?.value || ''

    const reply = {
      from_email: getHeader('From'),
      to_email: getHeader('To'),
      subject: getHeader('Subject'),
      received_at: new Date(parseInt(detail.internalDate)).toISOString(),
      body: detail.snippet || '',
      gmail_id: msg.id
    }

    replies.push(reply)
  }

  // Save replies to Supabase
  const saved = []
  for (const reply of replies) {
    try {
      const res = await saveReply(env, reply)
      if (res) saved.push(res)
    } catch (e) {
      console.error('Failed to save reply:', e)
    }
  }

  return saved
}

export async function saveReply(env, replyData) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  // Check if reply already exists
  if (replyData.gmail_id) {
    const checkRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/replies?gmail_id=eq.${encodeURIComponent(replyData.gmail_id)}`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        }
      }
    )

    if (checkRes.ok) {
      const existing = await checkRes.json()
      if (existing.length > 0) return existing[0]
    }
  }

  // Detect sentiment using AI (optional - requires Groq/OpenAI)
  let sentiment = 'neutral'
  const positiveKeywords = ['interested', 'great', 'awesome', 'love', 'perfect', 'excited', 'yes', 'let\'s', 'when', 'soon']
  const negativeKeywords = ['not interested', 'busy', 'no thanks', 'remove', 'unsubscribe', 'spam', 'stop']
  
  const bodyLower = (replyData.body || '').toLowerCase()
  if (negativeKeywords.some((k) => bodyLower.includes(k))) {
    sentiment = 'negative'
  } else if (bodyLower.includes('?') || bodyLower.includes('can we') || bodyLower.includes('how much') || bodyLower.includes('when can') || bodyLower.includes('schedule')) {
    sentiment = 'question'
  } else if (positiveKeywords.some((k) => bodyLower.includes(k))) {
    sentiment = 'positive'
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/replies`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      from_email: replyData.from_email,
      to_email: replyData.to_email,
      subject: replyData.subject,
      body: replyData.body,
      received_at: replyData.received_at,
      sentiment: sentiment,
      is_read: false,
      gmail_id: replyData.gmail_id || null,
      whatsapp_alerted: false
    })
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`Failed to save reply: ${res.status} ${error}`)
    return null
  }

  const data = await res.json()
  const saved = data[0] || data

  if (saved && (sentiment === 'positive' || sentiment === 'question')) {
    try {
        const alert = await sendWhatsAppAlert(env, {
        fromEmail: replyData.from_email,
        companyName: replyData.company_name || 'Unknown Company',
        replyBody: replyData.body,
        sentiment,
        sentimentScore: sentiment === 'question' ? 88 : 92
      })
      if (alert.sent) {
        const alertRes = await fetch(`${env.SUPABASE_URL}/rest/v1/replies?id=eq.${encodeURIComponent(saved.id)}&whatsapp_alerted=eq.false`, {
          method: 'PATCH',
          headers: {
            apikey: env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ whatsapp_alerted: true, whatsapp_alerted_at: new Date().toISOString() })
        })
        if (!alertRes.ok) console.error('Failed to mark WhatsApp alert:', await alertRes.text())
        saved.whatsapp_alerted = true
      }
    } catch (error) {
      console.error('WhatsApp alert failed:', error)
    }
  }

  return saved
}

export async function getReplies(env, limit = 100) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/replies?order=received_at.desc&limit=${limit}`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch replies: ${res.status}`)
  }

  return await res.json()
}

export async function markReplyAsRead(env, replyId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/replies?id=eq.${replyId}`, {
    method: 'PATCH',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ is_read: true })
  })

  if (!res.ok) {
    throw new Error(`Failed to update reply: ${res.status}`)
  }

  const data = await res.json()
  return data[0] || data
}

// Webhook handler for Resend inbound replies
export async function handleEmailReplyWebhook(env, payload) {
  const reply = {
    from_email: payload.from,
    to_email: payload.to,
    subject: payload.subject,
    body: payload.text || payload.html || '',
    gmail_id: payload.message_id || payload.id || null,
    company_name: payload.company_name || 'Unknown Company',
    received_at: new Date().toISOString()
  }

  return saveReply(env, reply)
}
