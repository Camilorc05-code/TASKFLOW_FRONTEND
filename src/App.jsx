import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import AppLayout      from './components/layout/AppLayout'
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import DashboardPage  from './pages/DashboardPage'
import BoardPage      from './pages/BoardPage'
import TasksPage      from './pages/TasksPage'
import TeamsPage      from './pages/TeamsPage'
import SettingsPage   from './pages/SettingsPage'
import NotFoundPage   from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — AppLayout handles auth guard */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/board"     element={<BoardPage />} />
            <Route path="/tasks"     element={<TasksPage />} />
            <Route path="/teams"     element={<TeamsPage />} />
            <Route path="/settings"  element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
