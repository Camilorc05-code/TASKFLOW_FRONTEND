function TeamDetailModal({ team, tasks, currentUser, onClose, toast }) {
  const [tab, setTab] = useState('members')
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [pendingInvites, setPendingInvites] = useState([])

  const [loadingM, setLoadingM] = useState(false)
  const [loadingP, setLoadingP] = useState(false)
  const [loadingI, setLoadingI] = useState(false)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [creatingP, setCreatingP] = useState(false)

  const teamTasks = tasks.filter(t => t.team_id === team.id)

  const progress = teamTasks.length
    ? Math.round(teamTasks.filter(t => t.status === 'done').length / teamTasks.length * 100)
    : 0

  const loadMembers = useCallback(async () => {
    setLoadingM(true)
    try {
      setMembers(await api.get(`/teams/${team.id}/members`) || [])
    } catch {}
    finally { setLoadingM(false) }
  }, [team.id])

  const loadProjects = useCallback(async () => {
    setLoadingP(true)
    try {
      setProjects(await api.get(`/teams/${team.id}/projects`) || [])
    } catch {}
    finally { setLoadingP(false) }
  }, [team.id])

  const loadInvites = useCallback(async () => {
    setLoadingI(true)
    try {
      setPendingInvites(await api.get(`/teams/${team.id}/invites`) || [])
    } catch {}
    finally { setLoadingI(false) }
  }, [team.id])

  useEffect(() => {
    loadMembers()
    loadProjects()
    loadInvites()
  }, [loadMembers, loadProjects, loadInvites])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return toast('Enter email', 'warn')

    setInviting(true)
    setInviteResult(null)

    try {
      const res = await api.post(`/teams/${team.id}/invite`, { email: inviteEmail })
      setInviteResult(res)
      setInviteEmail('')
      loadInvites()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleCancelInvite = async (inviteId) => {
    try {
      await api.delete(`/teams/${team.id}/invites/${inviteId}`)
      loadInvites()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return toast('Project name required', 'warn')

    setCreatingP(true)
    try {
      await api.post(`/teams/${team.id}/projects`, newProject)
      setNewProject({ name: '', description: '' })
      loadProjects()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setCreatingP(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`◎ ${team.name}`} width={660}>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap' }}>
        {[
          [teamTasks.length, 'Tasks', 'var(--accent)'],
          [teamTasks.filter(t => t.status === 'done').length, 'Done', 'var(--green)'],
          [members.length, 'Members', 'var(--teal)'],
          [projects.length, 'Projects', 'var(--amber)'],
          [pendingInvites.length, 'Pending', 'var(--text-2)']
        ].map(([v, l, c]) => (
          <div key={l} style={{ flex:1, minWidth:80, padding:'10px 12px', background:'var(--bg-input)', borderRadius:10, textAlign:'center', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:20, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="progress-track" style={{ height:5, marginBottom:20 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:18, background:'var(--bg-input)', borderRadius:10, padding:4 }}>
        {[
          ['members','👥 Members'],
          ['invites','✉ Invites'],
          ['projects','📁 Projects'],
          ['tasks','✓ Tasks']
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tab ${tab === id ? 'active' : ''}`}
            style={{ flex:1 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* MEMBERS */}
      {tab === 'members' && (
        <div>
          {members.map(m => (
            <div key={m.id} style={{ padding:10, border:'1px solid var(--border)', marginBottom:8 }}>
              {m.username}
            </div>
          ))}
        </div>
      )}

      {/* INVITES */}
      {tab === 'invites' && (
        <div>

          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="email"
          />

          <button onClick={handleInvite} disabled={inviting}>
            Send
          </button>

          {inviteResult && (
            <div>
              {inviteResult.email_sent ? 'Sent' : 'Token generated'}
            </div>
          )}

          <div>
            {pendingInvites.map(inv => (
              <div key={inv.id}>
                {inv.email}
                <button onClick={() => handleCancelInvite(inv.id)}>✕</button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* PROJECTS */}
      {tab === 'projects' && (
        <div>

          <input
            value={newProject.name}
            onChange={e => setNewProject(f => ({ ...f, name: e.target.value }))}
            placeholder="Project name"
          />

          <button onClick={handleCreateProject} disabled={creatingP}>
            Add
          </button>

          {projects.map(p => (
            <div key={p.id}>{p.name}</div>
          ))}

        </div>
      )}

      {/* TASKS */}
      {tab === 'tasks' && (
        <div>
          {teamTasks.map(t => (
            <div key={t.id}>{t.title}</div>
          ))}
        </div>
      )}

    </Modal>
  )
}