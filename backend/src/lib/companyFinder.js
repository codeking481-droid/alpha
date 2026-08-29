// Company finder using Apollo.io API with Hunter.io email enrichment

export async function findCompaniesApollo(env, niche, location, count = 20) {
  if (!env.APOLLO_API_KEY) throw new Error('APOLLO_API_KEY not configured')

  // Search for companies using Apollo
  const apolloRes = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
    method: 'POST',
    headers: {
      'x-api-key': env.APOLLO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q_organization_keyword_tags: [niche],
      q_organization_name: niche,
      organization_locations: location ? [location] : undefined,
      per_page: Math.min(count, 50),
      page: 1,
      sort_by: 'hiring_growth',
      sort_order: 'desc'
    })
  })

  if (!apolloRes.ok) {
    const error = await apolloRes.text()
    throw new Error(`Apollo API error: ${apolloRes.status} ${error}`)
  }

  const apolloData = await apolloRes.json()
  const companies = apolloData.organizations || apolloData.companies || []

  // Enrich with emails using Hunter.io
  const enriched = await Promise.all(
    companies.slice(0, count).map(async (company) => {
      let email = null
      try {
        if (company.website_url && env.HUNTER_API_KEY) {
          const domain = new URL(company.website_url).hostname
          const hunterRes = await fetch(
            `https://api.hunter.io/v2/domain-search?domain=${domain}&limit=1&api_key=${env.HUNTER_API_KEY}`
          )
          if (hunterRes.ok) {
            const hunterData = await hunterRes.json()
            email = hunterData.data?.emails?.[0]?.value || null
          }
        }
      } catch (e) {
        console.error('Hunter enrichment error:', e)
      }

      return {
        id: company.id,
        name: company.name,
        website: company.website_url || company.website || (company.primary_domain ? `https://${company.primary_domain}` : ''),
        email: email || company.email_status?.deliverable_email,
        industry: company.industry || niche,
        location: [company.city, company.state, company.country].filter(Boolean).join(', '),
        linkedinUrl: company.linkedin_url,
        employees: company.employee_count,
        foundedYear: company.founded_year,
        revenue: company.estimated_revenue
      }
    })
  )

  return enriched.filter((c) => c.name) // Filter out empty results
}

export async function cacheLeads(env, niche, data) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase not configured')
  }

  if (!Array.isArray(data) || data.length === 0) return data

  // Check if cache exists and is fresh (< 24h)
  const checkRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/leads_cache?niche=eq.${encodeURIComponent(niche)}&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (checkRes.ok) {
    const existing = await checkRes.json()
    if (existing.length > 0 && Array.isArray(existing[0].data) && existing[0].data.length > 0) {
      const createdAt = new Date(existing[0].created_at).getTime()
      const now = Date.now()
      const ageHours = (now - createdAt) / (1000 * 60 * 60)
      
      // Return cached if less than 24 hours old
      if (ageHours < 24) {
        return existing[0].data
      }
    }
  }

  // Save new cache
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/leads_cache`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      niche: niche,
      data: data,
      expires_at: expiresAt
    })
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`Failed to cache leads: ${res.status} ${error}`)
  }

  return data
}

export async function getCachedLeads(env, niche) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return null
  }

  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/leads_cache?niche=eq.${encodeURIComponent(niche)}&expires_at=gt.${new Date().toISOString()}&order=created_at.desc&limit=1`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!res.ok) return null

  const results = await res.json()
  return results.length > 0 && Array.isArray(results[0].data) && results[0].data.length > 0
    ? results[0].data
    : null
}
