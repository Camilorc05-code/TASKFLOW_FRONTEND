import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function AcceptInvitePage() {
  const [params]        = useSearchParams()
  const token           = params.get('token')
  const navigate        = useNavigate()
  const { isAuthenticated } = useAuth()
  const [status,  setStatus]  = useState('loading')   // loading | success | error | needs_login
  const [message, setMessage] = useState('')
  const [teamId,  setTeamId]  = useState(null)

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid invite link — no token found.'); return }

    if (!isAuthenticated) {
      // Save token so after login/register we auto-accept
      localStorage.setItem('taskflow_pending_invite', token)
      setStatus('needs_login')
      return
    }

    acceptInvite(token)
  }, [token, isAuthenticated])

  const acceptInvite = async (t) => {
    setStatus('loading')
    try {
      const authToken = localStorage.getItem('taskflow_token')
      const res = await fetch(`${BASE}/teams/invites/accept?token=${t}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Failed to accept invite')

      localStorage.removeItem('taskflow_pending_invite')
      setTeamId(data.team_id)
      setStatus('success')
      setMessage(data.message || 'You have joined the team!')

      // Auto-redirect after 2s
      setTimeout(() => navigate('/teams'), 2200)
    } catch (e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:24 }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-2)', borderRadius:20, padding:'40px 36px', maxWidth:440, width:'100%', textAlign:'center', boxShadow:'0 40px 100px rgba(0,0,0,.5)', animation:'scaleIn .35s cubic-bezier(.22,.68,0,1.2)' }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:32 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚡</div>
          <span style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>TaskFlow</span>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{ marginBottom:16 }}><Spinner size={44} /></div>
            <h2 style={{ fontSize:20, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:8 }}>Accepting invitation...</h2>
            <p style={{ color:'var(--text-2)', fontSize:14 }}>Just a moment</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:10, color:'var(--green)' }}>You're in!</h2>
            <p style={{ color:'var(--text-2)', fontSize:15, marginBottom:24, lineHeight:1.6 }}>{message}</p>
            <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'center', marginBottom:20, color:'var(--text-2)', fontSize:13 }}>
              <Spinner size={14} color="var(--teal)" />
              Redirecting to Teams...
            </div>
            <button className="btn-primary" onClick={() => navigate('/teams')} style={{ width:'100%', justifyContent:'center' }}>
              Go to Teams →
            </button>
          </>
        )}

        {/* Needs login */}
        {status === 'needs_login' && (
          <>
            <div style={{ fontSize:52, marginBottom:16 }}>✉</div>
            <h2 style={{ fontSize:20, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:10 }}>You've been invited!</h2>
            <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
              Sign in or create a free account to accept this team invitation. The invite will be applied automatically after you log in.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Link to={`/login?redirect=/invite/accept&token=${token}`}
                className="btn-primary" style={{ justifyContent:'center', textDecoration:'none' }}>
                Sign In to Accept
              </Link>
              <Link to={`/register?redirect=/invite/accept&token=${token}`}
                className="btn-ghost" style={{ justifyContent:'center', textDecoration:'none' }}>
                Create Account & Accept
              </Link>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ fontSize:52, marginBottom:16 }}>❌</div>
            <h2 style={{ fontSize:20, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:10, color:'var(--red)' }}>Invite Failed</h2>
            <p style={{ color:'var(--text-2)', fontSize:14, marginBottom:24, lineHeight:1.6 }}>{message}</p>
            <button className="btn-ghost" onClick={() => navigate('/')} style={{ width:'100%', justifyContent:'center' }}>
              ← Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
