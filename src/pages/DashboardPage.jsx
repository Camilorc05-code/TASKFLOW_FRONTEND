import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { useTeams } from '../hooks/useTeams'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/constants'
import { getGreeting, formatDate } from '../utils/helpers'
import StatCard from '../components/dashboard/StatCard'
import Spinner from '../components/ui/Spinner'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { tasks, loading } = useTasks()
  const { teams } = useTeams()

  const stats = {
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done:       tasks.filter(t => t.status === 'done').length,
    high:       tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  }
  const rate   = stats.total ? Math.round((stats.done / stats.total) * 100) : 0
  const recent = [...tasks].sort((a, b) => b.id - a.id).slice(0, 6)

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={44} />
      <p style={{ color:'var(--text-2)' }}>Loading workspace...</p>
    </div>
  )

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div className="a-fadeup" style={{ fontSize:26, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>
          {getGreeting()}, {user} 👋
        </div>
        <div className="a-fadeup" style={{ color:'var(--text-2)', fontSize:15, animationDelay:'.07s' }}>
          {stats.inProgress > 0
            ? `${stats.inProgress} task${stats.inProgress > 1 ? 's' : ''} in progress. Keep going!`
            : stats.total === 0 ? 'No tasks yet. Create your first one!'
            : 'All caught up — great work! 🎉'}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
        <StatCard label="Total Tasks"   value={stats.total}      color="var(--accent)" icon="⬡" delay={.05} />
        <StatCard label="In Progress"   value={stats.inProgress} color="#5b8fff"        icon="⚡" sub="Active" delay={.1} />
        <StatCard label="Completed"     value={stats.done}       color="var(--green)"   icon="✓" sub={`${rate}% done`} delay={.15} />
        <StatCard label="High Priority" value={stats.high}       color="var(--red)"     icon="▲" sub="Urgent" delay={.2} />
      </div>

      {/* Progress */}
      <div className="card a-fadeup" style={{ marginBottom:24, animationDelay:'.25s' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:15, fontWeight:600, fontFamily:"'Syne',sans-serif" }}>Sprint Progress</div>
          <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", color:'var(--teal)' }}>{rate}%</div>
        </div>
        <div className="progress-track" style={{ height:10, marginBottom:14 }}>
          <div className="progress-fill" style={{ width:`${rate}%` }}/>
        </div>
        <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-2)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot }}/>
              {cfg.label}: <strong style={{ color:'var(--text)' }}>{tasks.filter(t=>t.status===s).length}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>

        {/* Recent Tasks */}
        <div className="card a-fadeup" style={{ animationDelay:'.3s' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h3 style={{ fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>Recent Tasks</h3>
            <button onClick={() => navigate('/tasks')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>View all →</button>
          </div>
          {recent.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-2)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <button onClick={() => navigate('/board')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontFamily:"'Inter',sans-serif", fontSize:14 }}>Create your first task →</button>
            </div>
          ) : recent.map((task, i) => {
            const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
            const sta = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo
            return (
              <div key={task.id} className="a-fadein" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i < recent.length-1 ? '1px solid var(--border)' : 'none', animationDelay:`${.05*i}s` }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:sta.dot, flexShrink:0, boxShadow:`0 0 6px ${sta.dot}80` }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
                  {task.due_date && <div style={{ fontSize:12, color:'var(--text-2)' }}>{formatDate(task.due_date)}</div>}
                </div>
                <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, flexShrink:0, border:`1px solid ${pri.color}28` }}>
                  {pri.icon} {pri.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Quick actions */}
          <div className="card a-fadeup" style={{ animationDelay:'.35s' }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>Quick Actions</h3>
            {[
              { icon:'⬡', label:'Open Board',   path:'/board',    color:'var(--accent)' },
              { icon:'✓', label:'All Tasks',     path:'/tasks',    color:'var(--teal)'   },
              { icon:'◎', label:'Teams',         path:'/teams',    color:'var(--amber)'  },
              { icon:'⚙', label:'Settings',      path:'/settings', color:'var(--text-2)' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 13px',
                background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:10,
                color:'var(--text)', fontSize:13, fontWeight:500, cursor:'pointer', marginBottom:7,
                transition:'all .18s', fontFamily:"'Inter',sans-serif", textAlign:'left',
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background=`${a.color}12`}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-input)'}}>
                <span style={{ fontSize:18, color:a.color, width:22, textAlign:'center' }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>

          {/* Teams mini */}
          {teams.length > 0 && (
            <div className="card a-fadeup" style={{ animationDelay:'.42s' }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>My Teams</h3>
              {teams.slice(0,3).map(team => {
                const tt = tasks.filter(t => t.team_id === team.id)
                const done = tt.filter(t => t.status === 'done').length
                const pct  = tt.length ? Math.round(done/tt.length*100) : 0
                return (
                  <div key={team.id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13 }}>
                      <span style={{ fontWeight:500 }}>{team.name}</span>
                      <span style={{ color:'var(--text-2)' }}>{pct}%</span>
                    </div>
                    <div className="progress-track" style={{ height:5 }}>
                      <div className="progress-fill" style={{ width:`${pct}%` }}/>
                    </div>
                  </div>
                )
              })}
              <button onClick={() => navigate('/teams')} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, fontFamily:"'Inter',sans-serif", fontWeight:500, padding:0, marginTop:6 }}>View all teams →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
