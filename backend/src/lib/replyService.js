// Reply tracking service for email replies
// Uses Gmail API polling to sync replies
import { sendHotLeadAlert } from '../services/hotLeadAlert.js'

export async function syncGmailReplies(env) {
  const gmailClientId = env.GMAIL_CLIENT_ID || env.GOOGLE_CLIENT_ID
  const gmailClientSecret = env.GMAIL_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET
  const gmailRefreshToken = env.GMAIL_REFRESH_TOKEN || env.GOOGLE_REFRESH_TOKEN
  if (!gmailRefreshToken || !gmailClientId || !gmailClientSecret) {
    throw new Error('Gmail credentials not configured')
  }

  // Get fresh access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${gmailClientId}&client_secret=${gmailClientSecret}&refresh_token=${gmailRefreshToken}&grant_type=refresh_token`
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
      hot_lead_alerted: false
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
        // Enrich with real company data if available — lookup by email domain in companies/sent_emails
        let companyId = replyData.company_id || null
        let ownerName = replyData.company_name || null
        let companyName = replyData.company_name || null
        if (!companyId && env.SUPABASE_URL && replyData.from_email) {
          try {
            const domain = (replyData.from_email.match(/@(.+?)>?$/) || [])[1] || ''
            if (domain) {
              const r = await fetch(`${env.SUPABASE_URL}/rest/v1/sent_emails?to_email=ilike.%${encodeURIComponent(domain)}&limit=1`, {
                headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}` }
              })
              if (r.ok) {
                const rows = await r.json()
                if (rows[0]) { companyName = rows[0].company_name || companyName; ownerName = rows[0].company_name || ownerName }
              }
            }
          } catch {}
        }
        if (!companyName) companyName = (replyData.from_email?.split('@')[1]?.split('.')[0] || 'Unknown Company')
        const alert = await sendHotLeadAlert(env, {
        fromEmail: replyData.from_email,
        companyName,
        companyId,
        ownerName: ownerName || companyName,
        replyBody: replyData.body,
        sentiment,
        sentimentScore: sentiment === 'question' ? 88 : 92
      })
      if (alert.sent) {
        const alertRes = await fetch(`${env.SUPABASE_URL}/rest/v1/replies?id=eq.${encodeURIComponent(saved.id)}&hot_lead_alerted=eq.false`, {
          method: 'PATCH',
          headers: {
            apikey: env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ hot_lead_alerted: true, hot_lead_alerted_at: new Date().toISOString() })
        })
        if (!alertRes.ok) console.error('Failed to mark hot-lead alert:', await alertRes.text())
        saved.hot_lead_alerted = true
      }
    } catch (error) {
      console.error('Hot-lead alert failed:', error)
    }

    // AUTO-GENERATE FOLLOWUP when sentiment is positive (YES) — pending_approval, never auto-send
    if (sentiment === 'positive' || (replyData.body || '').toLowerCase().match(/\byes\b/)) {
      try {
        // Find company for context
        let comp = null
        if (companyId) {
          const compRes = await fetch(`${env.SUPABASE_URL}/rest/v1/companies?id=eq.${companyId}&limit=1`, {
            headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}` }
          })
          if (compRes.ok) { const rows = await compRes.json(); comp = rows[0] || null }
        }
        const compName = comp?.company_name || comp?.name || companyName || 'Your Company'
        const owner = comp?.owner_name || ownerName || 'there'
        const product = comp?.product || 'your product'
        // Generate via Groq
        const groqKey = env.GROQ_API_KEY
        let followupMsg = `Thanks for YES! Next steps: we generate content + post on 5 communities (3K YouTube, 700+ LinkedIn, 500 connections, 130 WhatsApp, 113 Telegram, 85 cyber = 4,500+). Private engine $500 invite-only. Pay here: ${env.PAYMENT_LINK || '[PAYMENT_LINK]'}. After payment we handle everything async via email — no call needed. Reply with your product link + 1 image.`
        if (groqKey) {
          try {
            const gRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: `Generate 80-120 words follow-up for ${compName} owner ${owner} who said YES to feature ${product} to 4,500+ audience. Must include: Thanks for YES, next steps we generate content + post on 5 communities (3K YouTube, 700+ LinkedIn, 500 connections, 130 WhatsApp, 113 Telegram, 85 cyber = 4,500+), private engine $500 one-time invite-only, payment link ${env.PAYMENT_LINK || '[PAYMENT_LINK]'}, after payment handle everything async via email no call needed, ask for product link + 1 image. DO NOT SAY call, Zoom, Meet, Loom, screen recording, video call. Tone friendly private exclusive.` }],
                temperature: 0.7, max_tokens: 300
              })
            })
            if (gRes.ok) {
              const gData = await gRes.json()
              const generated = gData.choices?.[0]?.message?.content || ''
              if (generated) followupMsg = generated.replace(/\[PAYMENT_LINK\]/g, env.PAYMENT_LINK || '[PAYMENT_LINK]')
            }
          } catch {}
        }
        // Save followup to reply
        await fetch(`${env.SUPABASE_URL}/rest/v1/replies?id=eq.${saved.id}`, {
          method: 'PATCH',
          headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ followup_message: followupMsg, followup_status: 'pending_approval', followup_generated_at: new Date().toISOString() })
        })
        saved.followup_message = followupMsg
        saved.followup_status = 'pending_approval'
        // Update company status to replied/hot
        if (companyId) {
          await fetch(`${env.SUPABASE_URL}/rest/v1/companies?id=eq.${companyId}`, {
            method: 'PATCH',
            headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'replied' })
          }).catch(() => {}
          )
        }
        console.log(`[replyService] Auto-generated followup for ${compName} — pending_approval`)
      } catch (error) {
        console.error('Auto-generate followup failed:', error)
      }
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
