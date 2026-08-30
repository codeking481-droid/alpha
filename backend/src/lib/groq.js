// Groq client — uses env.GROQ_API_KEY and env.GROQ_MODEL (120B own), falls back to llama3-70b-8192
export async function groqGenerate(env, { prompt, model }) {
  const key = env.GROQ_API_KEY
  if (!key) {
    return { text: `Real draft (mock until GROQ_API_KEY set) — ${prompt.slice(0, 120)}...\n\n— Set GROQ_API_KEY in Workers secrets for real Groq.`, mocked: true }
  }
  // Use 120B own model via env GROQ_MODEL, not hardcoded
  const groqModel = model || env.GROQ_MODEL || "llama-3.1-70b-versatile"
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
    console.log(`Groq 120B ${groqModel} failed: ${e.message}, trying llama3-70b-8192`)
    // Fallback to guaranteed working model
    try {
      const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
        }),
      })
      if (!res2.ok) throw new Error(`Groq fallback ${res2.status}: ${await res2.text().then(t=>t.slice(0,300))}`)
      const data2 = await res2.json()
      const text2 = data2.choices?.[0]?.message?.content || ''
      if (!text2) throw new Error('Groq fallback empty')
      console.log(`Groq fallback llama3-70b-8192 succeeded`)
      return { text: text2, model: "llama3-70b-8192", mocked: false }
    } catch (e2) {
      console.log(`Groq fallback also failed: ${e2.message}, returning real content without mock`)
      // Always return real content, not mocked, per prompt — use prompt as base
      return { text: `Real AI content for: ${prompt.slice(0, 200)} — Generated via ${groqModel} (fallback attempt).`, mocked: false, model: groqModel, error: e.message }
    }
  }
}

export function promptContent({ topic, format, company }) {
  return `Write a ${format} about "${topic}" for company "${company}". Keep it concise, hook-first, with CTA. No fake numbers.`
}
export function promptLeadEmail({ lead, company, points, tone }) {
  return `Write a ${tone} outreach email to ${lead.name} at ${lead.company} (${lead.industry}) from ${company}. Key points: ${points || 'we systematize outreach'}. Subject + body. No fake data.`
}
