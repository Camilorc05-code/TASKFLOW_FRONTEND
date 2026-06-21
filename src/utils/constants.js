export const STATUS_CONFIG = {
  todo:        { label: 'To Do',       dot: '#8891b0', badge: '#1c2035', border: '#252a40' },
  in_progress: { label: 'In Progress', dot: '#5b8fff', badge: '#0f1e42', border: '#1a3580' },
  done:        { label: 'Done',        dot: '#00e5a0', badge: '#052a1e', border: '#094030' },
}
export const PRIORITY_CONFIG = {
  low:    { color: '#8891b0', label: 'Low',    icon: '▼' },
  medium: { color: '#ffb547', label: 'Medium', icon: '◆' },
  high:   { color: '#ff5470', label: 'High',   icon: '▲' },
}
export const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'board',     path: '/board',     icon: '⬡', label: 'Board'     },
  { id: 'tasks',     path: '/tasks',     icon: '✓', label: 'Tasks'      },
  { id: 'teams',     path: '/teams',     icon: '◎', label: 'Teams'      },
  { id: 'settings',  path: '/settings',  icon: '⚙', label: 'Settings'   },
]
