const BASE = import.meta.env.VITE_API_URL || 'https://taskflow-backend-nhsr.onrender.com'
const getToken = () => localStorage.getItem('taskflow_token')

async function req(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}

export const getSprints      = (params = {}) => req(`/backlog/sprints?${new URLSearchParams(params)}`)
export const createSprint    = (data)        => req('/backlog/sprints', { method: 'POST', body: JSON.stringify(data) })
export const updateSprint    = (id, data)    => req(`/backlog/sprints/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteSprint    = (id)          => req(`/backlog/sprints/${id}`, { method: 'DELETE' })

export const getBacklogItems   = (params = {}) => req(`/backlog/items?${new URLSearchParams(params)}`)
export const createBacklogItem = (data)         => req('/backlog/items', { method: 'POST', body: JSON.stringify(data) })
export const updateBacklogItem = (id, data)     => req(`/backlog/items/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const moveItemToSprint  = (id, sprintId) => req(`/backlog/items/${id}/move`, { method: 'PATCH', body: JSON.stringify({ sprint_id: sprintId }) })
export const deleteBacklogItem = (id)           => req(`/backlog/items/${id}`, { method: 'DELETE' })

export const getCalendarEvents = (year, month) => req(`/backlog/calendar?year=${year}&month=${month}`)
