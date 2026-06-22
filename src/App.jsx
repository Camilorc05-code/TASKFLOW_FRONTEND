import { Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import AppLayout from './components/layout/AppLayout'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import TasksPage from './pages/TasksPage'
import TeamsPage from './pages/TeamsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

import BacklogPage from './pages/BacklogPage'
import CalendarPage from './pages/CalendarPage'
import AcceptInvitePage from './pages/AcceptInvitePage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* INVITE (fuera del layout porque puede entrar gente sin login) */}
          <Route path="/invite/accept" element={<AcceptInvitePage />} />

          {/* APP LAYOUT (SIDEBAR SIEMPRE AQUÍ) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* 🔥 ESTAS DEBEN IR AQUÍ */}
            <Route path="/backlog" element={<BacklogPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}