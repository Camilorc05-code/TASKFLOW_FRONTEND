import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { useTeams } from '../hooks/useTeams'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/constants'
import { getGreeting, formatDate } from '../utils/helpers'
import StatCard from '../components/dashboard/StatCard'
import Spinner from '../components/ui/Spinner'

export default function DashboardPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const { tasks, loading } = useTasks()
  const { teams } = useTeams()

  const stats = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
    high:       tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  }
  const rate   = stats.total ? Math.round(stats.done / stats.total * 100) : 0
  const recent = [...tasks].sort((a, b) => b.id - a.id).slice(0, 5)

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={44} /><p style={{ color:'var(--text-2)' }}>Loading workspace...</p>
    </div>
  )

  return (
    <div className="page-content" style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 className="a-slidel" style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>
          {getGreeting()}, {user} 👋
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:14 }}>
          {stats.inProgress > 0
            ? `${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress.`
            : stats.total === 0 ? 'No tasks yet — create your first one!'
            : 'All caught up! 🎉'}
        </p>
      </div>

      {/* Stats — 2 cols en móvil, 4 en desktop */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        <StatCard label="Total"       value={stats.total}      color="var(--accent)" icon="⬡" delay={.05} />
        <StatCard label="In Progress" value={stats.inProgress} color="#5b8fff"        icon="⚡" delay={.1} />
        <StatCard label="Done"        value={stats.done}       color="var(--green)"   icon="✓" delay={.15} />
        <StatCard label="High Pri"    value={stats.high}       color="var(--red)"     icon="▲" delay={.2} />
      </div>

      {/* Progress */}
      <div className="card a-fadeup" style={{ marginBottom:20, animationDelay:'.22s' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:15, fontWeight:600, fontFamily:"'Syne',sans-serif" }}>Sprint Progress</div>
          <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", color:'var(--teal)' }}>{rate}%</div>
        </div>
        <div className="progress-track" style={{ height:8, marginBottom:12 }}>
          <div className="progress-fill" style={{ width:`${rate}%` }} />
        </div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-2)' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:cfg.dot }} />
              {cfg.label}: <strong style={{ color:'var(--text)' }}>{tasks.filter(t => t.status === s).length}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom — stacked en móvil */}
      <div className="bottom-grid" style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:18, alignItems:'start' }}>

        {/* Recent tasks */}
        <div className="card a-fadeup" style={{ animationDelay:'.28s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Recent Tasks</h3>
            <button onClick={() => navigate('/tasks')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>
              View all →
            </button>
          </div>
          {recent.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-2)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📋</div>
              <button onClick={() => navigate('/board')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:14 }}>Create your first task →</button>
            </div>
          ) : recent.map((task, i) => {
            const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
            const sta = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo
            return (
              <div key={task.id} className="a-fadein" style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < recent.length-1 ? '1px solid var(--border)' : 'none', animationDelay:`${i*.05}s` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:sta.dot, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
                  {task.due_date && <div style={{ fontSize:11, color:'var(--text-2)' }}>{formatDate(task.due_date)}</div>}
                </div>
                <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, flexShrink:0, border:`1px solid ${pri.color}28`, fontSize:11 }}>
                  {pri.icon} {pri.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div className="a-fadeup" style={{ animationDelay:'.34s', display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card">
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>Quick Actions</h3>
            <div className="quick-actions">
              {[
                { icon:'⬡', label:'Board',    path:'/board',    color:'var(--accent)' },
                { icon:'✓', label:'Tasks',    path:'/tasks',    color:'var(--teal)'   },
                { icon:'◎', label:'Teams',    path:'/teams',    color:'var(--amber)'  },
                { icon:'⚙', label:'Settings', path:'/settings', color:'var(--text-2)' },
              ].map(a => (
                <button key={a.label} onClick={() => navigate(a.path)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'11px 12px',
                  background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:10,
                  color:'var(--text)', fontSize:13, fontWeight:500, cursor:'pointer', marginBottom:7,
                  transition:'all .18s', fontFamily:"'Inter',sans-serif", textAlign:'left', width:'100%',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background=`${a.color}12`}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-input)'}}>
                  <span style={{ fontSize:18, color:a.color, width:22, textAlign:'center' }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
          {teams.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>My Teams</h3>
              {teams.slice(0,3).map(team => {
                const tt  = tasks.filter(t => t.team_id === team.id)
                const pct = tt.length ? Math.round(tt.filter(t=>t.status==='done').length/tt.length*100) : 0
                return (
                  <div key={team.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13 }}>
                      <span style={{ fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, marginRight:8 }}>{team.name}</span>
                      <span style={{ color:'var(--text-2)', flexShrink:0 }}>{pct}%</span>
                    </div>
                    <div className="progress-track" style={{ height:4 }}>
                      <div className="progress-fill" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <button onClick={() => navigate('/teams')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, fontFamily:"'Inter',sans-serif", fontWeight:500, padding:0, marginTop:4 }}>
                View all →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
