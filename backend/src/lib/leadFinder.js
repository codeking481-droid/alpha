// ============================================================
// FREE LEAD FINDER — Overpass API + Nominatim
// No API key, no cost, unlimited — OpenStreetMap
// ============================================================

export async function getCoordinates(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'AlphaAgency/1.0 (contact: alpha.agency)' },
  })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const data = await response.json()
  if (!data || data.length === 0) throw new Error(`City "${city}" not found — try a larger city nearby`)
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name }
}

export async function findLeads(city, niche, limit = 50) {
  const { lat, lon } = await getCoordinates(city)
  const latMin = lat - 0.05
  const latMax = lat + 0.05
  const lonMin = lon - 0.05
  const lonMax = lon + 0.05

  // Normalize niche to Overpass tag value — support amenity/shop/office
  const n = String(niche).toLowerCase().trim()

  const query = `
    [out:json][timeout:30];
    (
      node["amenity"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["shop"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      node["office"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["amenity"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
      way["shop"="${n}"](${latMin},${lonMin},${latMax},${lonMax});
    );
    out body ${Math.min(limit, 50)};
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'AlphaAgency/1.0',
    },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Overpass ${response.status}: ${text.slice(0, 200)}`)
  }
  const data = await response.json()
  const leads = (data.elements || []).map((el) => ({
    id: String(el.id),
    name: el.tags?.name || 'Unknown',
    type: n,
    lat: el.lat || el.center?.lat || lat,
    lon: el.lon || el.center?.lon || lon,
    address: el.tags?.['addr:full'] || [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || el.tags?.address || '',
    phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
    website: el.tags?.website || el.tags?.['contact:website'] || '',
    source: 'OpenStreetMap',
  }))
  // Filter out Unknown if we have named results
  const named = leads.filter((l) => l.name !== 'Unknown')
  return named.length ? named : leads
}
