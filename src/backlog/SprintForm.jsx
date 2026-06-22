import { useState } from 'react'
import { createSprint, updateSprint } from '../services/backlogApi'
import Spinner from '../components/ui/Spinner'

export default function SprintForm({ sprint, teams = [], onClose, onSave, toast }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:       sprint?.name       || '',
    goal:       sprint?.goal       || '',
    start_date: sprint?.start_date || '',
    end_date:   sprint?.end_date   || '',
    team_id:    sprint?.team_id    || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Sprint name is required', 'warn'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        team_id:    form.team_id    ? Number(form.team_id)    : null,
        start_date: form.start_date || null,
        end_date:   form.end_date   || null,
      }
      if (sprint?.id) { await updateSprint(sprint.id, payload); toast('Sprint updated!') }
      else            { await createSprint(payload);             toast('Sprint created! 🚀') }
      onSave()
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div>
        <label className="label">Sprint Name *</label>
        <input className="input" placeholder="e.g. Sprint 1 — Auth & Onboarding" value={form.name}
          onChange={e => set('name', e.target.value)} autoFocus />
      </div>
      <div>
        <label className="label">Sprint Goal</label>
        <textarea className="input" rows={2} placeholder="What do we want to achieve in this sprint?" value={form.goal}
          onChange={e => set('goal', e.target.value)} style={{ resize:'vertical' }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          <label className="label">Start Date</label>
          <input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <label className="label">End Date</label>
          <input className="input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
        </div>
      </div>
      {teams.length > 0 && (
        <div>
          <label className="label">Team</label>
          <select className="input" value={form.team_id} onChange={e => set('team_id', e.target.value)}>
            <option value="">No team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:6 }}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <Spinner size={16} color="#fff" /> : sprint?.id ? 'Save Sprint' : 'Create Sprint'}
        </button>
      </div>
    </div>
  )
}
