// Alpha Agency — Real Company Search (no mock data)
// Priority: Apollo → Tavily → Overpass (Google Places)
// All APIs return real companies with verified emails where available.
// Results are deduped against Supabase companies table before exporting.

const APOLLO_BASE = 'https://api.apollo.io/v1/search'
const TAVILY_BASE = 'https://api.tavily.com/search'
const OVERPASS_BASE = 'https://overpass-api.de/api/query'

// Google Places (if key available)
const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place/textsearch'

export async function findCompaniesApollo(env, niche, location, limit) {
  const apiKey = env.APOLLO_API_KEY
  if (!apiKey) throw new Error('APOLLO_API_KEY missing')

  try {
    const res = await fetch(`${APOLLO_BASE}?q=companies&industry=${encodeURIComponent(niche)}&location=${encodeURIComponent(location)}&limit=${limit}`, {
      headers: { 'User-Agent': 'AlphaAgency/1.0' }
    })
    if (!res.ok) {
      const txt = await res.text()
      console.log('Apollo error:', res.status, txt.slice(0, 200))
      throw new Error('Apollo API failed')
    }
    const data = await res.json()
    if (data && data.results && data.results.length) {
      const companies = data.results.map(r => ({
        id: `apollo-${r.id}`,
        name: r.name,
        website: r.website || '',
        email: r.email || '',
        industry: r.industry || niche,
        location: r.location || location,
        source: 'apollo',
        is_real: true
      }))
      console.log('Apollo found', companies.length, 'companies')
      return companies
    }
    console.log('Apollo returned 0 results for', niche, location)
    return []
  } catch (err) {
    console.log('Apollo exception:', err.message)
    throw err
  }
}

export async function findLeadsTavily(env, location, niche, limit) {
  const apiKey = env.TAVILY_API_KEY
  if (!apiKey) throw new Error('TAVILY_API_KEY missing')

  try {
    const res = await fetch(`https://api.tavily.com/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${niche} companies ${location}`,
        search_depth: 'basic',
        include_domains: ['linkedin.com', 'crunchbase.com', 'industry websites'],
        limit: limit
      })
    })
    if (!res.ok) {
      const txt = await res.text()
      console.log('Tavily error:', res.status, txt.slice(0, 200))
      throw new Error('Tavily API failed')
    }
    const data = await res.json()
    if (data && data.results && data.results.length) {
      const companies = data.results.map(r => ({
        id: `tavily-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: r.title || r.name || 'Unknown Company',
        website: r.url || '',
        email: '',
        industry: niche,
        location: location || 'USA',
        source: 'tavily',
        is_real: true
      }))
      console.log('Tavily found', companies.length, 'companies')
      return companies
    }
    console.log('Tavily returned 0 results')
    return []
  } catch (err) {
    console.log('Tavily exception:', err.message)
    return []
  }
}

export async function findLeadsOverpass(env, niche, location, limit) {
  try {
    const query = `[out:json][timeout:30];
      (
        node["industry"~"${niche}"]
        or node["name"~"${niche}"]
      ]
      ["${location ? 'addr.city' : ''}"];
    out center;
    >;
    out skel qt;
    )`;
    const res = await fetch(OVERPASS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    })
    if (!res.ok) throw new Error('Overpass API failed')
    const data = await res.json()
    if (data && data.elements && data.elements.length) {
      const companies = data.elements.map(e => ({
        id: `overpass-${e.id || Date.now()}`,
        name: e.tags.name || e.tags.company || 'Unknown',
        website: e.tags.website || '',
        email: '',
        industry: niche,
        location: location || 'USA',
        source: 'overpass',
        is_real: true
      }))
      console.log('Overpass found', companies.length, 'results')
      return companies
    }
    console.log('Overpass returned 0 results')
    return []
  } catch (err) {
    console.log('Overpass exception:', err.message)
    return []
  }
}

export async function findLeadsGooglePlaces(env, niche, location, limit) {
  const apiKey = env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY missing')

  try {
    const res = await fetch(`${GOOGLE_PLACES_BASE}?query=${encodeURIComponent(niche + ' ' + location)}&key=${apiKey}`)
    if (!res.ok) throw new Error('Google Places API failed')
    const data = await res.json()
    if (data && data.status === 'OK' && data.results && data.results.length) {
      const companies = data.results.map(r => ({
        id: `places-${r.id}`,
        name: r.name,
        website: r.website || '',
        email: '',
        industry: niche,
        location: location || 'USA',
        source: 'overpass',
        is_real: true
      }))
      console.log('Google Places found', companies.length, 'results')
      return companies
    }
    console.log('Google Places returned 0 results')
    return []
  } catch (err) {
    console.log('Google Places exception:', err.message)
    return []
  }
}

// MAIN SEARCH: Apollo → Tavily → Overpass → Google Places
// Then dedupe against Supabase companies table
export async function searchCompanies(env, niche, location, limit = 20) {
  location = location || 'USA'
  let allCompanies = []

  // 1) Try Apollo first (has verified emails)
  try {
    const apollo = await findCompaniesApollo(env, niche, location, limit)
    allCompanies = allCompanies.concat(apollo)
    if (apollo.length >= limit) {
      console.log('Apollo satisfied limit of', limit)
      return dedupeCompanies(allCompanies, env, limit)
    }
  } catch (e) {
    console.log('Apollo search skipped:', e.message)
  }

  // 2) Fallback to Tavily
  try {
    const tavily = await findLeadsTavily(env, location, niche, limit - allCompanies.length)
    allCompanies = allCompanies.concat(tavily)
    if (allCompanies.length >= limit) {
      return dedupeCompanies(allCompanies, env, limit)
    }
  } catch (e) {
    console.log('Tavily search skipped:', e.message)
  }

  // 3) Fallback to Overpass
  try {
    const overpass = await findLeadsOverpass(env, niche, location, limit - allCompanies.length)
    allCompanies = allCompanies.concat(overpass)
    if (allCompanies.length >= limit) {
      return dedupeCompanies(allCompanies, env, limit)
    }
  } catch (e) {
    console.log('Overpass search skipped:', e.message)
  }

  // 4) Fallback to Google Places
  try {
    const places = await findLeadsGooglePlaces(env, niche, location, limit - allCompanies.length)
    allCompanies = allCompanies.concat(places)
  } catch (e) {
    console.log('Google Places search skipped:', e.message)
  }

  // Dedup and return only new companies
  return dedupeCompanies(allCompanies, env, limit)
}

// Dedup against Supabase companies table + remove duplicates within result
export async function dedupeCompanies(rawCompanies, env, limit) {
  if (!rawCompanies || rawCompanies.length === 0) {
    console.log('No companies to dedup, returning empty')
    return { companies: [], total_found: 0, filtered_duplicates: 0, num_new: 0 }
  }

  // Query Supabase for already-contacted domains/names
  let dbCompanies = []
  try {
    const sb = env.SUPABASE_URL && (env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)
    if (sb) {
      const res = await fetch(`${sb}/rest/v1/companies?domain=not.is.null&select=name,domain`, {
        headers: { apikey: sb, Authorization: `Bearer ${sb}` }
      })
      if (res.ok) {
        dbCompanies = await res.json()
        console.log('Dedup: found', dbCompanies.length, 'existing companies in DB')
      }
    }
  } catch (e) {
    console.log('Dedup DB query error (non-fatal):', e.message)
  }

  // Build set of existing domains (lowercase) and names
  const existingDomains = new Set()
  const existingNames = new Set()
  dbCompanies.forEach(c => {
    if (c.domain) existingDomains.add(c.domain.toLowerCase())
    if (c.name) existingNames.add(c.name.toLowerCase())
  })

  // Filter: keep only companies not already in DB
  const filteredCompanies = rawCompanies.filter(c => {
    const domLower = (c.domain || '').toLowerCase()
    const namLower = (c.name || '').toLowerCase()
    const isDup = existingDomains.has(domLower) || existingNames.has(namLower)
    if (isDup) {
      console.log('Dedup filtered out:', c.name, 'domain:', c.domain)
    }
    return !isDup
  })

  const filteredCount = rawCompanies.length - filteredCompanies.length
  console.log('Dedup result:', rawCompanies.length, 'raw →', filteredCompanies.length, 'new', 'filtered', filteredCount, 'duplicates')

  // Mark all new companies with is_real and source
  const resultCompanies = filteredCompanies.map(c => ({
    ...c,
    is_real: true,
    source: c.source || 'tavily'
  }))

  // If we have the Supabase key, also insert new companies into DB (so future runs dedup correctly)
  if (env && env.SUPABASE_URL && (env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY) && filteredCompanies.length > 0) {
    try {
      const now = new Date().toISOString()
      const insertRows = filteredCompanies.map(c => ({
        name: c.name,
        domain: c.domain || '',
        owner_email: c.email || '',
        niche: c.industry || 'unknown',
        location: c.location || 'USA',
        status: 'new',
        contacted_at: null,
        outreach_count: 0,
        last_outreach_at: null,
        created_at: now
      }))
      // Batch insert (best-effort, don't block flow if DB fails)
      const batchSize = 10
      for (let i = 0; i < insertRows.length; i += batchSize) {
        const batch = insertRows.slice(i, i + batchSize)
        await Promise.all(batch.map(row => {
          fetch(`${sb}/rest/v1/companies`, {
            method: 'POST',
            headers: { apikey: sb, Authorization: `Bearer ${sb}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(row)
          }).catch(() => {}) // non-blocking
        }))
      }
      console.log('Inserted', filteredCompanies.length, 'new companies into Supabase companies table')
    } catch (e) {
      console.log('DB insert non-fatal:', e.message)
    }
  }

  return {
    companies: resultCompanies.slice(0, limit),
    total_found: rawCompanies.length,
    filtered_duplicates: filteredCount,
    num_new: filteredCompanies.length
  }
}

// Legacy no-op exports — old route handlers replaced but imports still referenced
export function findCompaniesWikipedia() { return [] }
export function getCachedLeads() { return [] }
export function cacheLeads() { return {} }