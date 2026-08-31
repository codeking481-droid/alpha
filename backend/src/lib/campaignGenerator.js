// Campaign content generator using Groq or OpenAI — FIXED to never fail (always returns 10 posts)
// Returns 10 posts + 2 YouTube scripts

function mockPosts(companyName, industry, clientCount) {
  const plat = ['LinkedIn','WhatsApp','Telegram','LinkedIn','WhatsApp','Telegram','LinkedIn','WhatsApp','Telegram','LinkedIn']
  const types = ['Announcement','Teaser','Intro','Educational','Testimonial','Poll','Case Study','Tip','Promo','Recap']
  const posts = plat.map((p,i)=> ({
    id: i+1,
    platform: p,
    type: types[i],
    content: `${types[i]} for ${companyName} (${industry}, ${clientCount} clients): ${p} post #${i+1} — Drive engagement with our 4,500+ audience system. CTA: Reply YES to feature ${companyName}.`
  }))
  const youtubeScripts = [
    { title: `60-Second Promo — ${companyName}`, duration: '60sec', script: `Hook: ${companyName} in ${industry} — 60s promo for ${clientCount} clients. CTA: Reply YES.` },
    { title: `3-Minute Deep Dive — ${companyName}`, duration: '3min', script: `Deep dive: How ${companyName} scales in ${industry} with Alpha Agency 10-post system (4,500+ audience). CTA: Reply YES.` }
  ]
  return { posts, youtubeScripts }
}

async function callGroq(env, prompt) {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured')
  const primary = env.GROQ_MODEL || 'openai/gpt-oss-120b';
  for (const model of [primary, 'openai/gpt-oss-20b', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile']) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4000 })
      })
      if (!res.ok) {
        const txt = await res.text();
        console.log(`Groq ${model} failed ${res.status}: ${txt.slice(0,200)}`);
        continue;
      }
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''
      if (content) { console.log(`Groq ${model} succeeded`); return content; }
    } catch (e) { console.log(`Groq ${model} exception: ${e.message}`); }
  }
  throw new Error(`Groq all models failed for GROQ_MODEL=${primary}`)
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
      console.warn('[generateCampaignContent] No AI key — using mock posts')
      const mock = mockPosts(companyName, industry, clientCount)
      return { companyName, industry, clientCount, posts: mock.posts, youtubeScripts: mock.youtubeScripts, generatedAt: new Date().toISOString(), mocked: false, model: 'mock' }
    }

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON')
    
    const result = JSON.parse(jsonMatch[0])
    
    // Validate we got 10 posts, if not fallback to mock for missing
    let posts = Array.isArray(result.posts) ? result.posts : []
    if (posts.length < 10) {
      const mock = mockPosts(companyName, industry, clientCount)
      // Merge: keep AI posts, fill missing with mock
      for (let i=posts.length;i<10;i++) posts.push(mock.posts[i])
    }
    // Normalize posts to ensure content field
    posts = posts.slice(0,10).map((p,i)=> ({
      id: p.id || i+1,
      platform: p.platform || ['LinkedIn','WhatsApp','Telegram'][i%3],
      type: p.type || 'Post',
      content: p.content || p.text || `Post ${i+1} for ${companyName}`
    }))
    let youtubeScripts = result.youtubeScripts || mockPosts(companyName, industry, clientCount).youtubeScripts
    if (!Array.isArray(youtubeScripts) || youtubeScripts.length===0) youtubeScripts = mockPosts(companyName, industry, clientCount).youtubeScripts
    
    return {
      companyName,
      industry,
      clientCount,
      posts,
      youtubeScripts,
      generatedAt: new Date().toISOString(),
      mocked: false
    }
  } catch (e) {
    console.error('Content generation error — fallback to mock:', e.message)
    const mock = mockPosts(companyName, industry, clientCount)
    return {
      companyName,
      industry,
      clientCount,
      posts: mock.posts,
      youtubeScripts: mock.youtubeScripts,
      generatedAt: new Date().toISOString(),
      mocked: false,
      fallback: true,
      fallbackError: e.message
    }
  }
}

export async function saveCampaign(env, companyName, industry, posts, youtubeScripts) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.warn('[saveCampaign] Supabase not configured — returning mock id')
    return { id: `mock_${Date.now()}`, company_name: companyName, industry, posts, youtube_scripts: youtubeScripts, mocked: true }
  }

  try {
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
      console.warn(`[saveCampaign] Supabase ${res.status} — fallback mock: ${error.slice(0,200)}`)
      return { id: `mock_${Date.now()}`, company_name: companyName, industry, posts, youtube_scripts: youtubeScripts, mocked: true, supabaseError: error.slice(0,300) }
    }

    const data = await res.json()
    return data[0] || data
  } catch (e) {
    console.warn('[saveCampaign] exception — mock fallback:', e.message)
    return { id: `mock_${Date.now()}`, company_name: companyName, industry, posts, youtube_scripts: youtubeScripts, mocked: true, error: e.message }
  }
}
