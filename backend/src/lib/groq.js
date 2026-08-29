// Groq client — uses env.GROQ_API_KEY, falls back to mock when missing

export async function groqGenerate(env, { prompt, model = 'llama-3.1-8b-instant' }) {
  const key = env.GROQ_API_KEY
  if (!key) {
    // Mock — clearly marked real draft
    return { text: `Real draft (mock until GROQ_API_KEY set) — ${prompt.slice(0, 120)}...\n\n— Set GROQ_API_KEY in Workers secrets for real Groq.`, mocked: true }
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      // Fallback to mock on Groq error (invalid key, timeout) — don't crash engine
      return { text: `Real draft (Groq ${res.status} — mock fallback) — ${prompt.slice(0, 120)}...\n\n— Groq error: ${err.slice(0,200)} — check GROQ_API_KEY or use mock.`, mocked: true, groqStatus: res.status }
    }
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return { text, model, mocked: false }
  } catch (e) {
    // Network/timeout fallback — keep engine working
    return { text: `Real draft (Groq timeout — mock fallback) — ${prompt.slice(0, 120)}...\n\n— Groq unreachable: ${e.message.slice(0,200)} — check key/network, mock used.`, mocked: true, error: e.message }
  }
}

export function promptContent({ topic, format, company }) {
  return `Write a ${format} about "${topic}" for company "${company}". Keep it concise, hook-first, with CTA. No fake numbers.`
}
export function promptLeadEmail({ lead, company, points, tone }) {
  return `Write a ${tone} outreach email to ${lead.name} at ${lead.company} (${lead.industry}) from ${company}. Key points: ${points || 'we systematize outreach'}. Subject + body. No fake data.`
}
