import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_CONFIG } from '../utils/constants'

const FEATURES = [
  { icon: '⚡', title: 'Lightning Fast',    desc: 'FastAPI backend with sub-100ms response times and async PostgreSQL.' },
  { icon: '🔐', title: 'JWT Auth',          desc: 'Secure authentication with bcrypt hashing and token management.' },
  { icon: '🏗️', title: 'Team Workspaces',  desc: 'Invite teammates by email, assign tasks, and collaborate in real time.' },
  { icon: '📋', title: 'Kanban Boards',     desc: 'Drag-and-drop tasks across To Do, In Progress, and Done columns.' },
  { icon: '🎯', title: 'Task Assignment',   desc: 'Assign tasks to specific team members and track individual workloads.' },
  { icon: '🐳', title: 'Docker Ready',      desc: 'One-command deployment with Docker Compose and PostgreSQL.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onMove = e => setMouse({ x: e.clientX, y: e.clientY })
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', overflowX:'hidden' }}>

      {/* ── Background ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <svg width="100%" height="100%" style={{ opacity:.03, position:'absolute' }}>
          <defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="var(--accent)" strokeWidth=".8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
        <div style={{ position:'absolute', top:'8%', left:'10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,109,250,.13) 0%,transparent 70%)', animation:'orbDrift 18s ease-in-out infinite' }} />
        <div style={{ position:'absolute', top:'55%', right:'8%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,229,179,.08) 0%,transparent 70%)', animation:'orbDrift 24s ease-in-out infinite reverse' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'35%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,109,250,.06) 0%,transparent 70%)', animation:'orbDrift 20s ease-in-out infinite 6s' }} />
        <div style={{ position:'fixed', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,109,250,.06) 0%,transparent 70%)', left:mouse.x-350, top:mouse.y-350, transition:'left .4s ease,top .4s ease', pointerEvents:'none' }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 48px', backdropFilter:'blur(24px)', background:'rgba(7,8,13,.85)', borderBottom:`1px solid ${scrollY > 20 ? 'var(--border)' : 'transparent'}`, transition:'border-color .3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, animation:'float 3s ease-in-out infinite' }}>⚡</div>
          <span style={{ fontSize:21, fontWeight:800, fontFamily:"'Syne',sans-serif", background:'linear-gradient(135deg,var(--text),var(--text-2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TaskFlow</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ animation:'glowBeat 3s ease infinite' }}>Get Started →</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position:'relative', zIndex:1, textAlign:'center', padding:'160px 24px 100px', maxWidth:960, margin:'0 auto' }}>
        <div className="a-fadeup" style={{ animationDelay:'.05s' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:100, border:'1px solid var(--border-2)', background:'var(--bg-card)', fontSize:13, color:'var(--text-2)', marginBottom:44 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--teal)', display:'inline-block', animation:'pulse 2s infinite' }}/>
            FastAPI · PostgreSQL · Docker · React
          </div>
        </div>
        <h1 className="a-fadeup" style={{ fontSize:'clamp(52px,7vw,96px)', fontWeight:800, fontFamily:"'Syne',sans-serif", lineHeight:1.02, marginBottom:30, animationDelay:'.12s', letterSpacing:'-.02em' }}>
          Manage projects<br/>
          <span style={{ background:'linear-gradient(135deg,var(--accent) 0%,var(--teal) 60%,var(--accent-2) 100%)', backgroundSize:'200% 200%', animation:'gradShift 4s ease infinite', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>like a pro.</span>
        </h1>
        <p className="a-fadeup" style={{ fontSize:19, color:'var(--text-2)', lineHeight:1.75, maxWidth:620, margin:'0 auto 52px', animationDelay:'.2s' }}>
          A Jira-inspired task management platform. Organize sprints, invite your team, assign tasks, and ship faster with visual Kanban boards.
        </p>
        <div className="a-fadeup" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', animationDelay:'.28s' }}>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize:16, padding:'14px 36px', borderRadius:12 }}>
            Start for Free →
          </button>
          <button className="btn-ghost" onClick={() => navigate('/login')} style={{ fontSize:16, padding:'14px 32px' }}>
            Sign In
          </button>
        </div>

        {/* Floating stats */}
        <div className="a-fadeup" style={{ display:'flex', gap:20, justifyContent:'center', marginTop:60, flexWrap:'wrap', animationDelay:'.38s' }}>
          {[['Open Source','Built for devs'],['JWT Auth','Secure by default'],['Docker Ready','1-command deploy']].map(([title,sub])=>(
            <div key={title} style={{ padding:'12px 22px', borderRadius:12, background:'var(--bg-card)', border:'1px solid var(--border)', textAlign:'left' }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>{title}</div>
              <div style={{ fontSize:12, color:'var(--text-2)' }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browser mockup ── */}
      <section style={{ position:'relative', zIndex:1, maxWidth:1160, margin:'0 auto 120px', padding:'0 24px' }}>
        <div className="a-fadeup" style={{ animationDelay:'.45s', borderRadius:22, border:'1px solid var(--border-2)', overflow:'hidden', boxShadow:'0 80px 160px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.03)' }}>
          <div style={{ background:'#0a0c14', borderBottom:'1px solid var(--border)', padding:'12px 18px', display:'flex', alignItems:'center', gap:8 }}>
            {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>)}
            <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
              <div style={{ padding:'4px 20px', borderRadius:6, background:'var(--bg-input)', fontSize:12, color:'var(--text-2)', fontFamily:"'JetBrains Mono',monospace", border:'1px solid var(--border)' }}>taskflow.app/board</div>
            </div>
          </div>
          <div style={{ background:'var(--bg)', padding:'20px 24px', display:'flex', gap:16, minHeight:260, overflowX:'auto' }}>
            {/* Sidebar mini */}
            <div style={{ width:160, background:'var(--bg-card)', borderRadius:12, border:'1px solid var(--border)', padding:'14px 10px', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:18, padding:'4px 6px' }}>
                <div style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,var(--accent),var(--teal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>⚡</div>
                <span style={{ fontSize:13, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>TaskFlow</span>
              </div>
              {['⊞ Dashboard','⬡ Board','✓ Tasks','◎ Teams'].map((item,i)=>(
                <div key={i} style={{ padding:'7px 10px', borderRadius:7, fontSize:12, color: i===1 ? 'var(--accent)' : 'var(--text-2)', background: i===1 ? 'rgba(124,109,250,.12)' : 'transparent', marginBottom:2, borderLeft: i===1 ? '2px solid var(--accent)' : '2px solid transparent' }}>{item}</div>
              ))}
            </div>
            {/* Board columns */}
            {Object.entries(STATUS_CONFIG).map(([st, cfg])=>(
              <div key={st} style={{ flex:1, minWidth:200, background:'var(--bg-card)', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px 10px', background:`${cfg.badge}`, borderBottom:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot }}/>
                  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-2)' }}>{cfg.label}</span>
                </div>
                <div style={{ padding:10, display:'flex', flexDirection:'column', gap:8 }}>
                  {[70,52,80].slice(0, st==='todo'?2:st==='in_progress'?2:3).map((h,i)=>(
                    <div key={i} className="skeleton" style={{ height:h, borderRadius:8 }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ position:'relative', zIndex:1, maxWidth:1160, margin:'0 auto 120px', padding:'0 24px' }}>
        <div style={{ textAlign:'center', marginBottom:64 }}>
          <h2 className="a-fadeup" style={{ fontSize:'clamp(32px,5vw,52px)', fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Everything to ship faster</h2>
          <p className="a-fadeup" style={{ fontSize:17, color:'var(--text-2)', animationDelay:'.08s' }}>Built by developers, for developers. No fluff, just powerful features.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(310px,1fr))', gap:18 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card a-fadeup" style={{ animationDelay:`${.06*i}s`, cursor:'default', transition:'border-color .2s,box-shadow .2s,transform .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.boxShadow='0 0 40px var(--accent-glow)';e.currentTarget.style.transform='translateY(-4px)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform=''}}>
              <div style={{ fontSize:38, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8, fontFamily:"'Syne',sans-serif" }}>{f.title}</h3>
              <p style={{ color:'var(--text-2)', lineHeight:1.65, fontSize:14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position:'relative', zIndex:1, textAlign:'center', padding:'80px 24px 140px' }}>
        <div style={{ display:'inline-block', padding:'64px 88px', borderRadius:28, border:'1px solid var(--border-2)', background:'linear-gradient(135deg,rgba(124,109,250,.07) 0%,rgba(0,229,179,.03) 100%)', maxWidth:700 }}>
          <h2 style={{ fontSize:'clamp(32px,5vw,48px)', fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:16 }}>Ready to flow?</h2>
          <p style={{ fontSize:17, color:'var(--text-2)', marginBottom:40, lineHeight:1.6 }}>Join the future of project management. Free, open source, and built with FastAPI.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize:16, padding:'14px 40px' }}>Create Free Account →</button>
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ fontSize:16, padding:'14px 28px' }}>Sign In</button>
          </div>
        </div>
      </section>
    </div>
  )
}
