import { useState } from 'react'
import { updateTask, deleteTask } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useTasks } from '../hooks/useTasks'
import { useTeams } from '../hooks/useTeams'
import { STATUS_CONFIG } from '../utils/constants'
import KanbanColumn from '../components/board/KanbanColumn'
import Modal from '../components/ui/Modal'
import TaskForm from '../components/tasks/TaskForm'
import Spinner from '../components/ui/Spinner'

export default function BoardPage() {
  const { toast } = useToast()
  const { tasks, loading, refresh } = useTasks()
  const { teams } = useTeams()
  const [dragTask, setDragTask]         = useState(null)
  const [editTask, setEditTask]         = useState(null)
  const [showCreate, setShowCreate]     = useState(false)
  const [createStatus, setCreateStatus] = useState('todo')

  const byStatus = s => tasks.filter(t => t.status === s)

  const handleDrop = async (status) => {
    if (!dragTask || dragTask.status === status) { setDragTask(null); return }
    try { await updateTask(dragTask.id, { ...dragTask, status }); toast(`Moved to ${STATUS_CONFIG[status].label}`); refresh() }
    catch (e) { toast(e.message, 'error') }
    setDragTask(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try { await deleteTask(id); toast('Task deleted'); refresh() }
    catch (e) { toast(e.message, 'error') }
  }

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={44}/><p style={{ color:'var(--text-2)' }}>Loading board...</p>
    </div>
  )

  return (
    <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'24px 28px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Kanban Board</h1>
          <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>{tasks.length} tasks · drag to move between columns</p>
        </div>
        <button className="btn-primary a-slider" onClick={() => { setCreateStatus('todo'); setShowCreate(true) }}>+ New Task</button>
      </div>

      <div style={{ flex:1, display:'flex', gap:16, padding:'20px 28px', overflowX:'auto', overflowY:'hidden' }}>
        {Object.keys(STATUS_CONFIG).map((status, i) => (
          <div key={status} style={{ animationDelay:`${.08*i}s`, flex:1, minWidth:280, maxWidth:360, display:'flex', flexDirection:'column' }}>
            <KanbanColumn
              status={status}
              tasks={byStatus(status)}
              onEdit={setEditTask}
              onDelete={handleDelete}
              onDrop={handleDrop}
              onDragStart={setDragTask}
              onAddTask={s => { setCreateStatus(s); setShowCreate(true) }}
            />
          </div>
        ))}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <TaskForm teams={teams} task={{ status: createStatus }}
          onClose={() => setShowCreate(false)}
          onSave={() => { setShowCreate(false); refresh() }} />
      </Modal>
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && <TaskForm teams={teams} task={editTask}
          onClose={() => setEditTask(null)}
          onSave={() => { setEditTask(null); refresh() }} />}
      </Modal>
    </div>
  )
}
