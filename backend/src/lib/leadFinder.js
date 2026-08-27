// ============================================================
// LEAD FINDER — Hybrid: Apollo (gmails) + Overpass (free, no key)
// ============================================================

export async function getCoordinates(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
  const response = await fetch(url, { headers: { 'User-Agent': 'AlphaAgency/1.0 (contact: alpha.agency)' } })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const data = await response.json()
  if (!data || data.length === 0) throw new Error(`City "${city}" not found — try a larger city`)
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name }
}

// Apollo — real gmails, needs APOLLO_API_KEY
export async function findLeadsApollo(env, { city, niche, limit = 10 }) {
  const key = env.APOLLO_API_KEY
  if (!key) throw new Error('APOLLO_API_KEY not set')
  // Apollo People Search — find people by title + location
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': key },
    body: JSON.stringify({
      q_organization_locations: [city],
      person_titles: [niche],
      page: 1,
      per_page: Math.min(limit, 10),
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Apollo ${res.status}: ${t.slice(0, 300)}`)
  }
  const data = await res.json()
  const people = data.people || data.contacts || []
  return people.map((p) => ({
    id: String(p.id || Math.random()),
    name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
    title: p.title || niche,
    company: p.organization?.name || p.employment_history?.[0]?.organization_name || '',
    email: p.email || p.personal_emails?.[0] || p.work_email || '',
    phone: p.phone_numbers?.[0]?.sanitized_number || '',
    linkedin: p.linkedin_url || '',
    location: city,
    industry: niche,
    score: p.person_score || 80,
    source: 'Apollo (gmail)',
  }))
}

// Overpass — free, no key, physical businesses
export async function findLeadsOverpass(city, niche, limit = 50) {
  const { lat, lon } = await getCoordinates(city)
  const latMin = lat - 0.05, latMax = lat + 0.05, lonMin = lon - 0.05, lonMax = lon + 0.05
  const n = String(niche).toLowerCase().trim()
  // Query multiple OSM tag categories for broader results
  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["shop"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["office"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["tourism"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["healthcare"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["leisure"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["amenity"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["shop"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["tourism"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["healthcare"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
    );
    out body ${Math.min(limit, 50)};
  `
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AlphaAgency/1.0' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!response.ok) throw new Error(`Overpass ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const data = await response.json()
  const leads = (data.elements || []).map((el) => ({
    id: String(el.id),
    name: el.tags?.name || 'Unknown',
    title: n,
    company: el.tags?.name || 'Unknown',
    type: n,
    lat: el.lat || el.center?.lat || lat,
    lon: el.lon || el.center?.lon || lon,
    address: el.tags?.['addr:full'] || [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || '',
    phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
    website: el.tags?.website || el.tags?.['contact:website'] || '',
    email: el.tags?.email || el.tags?.['contact:email'] || '',
    source: 'OpenStreetMap (free)',
  }))
  const named = leads.filter((l) => l.name !== 'Unknown')
  return named.length ? named : leads
}

// Main — picks best source
export async function findLeads(env, city, niche, limit = 20) {
  const n = String(niche).toLowerCase()
  const isBusinessNiche = ['hotel', 'motel', 'restaurant', 'cafe', 'bar', 'shop', 'bank', 'school', 'doctors', 'store', 'hospital', 'clinic', 'pharmacy'].includes(n)
  // If APOLLO key exists and niche is professional (ceo, founder, tech, saas), use Apollo for gmails
  if (env.APOLLO_API_KEY && !isBusinessNiche) {
    try {
      const apollo = await findLeadsApollo(env, { city, niche, limit })
      if (apollo.length > 0) return apollo
    } catch (e) {
      console.warn('Apollo failed, falling back to Overpass:', e.message)
    }
  }
  // Fallback to Overpass (always free)
  return findLeadsOverpass(city, niche, limit)
}
