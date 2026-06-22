import { useState } from 'react'
import { createBacklogItem, updateBacklogItem } from '../services/backlogApi'
import Spinner from '../components/ui/Spinner'

export default function ItemForm({ item, sprints = [], teams = [], onClose, onSave, toast }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:        item?.title        || '',
    description:  item?.description  || '',
    item_type:    item?.item_type    || 'story',
    priority:     item?.priority     || 'medium',
    story_points: item?.story_points ?? '',
    sprint_id:    item?.sprint_id    || '',
    team_id:      item?.team_id      || '',
    labels:       item?.labels       || '',
    status:       item?.status       || 'backlog',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'warn'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        story_points: form.story_points !== '' ? Number(form.story_points) : null,
        sprint_id:    form.sprint_id    !== '' ? Number(form.sprint_id)    : null,
        team_id:      form.team_id      !== '' ? Number(form.team_id)      : null,
      }
      if (item?.id) { await updateBacklogItem(item.id, payload); toast('Item updated!') }
      else          { await createBacklogItem(payload);           toast('Item created!') }
      onSave()
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Type selector */}
      <div>
        <label className="label">Type</label>
        <div style={{ display:'flex', gap:8 }}>
          {[['story','📖','Story'],['bug','🐛','Bug'],['task','✓','Task'],['epic','⚡','Epic']].map(([val,icon,label]) => (
            <button key={val} onClick={() => set('item_type', val)} style={{
              flex:1, padding:'9px 8px', borderRadius:9, border:`1px solid ${form.item_type===val ? 'var(--accent)' : 'var(--border)'}`,
              background: form.item_type===val ? 'rgba(124,109,250,.12)' : 'var(--bg-input)',
              color: form.item_type===val ? 'var(--accent)' : 'var(--text-2)',
              cursor:'pointer', fontSize:13, fontWeight:500, fontFamily:"'Inter',sans-serif",
              transition:'all .15s',
            }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="label">Title *</label>
        <input className="input" placeholder="As a user, I want to..." value={form.title}
          onChange={e => set('title', e.target.value)} autoFocus />
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} placeholder="Acceptance criteria, details..." value={form.description}
          onChange={e => set('description', e.target.value)} style={{ resize:'vertical', minHeight:72 }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 80px', gap:12 }}>
        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="low">▼ Low</option>
            <option value="medium">◆ Medium</option>
            <option value="high">▲ High</option>
          </select>
        </div>
        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        {/* Story points */}
        <div>
          <label className="label">Points</label>
          <input className="input" type="number" min={0} max={100} placeholder="—" value={form.story_points}
            onChange={e => set('story_points', e.target.value)} style={{ textAlign:'center' }} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Sprint */}
        <div>
          <label className="label">Sprint</label>
          <select className="input" value={form.sprint_id} onChange={e => set('sprint_id', e.target.value)}>
            <option value="">Backlog (no sprint)</option>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {/* Team */}
        {teams.length > 0 && (
          <div>
            <label className="label">Team</label>
            <select className="input" value={form.team_id} onChange={e => set('team_id', e.target.value)}>
              <option value="">No team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Labels */}
      <div>
        <label className="label">Labels <span style={{ fontWeight:400, textTransform:'none', fontSize:11 }}>(comma-separated)</span></label>
        <input className="input" placeholder="bug, frontend, v2, urgent" value={form.labels}
          onChange={e => set('labels', e.target.value)} />
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:6 }}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : item?.id ? 'Save Changes' : 'Create Item'}
        </button>
      </div>
    </div>
  )
}
