import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { useTeams } from '../hooks/useTeams'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../context/AuthContext'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../utils/constants'
import Modal   from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import Avatar  from '../components/ui/Avatar'

// ── api calls ─────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const authFetch = async (url, opts = {}) => {
  const token = localStorage.getItem('taskflow_token')
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...opts,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
  return data
}
const api = {
  post:   (url, body) => authFetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  get:    (url)       => authFetch(url),
  delete: (url)       => authFetch(url, { method: 'DELETE' }),
}

export default function TeamsPage() {
  const { toast }                         = useToast()
  const { user }                          = useAuth()
  const { teams, loading, refresh }       = useTeams()
  const { tasks }                         = useTasks()
  const [selectedTeam, setSelectedTeam]   = useState(null)
  const [showCreate,   setShowCreate]     = useState(false)
  const [creating,     setCreating]       = useState(false)
  const [newTeam,      setNewTeam]        = useState({ name: '', description: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)   // team to delete
  const [deleting,      setDeleting]      = useState(false)

  // ── create team ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newTeam.name.trim()) { toast('Team name required', 'warn'); return }
    setCreating(true)
    try {
      await api.post('/teams/', newTeam)
      toast('Team created! 🎉')
      setShowCreate(false)
      setNewTeam({ name: '', description: '' })
      refresh()
    } catch (e) { toast(e.message, 'error') }
    finally { setCreating(false) }
  }

  // ── delete team ──────────────────────────────────────────────────────────
  const handleDelete = async (team) => {
    setDeleting(true)
    try {
      await api.delete(`/teams/${team.id}`)
      toast(`Team "${team.name}" deleted`)
      setDeleteConfirm(null)
      if (selectedTeam?.id === team.id) setSelectedTeam(null)
      refresh()
    } catch (e) { toast(e.message, 'error') }
    finally { setDeleting(false) }
  }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Teams</h1>
          <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>
            {teams.length} team{teams.length !== 1 ? 's' : ''} · Collaborate & ship together
          </p>
        </div>
        <button className="btn-primary a-slider" onClick={() => setShowCreate(true)}>+ New Team</button>
      </div>

      {/* Team cards */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:170, borderRadius:16 }} />)}
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
            const isOwner  = team.owner_id === undefined || true  // check in detail view

            return (
              <div key={team.id} className="card a-fadeup"
                style={{ animationDelay:`${.07*i}s`, cursor:'pointer', transition:'border-color .2s,box-shadow .2s,transform .22s', position:'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 40px var(--accent-glow)'; e.currentTarget.style.transform='translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='' }}>

                {/* Delete button — top right */}
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(team) }}
                  title="Delete team"
                  style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:17, padding:'3px 6px', borderRadius:6, transition:'all .15s', zIndex:1 }}
                  onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.background='var(--red-glow)' }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.background='none' }}>
                  🗑
                </button>

                {/* Card content */}
                <div onClick={() => setSelectedTeam(team)}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:16, paddingRight:28 }}>
                    <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>◎</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team.name}</h3>
                      {team.description && <p style={{ fontSize:13, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{team.description}</p>}
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:12 }}>{tt.length} tasks · {done} done</div>
                  <div className="progress-track" style={{ height:5, marginBottom:6 }}>
                    <div className="progress-fill" style={{ width:`${progress}%` }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'var(--text-2)' }}>{progress}% complete</span>
                    <span style={{ fontSize:12, color:'var(--accent)', fontWeight:500 }}>View team →</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Create Team Modal ── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label className="label">Team Name *</label>
            <input className="input" placeholder="e.g. Backend Team" autoFocus value={newTeam.name}
              onChange={e => setNewTeam(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="What does this team work on?"
              value={newTeam.description} onChange={e => setNewTeam(f => ({ ...f, description: e.target.value }))}
              style={{ resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? <Spinner size={16} color="#fff" /> : 'Create Team'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Team" width={420}>
        {deleteConfirm && (
          <div>
            <div style={{ padding:'16px 18px', background:'rgba(255,84,112,.06)', border:'1px solid rgba(255,84,112,.2)', borderRadius:12, marginBottom:20 }}>
              <p style={{ fontSize:14, lineHeight:1.6, color:'var(--text-2)' }}>
                Are you sure you want to delete <strong style={{ color:'var(--text)' }}>"{deleteConfirm.name}"</strong>?
                This will permanently remove the team, all members, and all pending invitations.
                <strong style={{ color:'var(--red)', display:'block', marginTop:8 }}>This action cannot be undone.</strong>
              </p>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                style={{ padding:'10px 24px' }}>
                {deleting ? <Spinner size={16} color="var(--red)" /> : '🗑 Delete Team'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Team Detail Modal ── */}
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          tasks={tasks}
          currentUser={user}
          onClose={() => { setSelectedTeam(null); refresh() }}
          toast={toast}
        />
      )}
    </div>
  )
}

// ── Team Detail Modal ──────────────────────────────────────────────────────
function TeamDetailModal({ team, tasks, currentUser, onClose, toast }) {
  const [tab,          setTab]          = useState('members')
  const [members,      setMembers]      = useState([])
  const [projects,     setProjects]     = useState([])
  const [pendingInvites, setPendingInvites] = useState([])
  const [loadingM,     setLoadingM]     = useState(false)
  const [loadingP,     setLoadingP]     = useState(false)
  const [loadingI,     setLoadingI]     = useState(false)
  const [inviteEmail,  setInviteEmail]  = useState('')
  const [inviting,     setInviting]     = useState(false)
  const [inviteResult, setInviteResult] = useState(null)   // show token/result
  const [newProject,   setNewProject]   = useState({ name:'', description:'' })
  const [creatingP,    setCreatingP]    = useState(false)

  const teamTasks = tasks.filter(t => t.team_id === team.id)
  const progress  = teamTasks.length
    ? Math.round(teamTasks.filter(t => t.status === 'done').length / teamTasks.length * 100)
    : 0

  const loadMembers = useCallback(async () => {
    setLoadingM(true)
    try { setMembers(await api.get(`/teams/${team.id}/members`) || []) }
    catch {}
    finally { setLoadingM(false) }
  }, [team.id])

  const loadProjects = useCallback(async () => {
    setLoadingP(true)
    try { setProjects(await api.get(`/teams/${team.id}/projects`) || []) }
    catch {}
    finally { setLoadingP(false) }
  }, [team.id])

  const loadInvites = useCallback(async () => {
    setLoadingI(true)
    try { setPendingInvites(await api.get(`/teams/${team.id}/invites`) || []) }
    catch {}
    finally { setLoadingI(false) }
  }, [team.id])

  useEffect(() => { loadMembers(); loadProjects(); loadInvites() }, [loadMembers, loadProjects, loadInvites])

  // ── invite ────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast('Enter an email address', 'warn'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) { toast('Enter a valid email address', 'warn'); return }
    setInviting(true)
    setInviteResult(null)
    try {
      const res = await api.post(`/teams/${team.id}/invite`, { email: inviteEmail })
      setInviteResult(res)
      toast(res.email_sent ? `✉ Email sent to ${inviteEmail}!` : `Token generated for ${inviteEmail}`)
      setInviteEmail('')
      loadInvites()
    } catch (e) { toast(e.message, 'error') }
    finally { setInviting(false) }
  }

  // ── cancel invite ─────────────────────────────────────────────────────
  const handleCancelInvite = async (inviteId) => {
    try {
      await api.delete(`/teams/${team.id}/invites/${inviteId}`)
      toast('Invitation cancelled')
      loadInvites()
    } catch (e) { toast(e.message, 'error') }
  }

  // ── remove member ─────────────────────────────────────────────────────
  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the team?')) return
    try { await api.delete(`/teams/${team.id}/members/${userId}`); toast('Member removed'); loadMembers() }
    catch (e) { toast(e.message, 'error') }
  }

  // ── create project ────────────────────────────────────────────────────
  const handleCreateProject = async () => {
    if (!newProject.name.trim()) { toast('Project name required', 'warn'); return }
    setCreatingP(true)
    try {
      await api.post(`/teams/${team.id}/projects`, newProject)
      toast('Project created!')
      setNewProject({ name:'', description:'' })
      loadProjects()
    } catch (e) { toast(e.message, 'error') }
    finally { setCreatingP(false) }
  }

  return (
    <Modal open onClose={onClose} title={`◎  ${team.name}`} width={660}>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        {[[teamTasks.length,'Tasks','var(--accent)'],
          [teamTasks.filter(t=>t.status==='done').length,'Done','var(--green)'],
          [members.length,'Members','var(--teal)'],
          [projects.length,'Projects','var(--amber)'],
          [pendingInvites.length,'Pending','var(--text-2)']
        ].map(([v,l,c]) => (
          <div key={l} style={{ flex:1, minWidth:80, padding:'10px 12px', background:'var(--bg-input)', borderRadius:10, textAlign:'center', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:20, fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', marginTop:2, fontWeight:500 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="progress-track" style={{ height:5, marginBottom:20 }}>
        <div className="progress-fill" style={{ width:`${progress}%` }} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:18, background:'var(--bg-input)', borderRadius:10, padding:4 }}>
        {[['members','👥 Members'],['invites','✉ Invites'],['projects','📁 Projects'],['tasks','✓ Tasks']].map(([id,label]) => (
          <button key={id} className={`tab ${tab===id?'active':''}`} onClick={() => setTab(id)} style={{ flex:1 }}>{label}</button>
        ))}
      </div>

      {/* ── MEMBERS tab ── */}
      {tab === 'members' && (
        <div>
          {loadingM ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:58, borderRadius:10 }} />)}
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No members yet.</div>
          ) : members.map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
              <Avatar name={m.username} size={38} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{m.username}</div>
                <div style={{ fontSize:12, color:'var(--text-2)' }}>{m.email}</div>
              </div>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:6, fontWeight:600,
                background: m.role==='owner' ? 'rgba(124,109,250,.15)' : 'var(--bg-hover)',
                color:      m.role==='owner' ? 'var(--accent)'          : 'var(--text-2)',
                border:     `1px solid ${m.role==='owner' ? 'rgba(124,109,250,.3)' : 'var(--border)'}` }}>
                {m.role === 'owner' ? '👑 Owner' : 'Member'}
              </span>
              {m.role !== 'owner' && (
                <button onClick={() => handleRemoveMember(m.id)}
                  style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:16, padding:'2px 5px', transition:'color .15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--red)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── INVITES tab ── */}
      {tab === 'invites' && (
        <div>
          {/* Send invite — works with ANY email */}
          <div style={{ marginBottom:20 }}>
            <label className="label">Invite by email</label>
            <div style={{ display:'flex', gap:8 }}>
              <input className="input" type="email" placeholder="anyone@example.com — registered or not"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()} style={{ flex:1 }} autoFocus />
              <button className="btn-primary" onClick={handleInvite} disabled={inviting}
                style={{ padding:'10px 18px', flexShrink:0 }}>
                {inviting ? <Spinner size={16} color="#fff" /> : '✉ Send'}
              </button>
            </div>
            <p style={{ fontSize:12, color:'var(--text-2)', marginTop:8, lineHeight:1.5 }}>
              The person <strong>doesn't need to have a TaskFlow account</strong> — they'll receive an invite link and can register if needed.
            </p>
          </div>

          {/* Invite result */}
          {inviteResult && (
            <div className="a-scale" style={{ padding:'14px 16px', borderRadius:12, marginBottom:18,
              background: inviteResult.email_sent ? 'rgba(0,229,160,.07)' : 'rgba(255,181,71,.07)',
              border:     `1px solid ${inviteResult.email_sent ? 'rgba(0,229,160,.25)' : 'rgba(255,181,71,.25)'}` }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:6,
                color: inviteResult.email_sent ? 'var(--green)' : 'var(--amber)' }}>
                {inviteResult.email_sent ? '✉ Email sent successfully!' : '⚠ Token generated (SMTP not configured)'}
              </div>
              {!inviteResult.email_sent && (
                <>
                  <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:8, lineHeight:1.5 }}>
                    Share this link manually with <strong>{inviteResult.message?.split('to ')[1]}</strong>:
                    {inviteResult.needs_register && <span style={{ color:'var(--amber)' }}> (they need to register first)</span>}
                  </p>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <code style={{ flex:1, fontSize:11, background:'var(--bg-input)', padding:'7px 10px', borderRadius:7, color:'var(--accent)', wordBreak:'break-all', fontFamily:"'JetBrains Mono',monospace", border:'1px solid var(--border)' }}>
                      {window.location.origin}/invite/accept?token={inviteResult.invite_token}
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/accept?token=${inviteResult.invite_token}`); toast('Link copied!') }}
                      className="btn-ghost" style={{ flexShrink:0, fontSize:12, padding:'7px 12px' }}>
                      📋 Copy
                    </button>
                  </div>
                </>
              )}
              <button onClick={() => setInviteResult(null)}
                style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', fontSize:12, marginTop:8, fontFamily:"'Inter',sans-serif" }}>
                Dismiss ✕
              </button>
            </div>
          )}

          {/* Pending invites list */}
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>
            Pending Invitations ({pendingInvites.length})
          </div>
          {loadingI ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[1,2].map(i => <div key={i} className="skeleton" style={{ height:50, borderRadius:10 }} />)}
            </div>
          ) : pendingInvites.length === 0 ? (
            <div style={{ textAlign:'center', padding:'20px', color:'var(--text-3)', fontSize:13, border:'1px dashed var(--border)', borderRadius:10 }}>
              No pending invitations
            </div>
          ) : pendingInvites.map(inv => (
            <div key={inv.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'rgba(124,109,250,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>✉</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{inv.email}</div>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>
                  Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}
                </div>
              </div>
              <span style={{ fontSize:11, padding:'3px 9px', borderRadius:6, background:'rgba(255,181,71,.12)', color:'var(--amber)', border:'1px solid rgba(255,181,71,.25)', fontWeight:600 }}>
                Pending
              </span>
              <button onClick={() => handleCancelInvite(inv.id)}
                title="Cancel invitation"
                style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 5px', transition:'color .15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--red)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>✕</button>
            </div>
          ))}

          {/* SMTP config hint */}
          <div style={{ marginTop:16, padding:'12px 14px', background:'rgba(124,109,250,.05)', borderRadius:10, border:'1px solid rgba(124,109,250,.15)', fontSize:12, color:'var(--text-2)', lineHeight:1.6 }}>
            💡 <strong style={{ color:'var(--text)' }}>To send real emails:</strong> configure
            <code style={{ color:'var(--accent)', fontFamily:"'JetBrains Mono',monospace" }}> SMTP_HOST</code>,
            <code style={{ color:'var(--accent)', fontFamily:"'JetBrains Mono',monospace" }}> SMTP_USER</code> y
            <code style={{ color:'var(--accent)', fontFamily:"'JetBrains Mono',monospace" }}> SMTP_PASS</code> en el
            <code style={{ color:'var(--accent)', fontFamily:"'JetBrains Mono',monospace" }}> .env</code> del backend.
            See <strong>ENV_EXAMPLE.txt</strong> in the ZIP.
          </div>
        </div>
      )}

      {/* ── PROJECTS tab ── */}
      {tab === 'projects' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, marginBottom:14, alignItems:'end' }}>
            <div>
              <label className="label">Project Name</label>
              <input className="input" placeholder="Sprint 1" value={newProject.name}
                onChange={e => setNewProject(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Optional" value={newProject.description}
                onChange={e => setNewProject(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button className="btn-teal" onClick={handleCreateProject} disabled={creatingP}
              style={{ padding:'11px 16px', flexShrink:0 }}>
              {creatingP ? <Spinner size={15} /> : '+ Add'}
            </button>
          </div>
          {loadingP ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[1,2].map(i => <div key={i} className="skeleton" style={{ height:60, borderRadius:10 }} />)}
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No projects yet.</div>
          ) : projects.map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>📁</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{p.name}</div>
                {p.description && <div style={{ fontSize:12, color:'var(--text-2)' }}>{p.description}</div>}
              </div>
              <span style={{ fontSize:12, color:'var(--text-2)', background:'var(--bg-hover)', padding:'3px 10px', borderRadius:6, border:'1px solid var(--border)' }}>
                {tasks.filter(t => t.project_id === p.id).length} tasks
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── TASKS tab ── */}
      {tab === 'tasks' && (
        <div>
          {teamTasks.length === 0 ? (
            <div style={{ textAlign:'center', padding:28, color:'var(--text-2)', fontSize:14 }}>No tasks assigned to this team.</div>
          ) : teamTasks.map(t => {
            const pri = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium
            const sta = STATUS_CONFIG[t.status]     || STATUS_CONFIG.todo
            return (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', marginBottom:8, background:'var(--bg-input)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:sta.dot, flexShrink:0 }} />
                <div style={{ flex:1, fontSize:14, fontWeight:500 }}>{t.title}</div>
                <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, fontSize:11 }}>{pri.icon} {pri.label}</span>
                <span className="badge" style={{ background:`${sta.dot}18`, color:sta.dot,  fontSize:11 }}>{sta.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
