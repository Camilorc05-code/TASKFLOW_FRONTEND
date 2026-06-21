import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, background:'var(--bg)', textAlign:'center', padding:24 }}>
      <div style={{ fontSize:80, animation:'float 3s ease-in-out infinite' }}>⚡</div>
      <h1 style={{ fontSize:32, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>Page Not Found</h1>
      <p style={{ color:'var(--text-2)', fontSize:16 }}>The page you're looking for doesn't exist.</p>
      <button className="btn-primary" onClick={() => navigate('/')} style={{ fontSize:15, padding:'12px 28px' }}>
        ← Go Home
      </button>
    </div>
  )
}
