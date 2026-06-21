import { useState } from 'react'
import { createTask, updateTask } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import Spinner from '../ui/Spinner'

export default function TaskForm({ task, teams = [], members = [], onClose, onSave }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'todo',
    priority:    task?.priority    || 'medium',
    team_id:     task?.team_id     || '',
    assigned_to: task?.assigned_to || '',
    due_date:    task?.due_date ? task.due_date.split('T')[0] : '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'warn'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        team_id:     form.team_id     ? Number(form.team_id)     : null,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        due_date:    form.due_date    || null,
      }
      if (task?.id) { await updateTask(task.id, payload); toast('Task updated!') }
      else          { await createTask(payload);           toast('Task created!') }
      onSave()
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <label className="label">Title *</label>
        <input className="input" placeholder="e.g. Implement login page" value={form.title} onChange={e=>set('title',e.target.value)} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} placeholder="What needs to be done?" value={form.description}
          onChange={e=>set('description',e.target.value)} style={{ resize:'vertical', minHeight:72 }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e=>set('priority',e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {teams.length > 0 && (
          <div>
            <label className="label">Team</label>
            <select className="input" value={form.team_id} onChange={e=>set('team_id',e.target.value)}>
              <option value="">No Team</option>
              {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}
        {members.length > 0 && (
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={form.assigned_to} onChange={e=>set('assigned_to',e.target.value)}>
              <option value="">Unassigned</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.username}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label">Due Date</label>
          <input className="input" type="date" value={form.due_date} onChange={e=>set('due_date',e.target.value)} />
        </div>
      </div>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:6 }}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : task?.id ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </div>
  )
}
