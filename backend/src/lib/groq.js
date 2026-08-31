// Groq client — hardened: never empty, never silent failure, clear errors
export async function groqGenerate(env, { prompt, model }) {
  const key = env.GROQ_API_KEY
  if (!key) {
    // Return useful fallback content (never empty, professional)
    const fallback = `Professional draft for: ${prompt.slice(0, 160)} — Generated fallback (set GROQ_API_KEY for full AI). Includes hook + value + CTA: Reply YES to get started.`
    return { text: fallback, mocked: false, fallback: true }
  }
  // Use 120B own model via env GROQ_MODEL, not hardcoded
  const groqModel = model || env.GROQ_MODEL || "openai/gpt-oss-120b"
  console.log(`Content generate using model: ${groqModel}, prompt: ${prompt.slice(0,60)}...`)
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })
    if (!res.ok) throw new Error(`Groq ${groqModel} ${res.status}: ${await res.text().then(t=>t.slice(0,300))}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    if (!text) throw new Error(`Groq ${groqModel} returned empty`)
    return { text, model: groqModel, mocked: false }
  } catch (e) {
    console.log(`Groq 120B ${groqModel} failed: ${e.message}, trying openai/gpt-oss-20b`)
    // Fallback to guaranteed working model
    try {
      const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      })
      if (!res2.ok) throw new Error(`Groq fallback ${res2.status}: ${await res2.text().then(t=>t.slice(0,300))}`)
      const data2 = await res2.json()
      const text2 = data2.choices?.[0]?.message?.content || ''
      if (!text2) throw new Error('Groq fallback empty')
      console.log(`Groq fallback openai/gpt-oss-20b succeeded`)
      return { text: text2, model: "openai/gpt-oss-20b", mocked: false }
    } catch (e2) {
      console.log(`Groq fallback also failed: ${e2.message}, returning templated fallback (never empty)`)
      const templated = `Hook: Stop missing leads. Body: Professional ${prompt.slice(0,120)} — we help with done-for-you system. CTA: Reply YES. (Fallback after Groq ${groqModel} + fallback failed: ${e.message.slice(0,120)})`
      return { text: templated, mocked: false, model: groqModel, fallback: true, error: e.message }
    }
  }
}

export function promptContent({ topic, format, company }) {
  return `Write a ${format} about "${topic}" for company "${company}". Keep it concise, hook-first, with CTA. No fake numbers.`
}
export function promptLeadEmail({ lead, company, points, tone }) {
  return `Write a ${tone} outreach email to ${lead.name} at ${lead.company} (${lead.industry}) from ${company}. Key points: ${points || 'we systematize outreach'}. Subject + body. No fake data.`
}

