import { useState } from 'react'
import { moveItemToSprint, deleteBacklogItem } from '../services/backlogApi'

const TYPE_CFG = {
  story: { icon:'📖', color:'#5b8fff', label:'Story' },
  bug:   { icon:'🐛', color:'#ff5470', label:'Bug'   },
  task:  { icon:'✓',  color:'#8891b0', label:'Task'  },
  epic:  { icon:'⚡', color:'#ffb547', label:'Epic'  },
}
const PRI_CFG = {
  low:    { color:'#8891b0', icon:'▼' },
  medium: { color:'#ffb547', icon:'◆' },
  high:   { color:'#ff5470', icon:'▲' },
}

export default function BacklogItemRow({ item, sprints, onRefresh, onEdit, isDragging, onDragStart, onDragEnd }) {
  const type = TYPE_CFG[item.item_type] || TYPE_CFG.task
  const pri  = PRI_CFG[item.priority]   || PRI_CFG.medium
  const [moving, setMoving] = useState(false)

  const handleMove = async (sprintId) => {
    setMoving(true)
    try { await moveItemToSprint(item.id, sprintId === '' ? null : Number(sprintId)); onRefresh() }
    catch (e) { alert(e.message) }
    finally { setMoving(false) }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this item?')) return
    try { await deleteBacklogItem(item.id); onRefresh() }
    catch (e) { alert(e.message) }
  }

  const labels = item.labels ? item.labels.split(',').map(l => l.trim()).filter(Boolean) : []

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        display:'flex', alignItems:'center', gap:12, padding:'11px 16px',
        borderBottom:'1px solid var(--border)', background:'var(--bg-card)',
        cursor:'grab', transition:'background .15s',
        opacity: isDragging ? .4 : 1,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
    >
      {/* drag handle */}
      <span style={{ color:'var(--text-3)', fontSize:14, cursor:'grab', flexShrink:0 }}>⠿</span>

      {/* type icon */}
      <span title={type.label} style={{ fontSize:16, flexShrink:0 }}>{type.icon}</span>

      {/* title */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom: labels.length ? 4 : 0 }}>
          {item.title}
        </div>
        {labels.length > 0 && (
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {labels.map(l => (
              <span key={l} style={{ fontSize:10, padding:'1px 7px', borderRadius:4, background:'rgba(124,109,250,.12)', color:'var(--accent)', fontWeight:600 }}>{l}</span>
            ))}
          </div>
        )}
      </div>

      {/* story points */}
      {item.story_points != null && (
        <span style={{ fontSize:12, minWidth:28, textAlign:'center', padding:'3px 8px', borderRadius:7, background:'var(--bg-input)', color:'var(--text-2)', fontWeight:700, flexShrink:0 }}>
          {item.story_points}
        </span>
      )}

      {/* priority */}
      <span title={pri.label} style={{ color:pri.color, fontSize:13, flexShrink:0 }}>{pri.icon}</span>

      {/* sprint selector */}
      <select
        value={item.sprint_id || ''}
        onChange={e => handleMove(e.target.value)}
        disabled={moving}
        onClick={e => e.stopPropagation()}
        style={{ fontSize:12, padding:'4px 8px', background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:7, color:'var(--text-2)', cursor:'pointer', maxWidth:130 }}>
        <option value="">Backlog</option>
        {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {/* actions */}
      <button onClick={e => { e.stopPropagation(); onEdit(item) }}
        style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 5px', transition:'color .15s', flexShrink:0 }}
        onMouseEnter={e => e.target.style.color = 'var(--accent)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>✎</button>
      <button onClick={handleDelete}
        style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 5px', transition:'color .15s', flexShrink:0 }}
        onMouseEnter={e => e.target.style.color = 'var(--red)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>✕</button>
    </div>
  )
}
