import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/constants'
import { formatDate } from '../../utils/helpers'

export default function TaskCard({ task, onEdit, onDelete, draggable, onDragStart }) {
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const sta = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo

  return (
    <div draggable={draggable} onDragStart={onDragStart}
      style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:12, padding:14, cursor: draggable ? 'grab' : 'default',
        transition:'all .22s cubic-bezier(.22,.68,0,1.2)',
        animation:'cardPop .4s cubic-bezier(.22,.68,0,1.2) forwards',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.35)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='none' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <h4 style={{ fontSize:14, fontWeight:600, lineHeight:1.35, flex:1, marginRight:8 }}>{task.title}</h4>
        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
          <button onClick={() => onEdit(task)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 4px', borderRadius:4, transition:'color .15s' }}
            onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='var(--text-3)'}>✎</button>
          <button onClick={() => onDelete(task.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 4px', borderRadius:4, transition:'color .15s' }}
            onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='var(--text-3)'}>✕</button>
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {task.description}
        </p>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, color:pri.color, display:'flex', alignItems:'center', gap:3, background:`${pri.color}14`, padding:'2px 8px', borderRadius:5, border:`1px solid ${pri.color}28`, fontWeight:500 }}>
          {pri.icon} {pri.label}
        </span>
        {task.assigned_to && (
          <span style={{ fontSize:11, color:'var(--text-2)', background:'var(--bg-input)', padding:'2px 8px', borderRadius:5 }}>
            👤 #{task.assigned_to}
          </span>
        )}
        {task.due_date && (
          <span style={{ fontSize:11, color:'var(--text-2)', marginLeft:'auto' }}>📅 {formatDate(task.due_date)}</span>
        )}
      </div>
    </div>
  )
}
