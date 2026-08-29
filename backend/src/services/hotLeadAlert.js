function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function sendHotLeadAlert(env, { fromEmail, companyName, companyId, ownerName, replyBody, sentiment, sentimentScore }) {
  if (sentiment !== 'positive' && sentiment !== 'question') return { skipped: true }

  const safeCompany = escapeHtml(companyName || 'Unknown Company')
  const safeFrom = escapeHtml(fromEmail || 'Unknown sender')
  const safeBody = escapeHtml(replyBody || '').slice(0, 1000)
  const score = sentimentScore || 85
  const subject = `HOT REPLY: ${companyName || 'Unknown Company'} - ${String(sentiment).toUpperCase()}`
  const dashboardUrl = `${env.FRONTEND_URL || ''}/track-replies`
  const html = `
    <h2>New Hot Reply - Alpha OS</h2>
    <p><b>From:</b> ${safeFrom}</p>
    <p><b>Company:</b> ${safeCompany}</p>
    <p><b>Sentiment:</b> ${escapeHtml(sentiment)} (${score}%)</p>
    <p><b>Said:</b></p>
    <blockquote>${safeBody}</blockquote>
    <p><a href="${escapeHtml(dashboardUrl)}">Open Track Replies Dashboard</a></p>
    <p>Reply NOW to close $500!</p>
  `.trim()

  const results = []

  if (env.RESEND_API_KEY && env.FROM_EMAIL) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL,
          to: ['alphatekxcompany@gmail.com'],
          subject,
          html
        })
      })
      const data = await response.json().catch(() => ({}))
      results.push({ channel: 'email', success: response.ok, data: response.ok ? data : undefined, error: response.ok ? undefined : data.message || `Resend ${response.status}` })
    } catch (error) {
      results.push({ channel: 'email', success: false, error: error.message })
    }
  } else {
    results.push({ channel: 'email', success: false, error: 'RESEND_API_KEY or FROM_EMAIL not configured' })
  }

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      // Spec format — real reply only, truncated 200 chars, no fake schedule message
      const truncatedReply = String(replyBody || '').slice(0, 200)
      const timestamp = new Date().toISOString()
      const dashboardBase = (env.FRONTEND_URL || 'https://alphatekx.name.ng').replace(/\/$/, '')
      const inboxPath = companyId ? `/inbox/${companyId}` : '/inbox'
      const displayOwner = ownerName || companyName || 'Unknown Owner'
      const telegramMessage = `🔥 HOT LEAD - REPLY NOW! 🔥\n\n🏢 Company: ${companyName || 'Unknown Company'}\n👤 Owner: ${displayOwner}\n📧 Email: ${fromEmail || 'Unknown sender'}\n💬 Reply: "${truncatedReply}"\n\n💰 Potential: $500 Package\n⚡ Action: Reply NOW in dashboard!\n\n🔗 Dashboard: ${dashboardBase}${inboxPath}\n⏰ Time: ${timestamp}`
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: telegramMessage })
      })
      const data = await response.json().catch(() => ({}))
      results.push({ channel: 'telegram', success: response.ok && data.ok !== false, data: response.ok ? data : undefined, error: response.ok ? undefined : data.description || `Telegram ${response.status}` })
    } catch (error) {
      results.push({ channel: 'telegram', success: false, error: error.message })
    }
  }

  return { sent: results.some((result) => result.success), results }
}
