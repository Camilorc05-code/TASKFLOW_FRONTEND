import { useState, useEffect, useCallback } from 'react'
import { getCalendarEvents } from '../services/backlogApi'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const EVENT_CFG = {
  sprint:       { color:'#00e5b3', bg:'rgba(0,229,179,.13)',   icon:'🚀', label:'Sprint'   },
  task:         { color:'#7c6dfa', bg:'rgba(124,109,250,.13)', icon:'✓',  label:'Task'     },
  backlog_item: { color:'#ffb547', bg:'rgba(255,181,71,.13)',  icon:'📋', label:'Item'     },
}
const PRI_DOT = { high:'#ff5470', medium:'#ffb547', low:'#8891b0' }
const STATUS_DOT = { done:'#00e5a0', in_progress:'#5b8fff', todo:'#8891b0', backlog:'#3d4460', active:'#00e5b3', planning:'#8891b0', completed:'#7c6dfa' }

export default function CalendarPage() {
  const { toast } = useToast()
  const today     = new Date()

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)  // 1-based
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [view, setView] = useState('month')   // month | list

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCalendarEvents(year, month)
      setEvents(res.events || [])
    } catch (e) {
      // If backend not yet updated, show empty calendar gracefully
      setEvents([])
      if (!e.message.includes('404')) toast(e.message, 'error')
    }
    finally { setLoading(false) }
  }, [year, month])

  useEffect(() => { load() }, [load])

  // ── helpers ──────────────────────────────────────────────────────────
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setSelectedDay(null) }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()  // 0=Sun
  const daysInMonth     = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()
  const totalCells      = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    if (i < firstDayOfMonth) return { day: daysInPrevMonth - firstDayOfMonth + 1 + i, currentMonth: false, past: true }
    const day = i - firstDayOfMonth + 1
    if (day > daysInMonth) return { day: day - daysInMonth, currentMonth: false, future: true }
    return { day, currentMonth: true }
  })

  // Map events to dates
  const eventsOnDate = (day) => {
    if (!day.currentMonth) return []
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day.day).padStart(2,'0')}`
    return events.filter(e => {
      if (e.date === dateStr) return true
      if (e.start && e.end) {
        return e.start <= dateStr && e.end >= dateStr
      }
      return false
    })
  }

  const isToday = (day) => day.currentMonth && day.day === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear()

  const dayEvents = selectedDay ? eventsOnDate(selectedDay) : []

  // List view: group by date
  const eventsByDate = {}
  events.forEach(e => {
    const key = e.date || e.start || ''
    if (!key) return
    if (!eventsByDate[key]) eventsByDate[key] = []
    eventsByDate[key].push(e)
  })
  const sortedDates = Object.keys(eventsByDate).sort()

  // Stats
  const totalTasks    = events.filter(e => e.type === 'task').length
  const totalSprints  = events.filter(e => e.type === 'sprint').length
  const totalItems    = events.filter(e => e.type === 'backlog_item').length
  const doneCount     = events.filter(e => e.status === 'done' || e.status === 'completed').length

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:14 }}>
        <div>
          <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Calendar</h1>
          <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>
            {events.length} events · {totalTasks} tasks · {totalSprints} sprints · {totalItems} backlog items
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* View toggle */}
          <div style={{ display:'flex', background:'var(--bg-input)', borderRadius:10, padding:4, gap:4 }}>
            {[['month','⊞ Month'],['list','≡ List']].map(([v,l]) => (
              <button key={v} onClick={() => setView(v)} className={`tab ${view===v?'active':''}`}>{l}</button>
            ))}
          </div>
          <button className="btn-ghost" onClick={goToday} style={{ fontSize:13, padding:'9px 16px' }}>Today</button>
          <button className="btn-primary" onClick={load} style={{ fontSize:13, padding:'9px 16px' }}>↻ Refresh</button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="a-fadeup" style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', animationDelay:'.06s' }}>
        {[
          [events.length,  'Total Events',  'var(--accent)'],
          [totalTasks,     'Tasks',         'var(--accent-2)'],
          [totalSprints,   'Sprints',       'var(--teal)'],
          [totalItems,     'Backlog Items', 'var(--amber)'],
          [doneCount,      'Completed',     'var(--green)'],
        ].map(([v,l,c]) => (
          <div key={l} style={{ flex:1, minWidth:90, padding:'12px 14px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:800, color:c, fontFamily:"'Syne',sans-serif" }}>{v}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', marginTop:2, fontWeight:500 }}>{l}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:80, flexDirection:'column', gap:16 }}>
          <Spinner size={44} /><p style={{ color:'var(--text-2)' }}>Loading calendar...</p>
        </div>
      ) : view === 'month' ? (

        /* ════════════════════════════════════════════════
           MONTH VIEW
        ════════════════════════════════════════════════ */
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'start' }}>

          {/* Calendar grid */}
          <div className="a-fadeup" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden' }}>

            {/* Nav */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
              <button onClick={prevMonth} style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', cursor:'pointer', fontSize:16, padding:'6px 14px', transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>‹</button>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>{MONTHS[month-1]}</div>
                <div style={{ fontSize:13, color:'var(--text-2)', marginTop:2 }}>{year}</div>
              </div>
              <button onClick={nextMonth} style={{ background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', cursor:'pointer', fontSize:16, padding:'6px 14px', transition:'all .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--border)' }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding:'10px 0', textAlign:'center', fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
              {cells.map((cell, i) => {
                const evts     = eventsOnDate(cell)
                const isSelect = selectedDay?.day === cell.day && selectedDay?.currentMonth === cell.currentMonth
                const isTd     = isToday(cell)

                return (
                  <div key={i}
                    onClick={() => cell.currentMonth && setSelectedDay(isSelect ? null : cell)}
                    style={{
                      minHeight: 90, padding:'8px 6px', borderRight: (i+1)%7!==0 ? '1px solid var(--border)' : 'none',
                      borderBottom: i < cells.length-7 ? '1px solid var(--border)' : 'none',
                      background: isSelect ? 'rgba(124,109,250,.08)' : 'transparent',
                      cursor: cell.currentMonth ? 'pointer' : 'default',
                      transition:'background .15s',
                      position:'relative',
                    }}
                    onMouseEnter={e => { if (cell.currentMonth && !isSelect) e.currentTarget.style.background='var(--bg-hover)' }}
                    onMouseLeave={e => { if (!isSelect) e.currentTarget.style.background='transparent' }}>

                    {/* Day number */}
                    <div style={{
                      width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:13, fontWeight: isTd ? 700 : cell.currentMonth ? 500 : 400,
                      color: isTd ? '#fff' : cell.currentMonth ? 'var(--text)' : 'var(--text-3)',
                      background: isTd ? 'var(--accent)' : 'transparent',
                      boxShadow: isTd ? '0 0 14px var(--accent-glow)' : 'none',
                      marginBottom:4,
                    }}>
                      {cell.day}
                    </div>

                    {/* Event dots / chips */}
                    <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                      {evts.slice(0,3).map((ev, ei) => {
                        const cfg = EVENT_CFG[ev.type] || EVENT_CFG.task
                        return (
                          <div key={ei}
                            onClick={e => { e.stopPropagation(); setSelectedEvent(ev) }}
                            title={ev.title}
                            style={{
                              fontSize:10, padding:'2px 6px', borderRadius:4,
                              background:cfg.bg, color:cfg.color, fontWeight:600,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                              cursor:'pointer', lineHeight:1.4,
                              transition:'opacity .15s',
                            }}
                            onMouseEnter={e=>e.currentTarget.style.opacity='.75'}
                            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                            {cfg.icon} {ev.title}
                          </div>
                        )
                      })}
                      {evts.length > 3 && (
                        <div style={{ fontSize:10, color:'var(--text-2)', paddingLeft:4 }}>+{evts.length-3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side panel — day detail or legend */}
          <div style={{ width:260, display:'flex', flexDirection:'column', gap:14 }}>

            {/* Day detail */}
            {selectedDay ? (
              <div className="card a-scale" style={{ padding:18 }}>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:14, fontFamily:"'Syne',sans-serif" }}>
                  {MONTHS[month-1]} {selectedDay.day}
                </div>
                {dayEvents.length === 0 ? (
                  <div style={{ color:'var(--text-3)', fontSize:13, textAlign:'center', padding:'16px 0' }}>
                    No events this day
                  </div>
                ) : dayEvents.map((ev,i) => {
                  const cfg = EVENT_CFG[ev.type] || EVENT_CFG.task
                  const sdot = STATUS_DOT[ev.status] || '#8891b0'
                  return (
                    <div key={i}
                      onClick={() => setSelectedEvent(ev)}
                      style={{ padding:'10px 12px', borderRadius:10, background:cfg.bg, border:`1px solid ${cfg.color}28`, marginBottom:8, cursor:'pointer', transition:'opacity .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='.8'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                        <span style={{ fontSize:14 }}>{cfg.icon}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:cfg.color, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.title}</span>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:sdot }} />
                        <span style={{ fontSize:11, color:'var(--text-2)' }}>{ev.status}</span>
                        {ev.priority && <span style={{ fontSize:11, color:PRI_DOT[ev.priority] }}>● {ev.priority}</span>}
                        {ev.story_points && <span style={{ fontSize:11, color:'var(--text-2)' }}>⚡{ev.story_points}pts</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="card" style={{ padding:18 }}>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:14, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em' }}>Legend</div>
                {Object.entries(EVENT_CFG).map(([type, cfg]) => (
                  <div key={type} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:16 }}>{cfg.icon}</span>
                    <div style={{ width:10, height:10, borderRadius:3, background:cfg.color }}/>
                    <span style={{ fontSize:13, color:'var(--text-2)' }}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Mini upcoming events */}
            <div className="card" style={{ padding:18 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:14, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em' }}>Upcoming</div>
              {events
                .filter(e => {
                  const d = e.date || e.end || ''
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
                  return d >= todayStr
                })
                .sort((a,b) => (a.date||a.end||'').localeCompare(b.date||b.end||''))
                .slice(0,5)
                .map((ev,i) => {
                  const cfg = EVENT_CFG[ev.type] || EVENT_CFG.task
                  const d   = ev.date || ev.end || ''
                  return (
                    <div key={i}
                      onClick={() => setSelectedEvent(ev)}
                      style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderBottom: i<4 ? '1px solid var(--border)' : 'none', cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='.75'}
                      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                      <div style={{ fontSize:16, flexShrink:0 }}>{cfg.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.title}</div>
                        <div style={{ fontSize:11, color:'var(--text-2)' }}>{d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</div>
                      </div>
                    </div>
                  )
                })}
              {events.length === 0 && <div style={{ color:'var(--text-3)', fontSize:13 }}>No events this month</div>}
            </div>
          </div>
        </div>

      ) : (

        /* ════════════════════════════════════════════════
           LIST VIEW
        ════════════════════════════════════════════════ */
        <div className="a-fadeup" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden' }}>
          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 22px', borderBottom:'1px solid var(--border)' }}>
            <button onClick={prevMonth} className="btn-ghost" style={{ fontSize:13, padding:'7px 14px' }}>‹ Prev</button>
            <span style={{ fontSize:17, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{MONTHS[month-1]} {year}</span>
            <button onClick={nextMonth} className="btn-ghost" style={{ fontSize:13, padding:'7px 14px' }}>Next ›</button>
          </div>

          {sortedDates.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--text-3)' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
              <p>No events this month.</p>
            </div>
          ) : sortedDates.map(date => (
            <div key={date}>
              {/* Date label */}
              <div style={{ padding:'10px 22px 6px', fontSize:12, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', background:'var(--bg-2)', borderBottom:'1px solid var(--border)' }}>
                {new Date(date+'T00:00:00').toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })}
              </div>
              {eventsByDate[date].map((ev,i) => {
                const cfg  = EVENT_CFG[ev.type] || EVENT_CFG.task
                const sdot = STATUS_DOT[ev.status] || '#8891b0'
                return (
                  <div key={i}
                    onClick={() => setSelectedEvent(ev)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 22px', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{cfg.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.title}</div>
                      {ev.sprint_name && <div style={{ fontSize:12, color:'var(--text-2)' }}>Sprint: {ev.sprint_name}</div>}
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                      {ev.priority && (
                        <span style={{ fontSize:11, color:PRI_DOT[ev.priority]||'var(--text-2)', background:`${PRI_DOT[ev.priority]||'#8891b0'}14`, padding:'2px 8px', borderRadius:5, fontWeight:600 }}>
                          {ev.priority}
                        </span>
                      )}
                      {ev.story_points && (
                        <span style={{ fontSize:11, color:'var(--text-2)', background:'var(--bg-input)', padding:'2px 8px', borderRadius:5 }}>
                          ⚡ {ev.story_points}pts
                        </span>
                      )}
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:sdot }} />
                        <span style={{ fontSize:12, color:'var(--text-2)' }}>{ev.status}</span>
                      </div>
                      <span style={{ fontSize:12, padding:'3px 10px', borderRadius:6, background:cfg.bg, color:cfg.color, fontWeight:600 }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Event detail modal ── */}
      {selectedEvent && (
        <div onClick={() => setSelectedEvent(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20, animation:'fadeIn .2s ease' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--bg-card)', border:'1px solid var(--border-2)', borderRadius:20, width:'100%', maxWidth:460, animation:'modalIn .3s cubic-bezier(.22,.68,0,1.2)', boxShadow:'0 40px 100px rgba(0,0,0,.6)' }}>
            {(() => {
              const ev  = selectedEvent
              const cfg = EVENT_CFG[ev.type] || EVENT_CFG.task
              const sdot = STATUS_DOT[ev.status] || '#8891b0'
              return (
                <>
                  {/* Modal header */}
                  <div style={{ padding:'22px 24px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, border:`1px solid ${cfg.color}28` }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:cfg.color, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>{cfg.label}</div>
                      <h3 style={{ fontSize:17, fontWeight:700, lineHeight:1.3 }}>{ev.title}</h3>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} style={{ background:'none', border:'none', color:'var(--text-2)', fontSize:22, cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
                  </div>

                  {/* Modal body */}
                  <div style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {/* Status */}
                      <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                        <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Status</div>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:9, height:9, borderRadius:'50%', background:sdot, boxShadow:`0 0 8px ${sdot}80` }} />
                          <span style={{ fontSize:14, fontWeight:600, color:sdot }}>{ev.status}</span>
                        </div>
                      </div>
                      {/* Priority */}
                      {ev.priority && (
                        <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Priority</div>
                          <span style={{ fontSize:14, fontWeight:600, color:PRI_DOT[ev.priority] }}>
                            {ev.priority === 'high' ? '▲' : ev.priority === 'medium' ? '◆' : '▼'} {ev.priority}
                          </span>
                        </div>
                      )}
                      {/* Date */}
                      {(ev.date || ev.start) && (
                        <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>
                            {ev.start ? 'Start' : 'Date'}
                          </div>
                          <span style={{ fontSize:13, fontWeight:500 }}>
                            {new Date((ev.date||ev.start)+'T00:00:00').toLocaleDateString('en-US',{ month:'long', day:'numeric', year:'numeric' })}
                          </span>
                        </div>
                      )}
                      {/* End date */}
                      {ev.end && (
                        <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>End</div>
                          <span style={{ fontSize:13, fontWeight:500 }}>
                            {new Date(ev.end+'T00:00:00').toLocaleDateString('en-US',{ month:'long', day:'numeric', year:'numeric' })}
                          </span>
                        </div>
                      )}
                      {/* Story points */}
                      {ev.story_points && (
                        <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Story Points</div>
                          <span style={{ fontSize:20, fontWeight:800, color:'var(--amber)', fontFamily:"'Syne',sans-serif" }}>⚡ {ev.story_points}</span>
                        </div>
                      )}
                      {/* Sprint */}
                      {ev.sprint_name && (
                        <div style={{ padding:'12px 14px', background:'var(--bg-input)', borderRadius:10, border:'1px solid var(--border)' }}>
                          <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Sprint</div>
                          <span style={{ fontSize:13, fontWeight:600, color:'var(--teal)' }}>🚀 {ev.sprint_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Goal / item type */}
                    {ev.goal && (
                      <div style={{ padding:'12px 14px', background:'rgba(124,109,250,.07)', borderRadius:10, border:'1px solid rgba(124,109,250,.18)' }}>
                        <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Sprint Goal</div>
                        <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>{ev.goal}</p>
                      </div>
                    )}

                    <button onClick={() => setSelectedEvent(null)} className="btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
                      Close
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
