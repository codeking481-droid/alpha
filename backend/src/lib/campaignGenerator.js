// Campaign content generator using Groq or OpenAI
// Returns 10 posts + 2 YouTube scripts

async function callGroq(env, prompt) {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured')
  
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Groq API error: ${res.status} ${error}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

async function callOpenAI(env, prompt) {
  if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')
  
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${error}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

export async function generateCampaignContent(env, companyName, industry, clientCount = 10, tone = 'professional') {
  const prompt = `You are a world-class advertising copywriter for Alpha Agency, a leading B2B marketing firm.

Generate EXACTLY 10 social media posts for ${companyName}, a ${industry} company with ${clientCount} clients. 
Tone: ${tone}. Each post must be unique, engaging, and drive business results.

Format your response as valid JSON with this exact structure:
{
  "posts": [
    {"id": 1, "platform": "LinkedIn", "type": "Announcement", "content": "..."},
    {"id": 2, "platform": "WhatsApp", "type": "Teaser", "content": "..."},
    ...
    {"id": 10, "platform": "All Platforms", "type": "Call-to-Action", "content": "..."}
  ],
  "youtubeScripts": [
    {"title": "60-Second Promo", "duration": "60sec", "script": "..."},
    {"title": "3-Minute Deep Dive", "duration": "3min", "script": "..."}
  ]
}

Make the posts:
- Posts 1-3: Professional announcements and teasers
- Posts 4-6: Educational and thought leadership
- Posts 7-9: Social proof, testimonials, and engagement
- Post 10: Final call-to-action with urgency

YouTube scripts should be compelling sales/educational content that drives leads.

Return ONLY valid JSON, no markdown.`

  try {
    // Try Groq first (faster, cheaper)
    let response = ''
    if (env.GROQ_API_KEY) {
      response = await callGroq(env, prompt)
    } else if (env.OPENAI_API_KEY) {
      response = await callOpenAI(env, prompt)
    } else {
      throw new Error('No AI API configured (need GROQ_API_KEY or OPENAI_API_KEY)')
    }

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON')
    
    const result = JSON.parse(jsonMatch[0])
    
    return {
      companyName,
      industry,
      clientCount,
      posts: result.posts || [],
      youtubeScripts: result.youtubeScripts || [],
      generatedAt: new Date().toISOString()
    }
  } catch (e) {
    console.error('Content generation error:', e)
    throw e
  }
}

export async function saveCampaign(env, companyName, industry, posts, youtubeScripts) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/campaigns`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      company_name: companyName,
      industry: industry,
      posts: posts,
      youtube_scripts: youtubeScripts
    })
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to save campaign: ${res.status} ${error}`)
  }

  const data = await res.json()
  return data[0] || data
}
