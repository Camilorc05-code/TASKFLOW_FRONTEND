import { useState, useEffect, useCallback } from 'react'
import { getTasks } from '../services/api'

export function useTasks(params = {}) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError(null)
    try { setTasks(await getTasks(params) || []) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  return { tasks, loading, error, refresh }
}
