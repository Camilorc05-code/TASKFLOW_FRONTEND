import { useState, useEffect, useCallback } from 'react'
import {
  getSprints, getBacklogItems, moveItemToSprint,
} from '../services/backlogApi'   // ✅ correcto, porque BacklogPage.jsx está en src/pages
import { getTeams } from '../services/api'
import { useToast } from '../context/ToastContext'
import Modal         from '../components/ui/Modal'
import Spinner       from '../components/ui/Spinner'
import SprintCard     from '../backlog/SprintCard'       // ✅ correcto, porque está en src/backlog
import BacklogItemRow from '../backlog/BacklogItemRow'   // ✅ correcto
import ItemForm       from '../backlog/ItemForm'         // ✅ correcto
import SprintForm     from '../backlog/SprintForm'       // ✅ correcto


// ── helpers ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  story: { icon:'📖', color:'#5b8fff' },
  bug:   { icon:'🐛', color:'#ff5470' },
  task:  { icon:'✓',  color:'#8891b0' },
  epic:  { icon:'⚡', color:'#ffb547' },
}
const PRI_CFG = {
  low:    { color:'#8891b0', icon:'▼' },
  medium: { color:'#ffb547', icon:'◆' },
  high:   { color:'#ff5470', icon:'▲' },
}

export default function BacklogPage() {
  const { toast } = useToast()

  const [sprints,  setSprints]  = useState([])
  const [items,    setItems]    = useState([])
  const [teams,    setTeams]    = useState([])
  const [loading,  setLoading]  = useState(true)

  const [selectedSprint, setSelectedSprint] = useState(null)  // sprint id filter
  const [filterType,  setFilterType]  = useState('')
  const [filterPri,   setFilterPri]   = useState('')
  const [search,      setSearch]      = useState('')

  const [showSprintForm, setShowSprintForm] = useState(false)
  const [editSprint,     setEditSprint]     = useState(null)
  const [showItemForm,   setShowItemForm]   = useState(false)
  const [editItem,       setEditItem]       = useState(null)
  const [defaultSprintId, setDefaultSprintId] = useState(null)

  // drag state
  const [dragItem, setDragItem] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)  // sprint id or 'backlog'

  // ── load ───────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sp, it, tm] = await Promise.all([
        getSprints(),
        getBacklogItems(),
        getTeams().catch(() => []),
      ])
      setSprints(sp  || [])
      setItems(it    || [])
      setTeams(tm    || [])
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // ── derived ────────────────────────────────────────────────────────────
  const itemsForSprint  = (sprintId) => items.filter(i => i.sprint_id  === sprintId)
  const pureBacklogItems = items.filter(i => !i.sprint_id)

  const applyFilters = (list) => list.filter(i =>
    (!filterType || i.item_type === filterType) &&
    (!filterPri  || i.priority  === filterPri)  &&
    (!search     || i.title.toLowerCase().includes(search.toLowerCase()))
  )

  // ── drag & drop ────────────────────────────────────────────────────────
  const handleDrop = async (e, targetSprintId) => {
    e.preventDefault()
    if (!dragItem) return
    const newSprintId = targetSprintId === 'backlog' ? null : Number(targetSprintId)
    if (dragItem.sprint_id === newSprintId) { setDragItem(null); setDropTarget(null); return }
    try {
      await moveItemToSprint(dragItem.id, newSprintId)
      toast(`Moved to ${newSprintId ? sprints.find(s=>s.id===newSprintId)?.name : 'Backlog'}`)
      load()
    } catch (e) { toast(e.message, 'error') }
    setDragItem(null); setDropTarget(null)
  }

  // ── summary stats ──────────────────────────────────────────────────────
  const totalPts     = items.reduce((s,i) => s + (i.story_points||0), 0)
  const donePts      = items.filter(i=>i.status==='done').reduce((s,i) => s + (i.story_points||0), 0)
  const activeSprint = sprints.find(s => s.status === 'active')

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <Spinner size={44} /><p style={{ color:'var(--text-2)' }}>Loading backlog...</p>
    </div>
  )

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>

      {/* ── Page header ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Backlog</h1>
          <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>
            {items.length} items · {sprints.length} sprints · {totalPts} story points
            {activeSprint && <span style={{ marginLeft:12, color:'var(--teal)', fontWeight:600 }}>▶ {activeSprint.name} active</span>}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-ghost" onClick={() => { setEditSprint(null); setShowSprintForm(true) }}>
            + New Sprint
          </button>
          <button className="btn-primary" onClick={() => { setEditItem(null); setDefaultSprintId(null); setShowItemForm(true) }}>
            + New Item
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="a-fadeup" style={{ display:'flex', gap:12, marginBottom:28, flexWrap:'wrap', animationDelay:'.05s' }}>
        {[
          [items.length,                                   'Total Items',    'var(--accent)'],
          [items.filter(i=>i.status==='done').length,      'Done',           'var(--green)'],
          [items.filter(i=>!i.sprint_id).length,           'In Backlog',     'var(--text-2)'],
          [sprints.filter(s=>s.status==='active').length,  'Active Sprints', 'var(--teal)'],
          [totalPts,                                       'Story Points',   'var(--amber)'],
        ].map(([v,l,c]) => (
          <div key={l} style={{ padding:'12px 18px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, textAlign:'center', minWidth:100, flex:1 }}>
            <div style={{ fontSize:22, fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', marginTop:2, fontWeight:500 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="a-fadeup" style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', animationDelay:'.1s' }}>
        <input className="input" placeholder="🔍  Search items..." style={{ flex:1, minWidth:180 }}
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ width:130 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="story">📖 Story</option>
          <option value="bug">🐛 Bug</option>
          <option value="task">✓ Task</option>
          <option value="epic">⚡ Epic</option>
        </select>
        <select className="input" style={{ width:140 }} value={filterPri} onChange={e => setFilterPri(e.target.value)}>
          <option value="">All Priority</option>
          <option value="low">▼ Low</option>
          <option value="medium">◆ Medium</option>
          <option value="high">▲ High</option>
        </select>
        {(search || filterType || filterPri) && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setFilterType(''); setFilterPri('') }}>✕ Clear</button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SPRINTS SECTION
      ══════════════════════════════════════════════════════════ */}
      {sprints.length > 0 && (
        <section style={{ marginBottom:36 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>
            Sprints ({sprints.length})
          </div>

          {/* Sprint cards grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14, marginBottom:20 }}>
            {sprints.map(sprint => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                items={itemsForSprint(sprint.id)}
                onRefresh={load}
                onSelectSprint={(id) => setSelectedSprint(prev => prev === id ? null : id)}
                selected={selectedSprint === sprint.id}
              />
            ))}
          </div>

          {/* Sprint items table (shown when a sprint is selected) */}
          {selectedSprint && (() => {
            const sprint = sprints.find(s => s.id === selectedSprint)
            const sprintItems = applyFilters(itemsForSprint(selectedSprint))
            return (
              <div className="a-fadeup"
                onDragOver={e => { e.preventDefault(); setDropTarget(`sprint-${selectedSprint}`) }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => handleDrop(e, selectedSprint)}
                style={{
                  border: `1px solid ${dropTarget === `sprint-${selectedSprint}` ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius:14, overflow:'hidden',
                  boxShadow: dropTarget === `sprint-${selectedSprint}` ? '0 0 30px var(--accent-glow)' : 'none',
                  transition:'border-color .2s,box-shadow .2s',
                }}>
                {/* Sprint table header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:15, fontWeight:700 }}>{sprint?.name}</span>
                    <span style={{ fontSize:12, color:'var(--text-2)', background:'var(--bg-input)', padding:'2px 10px', borderRadius:6 }}>{sprintItems.length} items</span>
                  </div>
                  <button className="btn-ghost" style={{ fontSize:12, padding:'6px 14px' }}
                    onClick={() => { setEditItem(null); setDefaultSprintId(selectedSprint); setShowItemForm(true) }}>
                    + Add to Sprint
                  </button>
                </div>

                {/* Column labels */}
                <div style={{ display:'grid', gridTemplateColumns:'24px 22px 1fr 48px 16px 130px 60px 60px', gap:12, padding:'8px 16px', background:'var(--bg-2)', fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>
                  <span/>
                  <span>Type</span>
                  <span>Title</span>
                  <span style={{ textAlign:'center' }}>Pts</span>
                  <span>Pri</span>
                  <span>Sprint</span>
                  <span/>
                  <span/>
                </div>

                {sprintItems.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px', color:'var(--text-3)', fontSize:14, background:'var(--bg-card)' }}>
                    No items in this sprint yet. Drag from backlog or click "Add to Sprint".
                  </div>
                ) : sprintItems.map(item => (
                  <BacklogItemRow
                    key={item.id}
                    item={item}
                    sprints={sprints}
                    onRefresh={load}
                    onEdit={(it) => { setEditItem(it); setShowItemForm(true) }}
                    isDragging={dragItem?.id === item.id}
                    onDragStart={() => setDragItem(item)}
                    onDragEnd={() => { setDragItem(null); setDropTarget(null) }}
                  />
                ))}
              </div>
            )
          })()}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          PURE BACKLOG SECTION
      ══════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em' }}>
            Backlog ({applyFilters(pureBacklogItems).length} items)
          </div>
          <button className="btn-ghost" style={{ fontSize:12, padding:'6px 14px' }}
            onClick={() => { setEditItem(null); setDefaultSprintId(null); setShowItemForm(true) }}>
            + Add Item
          </button>
        </div>

        {/* Drop zone for backlog */}
        <div
          onDragOver={e => { e.preventDefault(); setDropTarget('backlog') }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={e => handleDrop(e, 'backlog')}
          style={{
            border: `1px solid ${dropTarget === 'backlog' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius:14, overflow:'hidden', minHeight:120,
            boxShadow: dropTarget === 'backlog' ? '0 0 30px var(--accent-glow)' : 'none',
            transition:'border-color .2s,box-shadow .2s',
          }}>

          {/* Column labels */}
          <div style={{ display:'grid', gridTemplateColumns:'24px 22px 1fr 48px 16px 130px 60px 60px', gap:12, padding:'8px 16px', background:'var(--bg-2)', fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>
            <span/><span>Type</span><span>Title</span>
            <span style={{ textAlign:'center' }}>Pts</span>
            <span>Pri</span><span>Sprint</span><span/><span/>
          </div>

          {applyFilters(pureBacklogItems).length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--text-3)', background:'var(--bg-card)' }}>
              <div style={{ fontSize:40, marginBottom:14 }}>📋</div>
              <p style={{ marginBottom:20, fontSize:14 }}>
                {search || filterType || filterPri ? 'No items match your filters.' : 'Your backlog is empty. Add some items!'}
              </p>
              {!search && !filterType && !filterPri && (
                <button className="btn-primary" onClick={() => { setEditItem(null); setDefaultSprintId(null); setShowItemForm(true) }}>
                  + Create First Item
                </button>
              )}
            </div>
          ) : applyFilters(pureBacklogItems).map(item => (
            <BacklogItemRow
              key={item.id}
              item={item}
              sprints={sprints}
              onRefresh={load}
              onEdit={(it) => { setEditItem(it); setShowItemForm(true) }}
              isDragging={dragItem?.id === item.id}
              onDragStart={() => setDragItem(item)}
              onDragEnd={() => { setDragItem(null); setDropTarget(null) }}
            />
          ))}
        </div>
      </section>

      {/* ── Modals ── */}
      <Modal open={showSprintForm} onClose={() => setShowSprintForm(false)} title={editSprint ? 'Edit Sprint' : 'New Sprint'}>
        <SprintForm
          sprint={editSprint}
          teams={teams}
          toast={toast}
          onClose={() => setShowSprintForm(false)}
          onSave={() => { setShowSprintForm(false); load() }}
        />
      </Modal>

      <Modal open={showItemForm} onClose={() => setShowItemForm(false)} title={editItem ? 'Edit Item' : 'New Backlog Item'} width={560}>
        <ItemForm
          item={editItem ? editItem : (defaultSprintId ? { sprint_id: defaultSprintId } : null)}
          sprints={sprints}
          teams={teams}
          toast={toast}
          onClose={() => setShowItemForm(false)}
          onSave={() => { setShowItemForm(false); load() }}
        />
      </Modal>
    </div>
  )
}
