import { useState } from 'react'
import { STATUS_CONFIG } from '../../utils/constants'
import TaskCard from '../tasks/TaskCard'

export default function KanbanColumn({ status, tasks, onEdit, onDelete, onDrop, onAddTask, onDragStart }) {
  const [over, setOver] = useState(false)
  const cfg = STATUS_CONFIG[status]

  return (
    <div onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={()=>{setOver(false);onDrop(status)}}
      className={over ? 'col-dragover' : ''}
      style={{
        minWidth:290, maxWidth:340, flex:1, display:'flex', flexDirection:'column',
        background:'var(--bg-card)', borderRadius:16, border:'1px solid var(--border)',
        transition:'border-color .2s,box-shadow .2s', overflow:'hidden',
        animation:'colReveal .5s cubic-bezier(.22,.68,0,1.2)',
      }}>
      {/* Header */}
      <div style={{ padding:'16px 16px 12px', background:`${cfg.badge}`, borderBottom:`1px solid ${cfg.border}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:9, height:9, borderRadius:'50%', background:cfg.dot, boxShadow:`0 0 8px ${cfg.dot}80` }} />
            <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-2)' }}>{cfg.label}</span>
          </div>
          <span style={{ background:'var(--bg-input)', color:cfg.dot, padding:'2px 10px', borderRadius:100, fontSize:12, fontWeight:700, border:`1px solid ${cfg.border}` }}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8 }}>
        {tasks.map((task, i) => (
          <div key={task.id} style={{ animationDelay:`${i*.05}s` }}>
            <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} draggable onDragStart={()=>onDragStart(task)} />
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px 12px', color:'var(--text-3)', fontSize:13, border:'1px dashed var(--border)', borderRadius:10, margin:4 }}>
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add btn */}
      <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)' }}>
        <button onClick={()=>onAddTask(status)} style={{
          width:'100%', background:'none', border:'none', color:'var(--text-3)',
          cursor:'pointer', fontSize:13, padding:'8px', borderRadius:8,
          transition:'all .15s', fontFamily:"'Inter',sans-serif",
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)';e.currentTarget.style.color='var(--text-2)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-3)'}}>
          + Add task
        </button>
      </div>
    </div>
  )
}
