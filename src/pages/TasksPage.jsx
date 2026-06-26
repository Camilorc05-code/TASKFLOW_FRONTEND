import { useState } from 'react'
import { deleteTask } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useTasks } from '../hooks/useTasks'
import { useTeams } from '../hooks/useTeams'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/constants'
import { formatDate } from '../utils/helpers'
import Modal from '../components/ui/Modal'
import TaskForm from '../components/tasks/TaskForm'
import Spinner from '../components/ui/Spinner'

export default function TasksPage() {
  const { toast }   = useToast()
  const { tasks, loading, refresh } = useTasks()
  const { teams }   = useTeams()
  const [filter, setFilter]         = useState({ status:'', priority:'', search:'' })
  const [editTask, setEditTask]     = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = tasks.filter(t =>
    (!filter.status   || t.status   === filter.status) &&
    (!filter.priority || t.priority === filter.priority) &&
    (!filter.search   || t.title.toLowerCase().includes(filter.search.toLowerCase()))
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try { await deleteTask(id); toast('Task deleted'); refresh() }
    catch (e) { toast(e.message, 'error') }
  }

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={44} /><p style={{ color:'var(--text-2)' }}>Loading tasks...</p>
    </div>
  )

  return (
    <div className="page-content" style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>

      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:3 }}>All Tasks</h1>
          <p style={{ color:'var(--text-2)', fontSize:13 }}>{filtered.length} of {tasks.length} tasks</p>
        </div>
        <button className="btn-primary a-slider" onClick={() => setShowCreate(true)} style={{ flexShrink:0 }}>+ Task</button>
      </div>

      {/* Filters */}
      <div className="filters-row" style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <input className="input" placeholder="🔍  Search..." style={{ flex:1, minWidth:160 }}
          value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} />
        <select className="input" style={{ width:130, flexShrink:0 }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select className="input" style={{ width:130, flexShrink:0 }} value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {(filter.status || filter.priority || filter.search) && (
          <button className="btn-ghost" onClick={() => setFilter({ status:'', priority:'', search:'' })} style={{ flexShrink:0 }}>✕</button>
        )}
      </div>

      {/* Lista */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>

        {/* Cabecera — oculta en móvil */}
        <div className="tasks-table-header" style={{ display:'grid', gridTemplateColumns:'1fr 120px 100px 100px 70px', gap:12, padding:'10px 18px', borderBottom:'1px solid var(--border)', fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>
          <span>Task</span><span>Status</span><span>Priority</span><span>Due</span><span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text-2)' }}>
            <div style={{ fontSize:44, marginBottom:14 }}>📋</div>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Task</button>
          </div>
        ) : filtered.map((task, i) => {
          const sta = STATUS_CONFIG[task.status]     || STATUS_CONFIG.todo
          const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
          return (
            <div key={task.id} className="task-table-row a-fadein"
              style={{
                display:'grid', gridTemplateColumns:'1fr 120px 100px 100px 70px', gap:12,
                padding:'12px 18px', borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none',
                transition:'background .15s', animationDelay:`${i*.025}s`,
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

              {/* Title */}
              <div style={{ alignSelf:'center', minWidth:0 }}>
                <div className="task-title" style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
                {/* En móvil, status + priority aparecen debajo del título */}
                <div className="task-meta" style={{ display:'none', gap:6, marginTop:6, flexWrap:'wrap' }}>
                  <span className="badge" style={{ background:`${sta.dot}18`, color:sta.dot, fontSize:11 }}>{sta.label}</span>
                  <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, fontSize:11 }}>{pri.icon} {pri.label}</span>
                  {task.due_date && <span style={{ fontSize:11, color:'var(--text-2)' }}>📅 {formatDate(task.due_date)}</span>}
                  <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                    <button onClick={()=>setEditTask(task)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:15, padding:'2px 4px' }}>✎</button>
                    <button onClick={()=>handleDelete(task.id)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:15, padding:'2px 4px' }}>✕</button>
                  </div>
                </div>
              </div>

              <div style={{ alignSelf:'center' }}>
                <span className="badge" style={{ background:`${sta.dot}18`, color:sta.dot, border:`1px solid ${sta.dot}30`, fontSize:11 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:sta.dot, display:'inline-block' }}/>
                  {sta.label}
                </span>
              </div>
              <div style={{ alignSelf:'center' }}>
                <span className="badge" style={{ background:`${pri.color}14`, color:pri.color, fontSize:11 }}>{pri.icon} {pri.label}</span>
              </div>
              <div style={{ alignSelf:'center', fontSize:12, color:'var(--text-2)' }}>{formatDate(task.due_date)}</div>
              <div style={{ alignSelf:'center', display:'flex', gap:6 }}>
                <button onClick={()=>setEditTask(task)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 5px', transition:'color .15s' }}
                  onMouseEnter={e=>e.target.style.color='var(--accent)'} onMouseLeave={e=>e.target.style.color='var(--text-3)'}>✎</button>
                <button onClick={()=>handleDelete(task.id)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:15, padding:'2px 5px', transition:'color .15s' }}
                  onMouseEnter={e=>e.target.style.color='var(--red)'} onMouseLeave={e=>e.target.style.color='var(--text-3)'}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <TaskForm teams={teams} onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); refresh() }} />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <TaskForm teams={teams} task={editTask} onClose={() => setEditTask(null)} onSave={() => { setEditTask(null); refresh() }} />}
      </Modal>
    </div>
  )
}
