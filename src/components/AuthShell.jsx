import { Link } from 'react-router-dom'

export function AuthShell({ title, sub, children }) {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:24, position:'relative', overflow:'hidden', background:'var(--bg)',
    }}>
      {/* glow blob */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,var(--accent-glow) 0%,transparent 70%)' }} />
      </div>

      <div className="a-scale" style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, animation:'float 3s ease-in-out infinite' }}>⚡</div>
            <span style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>TaskFlow</span>
          </Link>
          <h1 style={{ fontSize:23, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>{title}</h1>
          <p style={{ color:'var(--text-2)', fontSize:14, lineHeight:1.5 }}>{sub}</p>
        </div>

        {/* Card */}
        <div style={{
          background:'var(--bg-card)', border:'1px solid var(--border-2)',
          borderRadius:20, padding:'32px 28px',
          boxShadow:'0 40px 100px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.03)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
