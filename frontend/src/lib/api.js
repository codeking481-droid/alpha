// The Pages domain hosts only the frontend; all application API traffic must
// go to the Worker. Keep this in source so Git-based Pages builds cannot lose
// the setting when an environment variable is absent.
export const API_URL = 'https://alpha-agency-api.alphatekxcompany.workers.dev'

export const apiUrl = (path) => `${API_URL}${path}`
