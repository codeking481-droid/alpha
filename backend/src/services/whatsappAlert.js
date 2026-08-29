const MY_NUMBERS = ['2349046802069', '2347064554028']

export async function sendWhatsAppAlert(env, { fromEmail, companyName, replyBody, sentiment, sentimentScore }) {
  if (sentiment !== 'positive' && sentiment !== 'question') {
    console.log('Skipping WhatsApp alert - sentiment:', sentiment)
    return { skipped: true, reason: 'not_hot_lead' }
  }

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) {
    console.warn('Skipping WhatsApp alert - WhatsApp credentials are not configured')
    return { skipped: true, reason: 'not_configured' }
  }

  const message = `HOT REPLY! Alpha OS\n\nFrom: ${fromEmail || 'Unknown'}\nCompany: ${companyName || 'Unknown'}\nSentiment: ${String(sentiment).toUpperCase()} (${sentimentScore || 85}%)\n\nSaid:\n"${String(replyBody || '').slice(0, 250)}"\n\nACTION: Reply NOW to close $500!\n\nDashboard: ${env.FRONTEND_URL || ''}/track-replies`
  const results = []

  for (const number of MY_NUMBERS) {
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: number,
          type: 'text',
          text: { preview_url: true, body: message }
        })
      })
      const data = await response.json().catch(() => ({}))
      results.push({ number, success: response.ok, data })
    } catch (error) {
      results.push({ number, success: false, error: error.message })
    }
  }

  return {
    sent: results.some((result) => result.success),
    results
  }
}
