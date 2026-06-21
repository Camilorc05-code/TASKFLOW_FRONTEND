import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user]  = useState(() => localStorage.getItem('taskflow_user'))
  const [token] = useState(() => localStorage.getItem('taskflow_token'))

  const logIn = (username, accessToken) => {
    localStorage.setItem('taskflow_user', username)
    localStorage.setItem('taskflow_token', accessToken)
    window.location.href = '/dashboard'
  }
  const logOut = () => {
    localStorage.removeItem('taskflow_user')
    localStorage.removeItem('taskflow_token')
    window.location.href = '/'
  }

  return (
    <Ctx.Provider value={{ user, token, logIn, logOut, isAuthenticated: !!token }}>
      {children}
    </Ctx.Provider>
  )
}
export const useAuth = () => useContext(Ctx)
