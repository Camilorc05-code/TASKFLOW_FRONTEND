import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAV_ITEMS } from '../../utils/constants'
import Avatar from '../ui/Avatar'

// Guarda el estado de colapso en localStorage para persistirlo
const COLLAPSED_KEY = 'taskflow_sidebar_collapsed'

export default function Sidebar() {
  const { user, logOut }  = useAuth()
  const location          = useLocation()
  const [isMobile, setIsMobile]     = useState(window.innerWidth <= 768)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed]   = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true')

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Cerrar drawer móvil al cambiar de ruta
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Bloquear scroll body cuando drawer abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Guardar estado colapso
  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, String(next))
  }

  // ── Sidebar interior ───────────────────────────────────────────────
  const SidebarContent = ({ forMobile = false }) => (
    <>
      {/* Logo + botón colapsar */}
      <div style={{ padding: collapsed && !forMobile ? '20px 0' : '22px 18px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent: collapsed && !forMobile ? 'center' : 'space-between', position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap: collapsed && !forMobile ? 0 : 10, overflow:'hidden' }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0, animation:'float 3s ease-in-out infinite' }}>⚡</div>
          {(!collapsed || forMobile) && (
            <span style={{ fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif", background:'linear-gradient(135deg,var(--text),var(--text-2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', whiteSpace:'nowrap' }}>
              TaskFlow
            </span>
          )}
        </div>

        {/* Botón cerrar en móvil drawer */}
        {forMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', color:'var(--text-2)', fontSize:20, cursor:'pointer', padding:4, lineHeight:1, borderRadius:6 }}>✕</button>
        )}

        {/* Botón colapsar en desktop */}
        {!forMobile && (
          <button
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background:'var(--bg-input)', border:'1px solid var(--border)',
              borderRadius:8, color:'var(--text-2)', cursor:'pointer',
              fontSize:14, padding:'5px 8px', lineHeight:1,
              transition:'all .2s ease', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)' }}>
            {/* Flecha que indica dirección */}
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding: collapsed && !forMobile ? '14px 8px' : '14px 10px', overflowY:'auto' }}>
        {(!collapsed || forMobile) && (
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.1em', padding:'0 10px 10px' }}>
            Workspace
          </div>
        )}
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ textDecoration:'none', justifyContent: collapsed && !forMobile ? 'center' : 'flex-start' }}
            title={collapsed && !forMobile ? item.label : undefined}>
            <span style={{ fontSize:18, width:22, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
            {(!collapsed || forMobile) && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: collapsed && !forMobile ? '12px 8px' : '12px 10px', borderTop:'1px solid var(--border)' }}>
        {collapsed && !forMobile ? (
          /* Solo avatar cuando colapsado */
          <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
            <Avatar name={user} size={34} style={{ cursor:'default' }} />
            <button
              onClick={logOut}
              title="Sign Out"
              style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-2)', cursor:'pointer', fontSize:13, padding:'6px', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.color='var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-2)' }}>
              ↩
            </button>
          </div>
        ) : (
          /* Avatar + nombre cuando expandido */
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'var(--bg-input)', marginBottom:8 }}>
              <Avatar name={user} size={32} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user}</div>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>Member</div>
              </div>
            </div>
            <button className="btn-ghost" onClick={logOut} style={{ width:'100%', justifyContent:'center', fontSize:12, padding:'8px' }}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* ── DESKTOP: sidebar colapsable ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 68 : 'var(--sidebar-w)',
          background:'var(--bg-card)', borderRight:'1px solid var(--border)',
          display:'flex', flexDirection:'column',
          height:'100vh', position:'sticky', top:0, flexShrink:0,
          transition:'width .28s cubic-bezier(.22,.68,0,1.2)',
          overflow:'hidden',
        }}>
          <SidebarContent forMobile={false} />
        </aside>
      )}

      {/* ── MÓVIL: topbar + drawer ── */}
      {isMobile && (
        <>
          {/* Topbar fija */}
          <div className="mobile-topbar">
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>⚡</div>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>TaskFlow</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Avatar name={user} size={28} />
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu">
                ☰
              </button>
            </div>
          </div>

          {/* Overlay */}
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)', zIndex:199, animation:'fadeIn .2s ease' }} />
          )}

          {/* Drawer */}
          <aside style={{
            position:'fixed', top:0, left:0, height:'100vh',
            width:'var(--sidebar-w)',
            background:'var(--bg-card)', borderRight:'1px solid var(--border)',
            display:'flex', flexDirection:'column',
            zIndex:200,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition:'transform .3s cubic-bezier(.22,.68,0,1.2)',
            boxShadow: mobileOpen ? '8px 0 40px rgba(0,0,0,.6)' : 'none',
          }}>
            <SidebarContent forMobile={true} />
          </aside>
        </>
      )}
    </>
  )
}
