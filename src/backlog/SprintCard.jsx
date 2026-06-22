import { useState } from 'react'
import { updateSprint, deleteSprint } from '../services/backlogApi'

const STATUS_CFG = {
  planning:  { label: 'Planning',   color: '#8891b0', bg: 'rgba(136,145,176,.12)' },
  active:    { label: 'Active',     color: '#00e5b3', bg: 'rgba(0,229,179,.1)'    },
  completed: { label: 'Completed',  color: '#7c6dfa', bg: 'rgba(124,109,250,.12)' },
}

export default function SprintCard({ sprint, items, onRefresh, onStartSprint, onSelectSprint, selected }) {
  const cfg  = STATUS_CFG[sprint.status] || STATUS_CFG.planning
  const done = items.filter(i => i.status === 'done').length
  const pct  = items.length ? Math.round(done / items.length * 100) : 0
  const pts  = items.reduce((s, i) => s + (i.story_points || 0), 0)

  const handleDelete = async () => {
    if (!confirm(`Delete sprint "${sprint.name}"? Items will return to backlog.`)) return
    try { await deleteSprint(sprint.id); onRefresh() }
    catch (e) { alert(e.message) }
  }

  const handleToggleStatus = async () => {
    const next = sprint.status === 'planning' ? 'active' : sprint.status === 'active' ? 'completed' : 'planning'
    try { await updateSprint(sprint.id, { status: next }); onRefresh() }
    catch (e) { alert(e.message) }
  }

  return (
    <div onClick={() => onSelectSprint(sprint.id === selected ? null : sprint.id)}
      style={{
        background: 'var(--bg-card)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 14, padding: '18px 20px', cursor: 'pointer',
        transition: 'all .2s cubic-bezier(.22,.68,0,1.2)',
        boxShadow: selected ? '0 0 32px var(--accent-glow)' : 'none',
        animation: 'cardPop .4s ease',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-2)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h3 style={{ fontSize:15, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sprint.name}</h3>
            <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:cfg.bg, color:cfg.color, fontWeight:600, flexShrink:0 }}>
              {cfg.label}
            </span>
          </div>
          {sprint.goal && <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{sprint.goal}</p>}
        </div>
        <div style={{ display:'flex', gap:6, marginLeft:12, flexShrink:0 }}>
          {sprint.status !== 'completed' && (
            <button onClick={e => { e.stopPropagation(); handleToggleStatus() }}
              style={{ fontSize:11, padding:'4px 10px', borderRadius:7, border:'none', background: sprint.status==='planning' ? 'rgba(0,229,179,.12)' : 'rgba(136,145,176,.12)', color: sprint.status==='planning' ? 'var(--teal)' : 'var(--text-2)', cursor:'pointer', fontWeight:600, fontFamily:"'Inter',sans-serif", transition:'all .15s' }}>
              {sprint.status === 'planning' ? '▶ Start' : '✓ Complete'}
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); handleDelete() }}
            style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:16, padding:'2px 5px', transition:'color .15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--red)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>✕</button>
        </div>
      </div>

      {/* Dates */}
      {(sprint.start_date || sprint.end_date) && (
        <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--text-2)', marginBottom:12 }}>
          {sprint.start_date && <span>📅 {new Date(sprint.start_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>}
          {sprint.end_date   && <span>🏁 {new Date(sprint.end_date).toLocaleDateString('en-US',   { month:'short', day:'numeric' })}</span>}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display:'flex', gap:14, fontSize:12, color:'var(--text-2)', marginBottom:12 }}>
        <span>📋 {items.length} items</span>
        <span>✓ {done} done</span>
        {pts > 0 && <span>⚡ {pts} pts</span>}
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
            <span style={{ color:'var(--text-2)' }}>Progress</span>
            <span style={{ fontWeight:600, color: pct === 100 ? 'var(--green)' : 'var(--text)' }}>{pct}%</span>
          </div>
          <div style={{ background:'var(--bg-input)', borderRadius:100, height:5, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,var(--green),var(--teal))' : 'linear-gradient(90deg,var(--accent),var(--teal))', borderRadius:100, transition:'width .8s cubic-bezier(.22,.68,0,1.2)' }} />
          </div>
        </>
      )}
    </div>
  )
}
