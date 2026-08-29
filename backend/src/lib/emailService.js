// Email sending service using Resend API
// Sends outreach emails and tracks them in Supabase

export async function sendEmail(env, to, subject, htmlContent, companyName, industry, customHeaders = {}) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
  if (!env.FROM_EMAIL) throw new Error('FROM_EMAIL not configured')

  const threadId = crypto.randomUUID()
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `Alpha Agency <${env.FROM_EMAIL}>`,
      to: [to],
      subject: subject || `Quick idea for ${companyName}`,
      html: htmlContent,
      reply_to: env.FROM_EMAIL,
      headers: {
        'X-Thread-ID': threadId,
        ...customHeaders
      }
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Resend API error: ${res.status} ${error}`)
  }

  const data = await res.json()
  return { emailId: data.id, threadId }
}

export async function trackSentEmail(env, to, companyName, industry, subject, body, threadId, emailId) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/sent_emails`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      to_email: to,
      company_name: companyName,
      industry: industry,
      subject: subject,
      body: body,
      thread_id: threadId,
      status: 'sent'
    })
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`Failed to track email: ${res.status} ${error}`)
    return null
  }

  const data = await res.json()
  return data[0] || data
}

export async function getSentEmails(env, limit = 100) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/sent_emails?order=sent_at.desc&limit=${limit}`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch sent emails: ${res.status}`)
  }

  return await res.json()
}

// Replace placeholders in message template
export function personalizateMessage(message, companyName, industry) {
  return message
    .replace(/\{Company\}/g, companyName)
    .replace(/\{Industry\}/g, industry)
    .replace(/\{CompanyName\}/g, companyName)
    .replace(/\{IndustryName\}/g, industry)
}

// Simple HTML email template
export function formatEmailHTML(subject, message, companyName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #5E17EB 0%, #7C3AED 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .body { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center; }
    .cta { display: inline-block; background: #5E17EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Alpha Agency</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px;">Growing ${companyName}</p>
    </div>
    <div class="body">
      ${message}
    </div>
    <div class="footer">
      <p>Alpha Agency | Outreach Campaign</p>
      <p><a href="https://alphatekx.com" style="color: #5E17EB; text-decoration: none;">Learn more</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
