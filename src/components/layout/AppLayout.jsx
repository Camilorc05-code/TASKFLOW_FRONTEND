import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)'
    }}>
      <Sidebar />

      <main style={{
        flex: 1,
        height: '100vh',
        overflow: 'auto',   // 👈 ESTE ES EL CAMBIO IMPORTANTE
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </main>
    </div>
  )
}
