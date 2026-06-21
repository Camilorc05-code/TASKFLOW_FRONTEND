const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

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

// Auth
export const login = async (username, password) => {
  const body = new URLSearchParams({ username, password })
  const res = await fetch(`${BASE}/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Login failed') }
  return res.json()
}
export const register = (data) => req('/register', { method: 'POST', body: JSON.stringify(data) })
export const changePassword = (data) => req('/change-password', { method: 'POST', body: JSON.stringify(data) })
export const requestPasswordReset = (email) => req('/reset-password/request', { method: 'POST', body: JSON.stringify({ email }) })
export const confirmPasswordReset = (token, new_password) => req('/reset-password/confirm', { method: 'POST', body: JSON.stringify({ token, new_password }) })

// Tasks
export const getTasks = (params = {}) => { const q = new URLSearchParams(params).toString(); return req(`/tasks/${q ? '?' + q : ''}`) }
export const createTask = (data) => req('/tasks/', { method: 'POST', body: JSON.stringify(data) })
export const updateTask = (id, data) => req(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteTask = (id) => req(`/tasks/${id}`, { method: 'DELETE' })

// Teams
export const getTeams = () => req('/teams/')
export const createTeam = (data) => req('/teams/', { method: 'POST', body: JSON.stringify(data) })
export const getTeamMembers = (id) => req(`/teams/${id}/members`)
export const inviteMember = (teamId, email) => req(`/teams/${teamId}/invite`, { method: 'POST', body: JSON.stringify({ email }) })
export const acceptInvite = (token) => req(`/teams/invites/accept?token=${token}`, { method: 'POST' })
export const removeMember = (teamId, userId) => req(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' })

// Team Projects
export const getTeamProjects = (teamId) => req(`/teams/${teamId}/projects`)
export const createTeamProject = (teamId, data) => req(`/teams/${teamId}/projects`, { method: 'POST', body: JSON.stringify({ ...data, team_id: teamId }) })
