import { useState, useEffect, useCallback } from 'react'
import { getTeams } from '../services/api'

export function useTeams() {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setTeams(await getTeams() || []) }
    catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  return { teams, loading, refresh }
}
