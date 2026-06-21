import { useState, useEffect } from 'react'
import { createTeam, inviteMember, getTeamMembers, getTeamProjects, createTeamProject, removeMember } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useTeams } from '../hooks/useTeams'
import { useTasks } from '../hooks/useTasks'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Avatar from '../components/ui/Avatar'

export default function TeamsPage() {
  const { toast } = useToast()
  const { teams, loading, refresh } = useTeams()
  const { tasks } = useTasks()
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [creating, setCreating]         = useState(false)
  const [newTeam, setNewTeam]           = useState({ name:'', description:'' })

  const handleCreate = async () => {
    if (!newTeam.name.trim()) { toast('Team name required', 'warn'); return }
    setCreating(true)
    try { await createTeam(newTeam); toast('Team created! 🎉'); setShowCreate(false); setNewTeam({ name:'', description:'' }); refresh() }
    catch (e) { toast(e.message, 'error') }
    finally { setCreating(false) }
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Teams</h1>
          <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>{teams.length} team{teams.length!==1?'s':''} · Collaborate & ship together</p>
        </div>
        <button className="btn-primary a-slider" onClick={() => setShowCreate(true)}>+ New Team</button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:160, borderRadius:16 }}/>)}
        </div>
      ) : teams.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'var(--text-2)' }}>
          <div style={{ fontSize:64, marginBottom:20 }}>◎</div>
          <h3 style={{ fontSize:20, fontWeight:600, marginBottom:8, color:'var(--text)' }}>No teams yet</h3>
          <p style={{ marginBottom:28 }}>Create a team and invite your collaborators.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>Create First Team</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {teams.map((team, i) => {
            const tt       = tasks.filter(t => t.team_id === team.id)
            const done     = tt.filter(t => t.status === 'done').length
            const progress = tt.length ? Math.round(done / tt.length * 100) : 0
            return (
              <div key={team.id} className="card a-fadeup" style={{ animationDelay:`${.07*i}s`, cursor:'pointer', transition:'border-color .2s,box-shadow .2s,transform .22s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 40px var(--accent-glow)'; e.currentTarget.style.transform='translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='' }}
                onClick={() => setSelectedTeam(team)}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>◎</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{team.name}</h3>
                    {team.description && <p style={{ fontSize:13, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team.description}</p>}
                  </div>
                </div>
                <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:12 }}>{tt.length} tasks · {done} done</div>
                <div className="progress-track" style={{ height:5, marginBottom:6 }}>
                  <div className="progress-fill" style={{ width:`${progress}%` }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'var(--text-2)' }}>{progress}% complete</span>
                  <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>View team →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div><label className="label">Team Name *</label><input className="input" placeholder="e.g. Backend Team" value={newTeam.name} onChange={e => setNewTeam(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="What does this team work on?" value={newTeam.description} onChange={e => setNewTeam(f => ({ ...f, description: e.target.value }))} style={{ resize:'vertical' }}/></div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate} disabled={creating}>{creating ? <Spinner size={16} color="#fff"/> : 'Create Team'}</button>
          </div>
        </div>
      </Modal>

      {selectedTeam && (
        <TeamDetailModal team={selectedTeam} tasks={tasks} onClose={() => { setSelectedTeam(null); refresh() }} />
      )}
    </div>
  )
}

function TeamDetailModal({ team, tasks, onClose }) {
  const { toast } = useToast()
  const [tab, setTab]               = useState('members')
  const [members, setMembers]       = useState([])
  const [projects, setProjects]     = useState([])
  const [loadingM, setLoadingM]     = useState(false)
  const [loadingP, setLoadingP]     = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting]     = useState(false)
  const [newProject, setNewProject] = useState({ name:'', description:'' })
  const [creatingP, setCreatingP]   = useState(false)

  const teamTasks = tasks.filter(t => t.team_id === team.id)
  const progress  = teamTasks.length ? Math.round(teamTasks.filter(t=>t.status==='done').length/teamTasks.length*100) : 0

  useEffect(() => { loadMembers(); loadProjects() }, [team.id])

  const loadMembers = async () => {
    setLoadingM(true)
    try { setMembers(await getTeamMembers(team.id) || []) }
    catch {}
    finally { setLoadingM(false) }
  }
  const loadProjects = async () => {
    setLoadingP(true)
    try { setProjects(await getTeamProjects(team.id) || []) }
    catch {}
    finally { setLoadingP(false) }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast('Enter an email address', 'warn'); return }
    setInviting(true)
    try {
      const res = await inviteMember(team.id, inviteEmail)
      toast(`Invitation sent to ${inviteEmail}! ✉`)
      if (res.invite_token) toast(`Dev token: ${res.invite_token.slice(0,16)}...`, 'warn')
      setInviteEmail('')
    } catch (e) { toast(e.message, 'error') }
    finally { setInviting(false) }
  }

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member from the team?')) return
    try { await removeMember(team.id, userId); toast('Member removed'); loadMembers() }
    catch (e) { toast(e.message, 'error') }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) { toast('Project name required', 'warn'); return }
    setCreatingP(true)
    try { await createTeamProject(team.id, newProject); toast('Project created!'); setNewProject({ name:'', description:'' }); loadProjects() }
    catch (e) { toast(e.message, 'error') }
    finally { setCreatingP(false) }
  }

  return (
    <Modal open onClose={onClose} title={`◎ ${team.name}`} width={640}>
      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        {[[teamTasks.length,'Tasks','var(--accent)'],[teamTasks.filter(t=>t.status==='done').length,'Done','var(--green)'],[members.length,'Members','var(--teal)'],[projects.length,'Projects','var(--amber)']].map(([v,l,c])=>(
          <div key={l} style={{ flex:1, minWidth:80, padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, textAlign:'center', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', marginTop:2, fontWeight:500 }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="progress-track" style={{ height:5, marginBottom:20 }}>
        <div className="progress-fill" style={{ width:`${progress}%` }}/>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:18, background:'var(--bg-input)', borderRadius:10, padding:4 }}>
        {[['members','👥 Members'],['projects','📁 Projects'],['tasks','✓ Tasks']].map(([id,label])=>(
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)} style={{ flex:1 }}>{label}</button>
        ))}
      </div>

      {/* Members */}
      {tab==='members' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <input className="input" type="email" placeholder="colleague@company.com" value={inviteEmail}
              onChange={e=>setInviteEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleInvite()} style={{ flex:1 }}/>
            <button className="btn-primary" onClick={handleInvite} disabled={inviting} style={{ padding:'10px 18px', flexShrink:0 }}>
              {inviting?<Spinner size={16} color="#fff"/>:'✉ Invite'}
            </button>
          </div>
          {loadingM ? <div>{[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:56, marginBottom:8, borderRadius:10 }}/>)}</div>
          : members.length===0 ? <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No members yet. Invite someone!</div>
          : members.map(m=>(
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
              <Avatar name={m.username} size={38}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{m.username}</div>
                <div style={{ fontSize:12, color:'var(--text-2)' }}>{m.email}</div>
              </div>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:6, background:m.role==='owner'?'rgba(124,109,250,.15)':'var(--bg-hover)', color:m.role==='owner'?'var(--accent)':'var(--text-2)', fontWeight:600, border:`1px solid ${m.role==='owner'?'rgba(124,109,250,.3)':'var(--border)'}` }}>
                {m.role==='owner'?'Owner':'Member'}
              </span>
              {m.role!=='owner'&&<button onClick={()=>handleRemove(m.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:16, padding:'2px 5px', transition:'color .15s' }}
                onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='var(--text-3)'}>✕</button>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {tab==='projects' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:14, alignItems:'end' }}>
            <div><label className="label">Project Name</label><input className="input" placeholder="Sprint 1" value={newProject.name} onChange={e=>setNewProject(f=>({...f,name:e.target.value}))}/></div>
            <div><label className="label">Description</label><input className="input" placeholder="Optional" value={newProject.description} onChange={e=>setNewProject(f=>({...f,description:e.target.value}))}/></div>
            <button className="btn-teal" onClick={handleCreateProject} disabled={creatingP} style={{ padding:'11px 16px', flexShrink:0 }}>
              {creatingP?<Spinner size={15}/>:'+ Add'}
            </button>
          </div>
          {loadingP ? <div>{[1,2].map(i=><div key={i} className="skeleton" style={{ height:60, marginBottom:8, borderRadius:10 }}/>)}</div>
          : projects.length===0 ? <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No projects yet. Create the first one!</div>
          : projects.map(p=>(
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>📁</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{p.name}</div>
                {p.description&&<div style={{ fontSize:12, color:'var(--text-2)' }}>{p.description}</div>}
              </div>
              <span style={{ fontSize:12, color:'var(--text-2)', background:'var(--bg-hover)', padding:'3px 10px', borderRadius:6, border:'1px solid var(--border)' }}>
                {tasks.filter(t=>t.project_id===p.id).length} tasks
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Team tasks */}
      {tab==='tasks' && (
        <div>
          {teamTasks.length===0 ? <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No tasks assigned to this team yet.</div>
          : teamTasks.map(t=>{
            const pri=PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.medium
            const sta=STATUS_CONFIG[t.status]||STATUS_CONFIG.todo
            return (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:sta.dot, flexShrink:0, boxShadow:`0 0 6px ${sta.dot}80` }}/>
                <div style={{ flex:1, fontSize:14, fontWeight:500 }}>{t.title}</div>
                <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, fontSize:11 }}>{pri.icon} {pri.label}</span>
                <span className="badge" style={{ background:`${sta.dot}18`, color:sta.dot, fontSize:11 }}>{sta.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
