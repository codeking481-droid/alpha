export const API_URL = (
  import.meta.env.VITE_API_URL || 'https://alpha-agency-api.alphatekxcompany.workers.dev'
).replace(/\/$/, '')

export const apiUrl = (path) => `${API_URL}${path}`
