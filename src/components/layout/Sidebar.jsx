import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

const NAV_ITEMS = [
  { id: 'dashboard', path: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'board',     path: '/board',     icon: '⬡', label: 'Board'     },
  { id: 'calendar',  path: '/calendar',  icon: '📅', label: 'Calendar'  },  
  { id: 'backlog',   path: '/backlog',   icon: '📋', label: 'Backlog'  },  
  { id: 'tasks',     path: '/tasks',     icon: '✓',  label: 'Tasks'    },
  { id: 'teams',     path: '/teams',     icon: '◎',  label: 'Teams'    },
  { id: 'settings',  path: '/settings',  icon: '⚙',  label: 'Settings' },
]

export default function Sidebar() {
  const { user, logOut } = useAuth()

  return (
    <aside style={{
      width:230, background:'var(--bg-card)', borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', height:'100vh',
      position:'sticky', top:0, flexShrink:0,
    }}>
      {/* Logo */}
      <div style={{ padding:'24px 20px 18px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,var(--accent),var(--teal))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, animation:'float 3s ease-in-out infinite' }}>⚡</div>
          <span style={{ fontSize:19, fontWeight:800, fontFamily:"'Syne',sans-serif", background:'linear-gradient(135deg,var(--text),var(--text-2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.1em', padding:'0 10px 10px' }}>Workspace</div>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.id} to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ textDecoration:'none' }}>
            <span style={{ fontSize:17, width:20, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding:'14px 10px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'var(--bg-input)', marginBottom:8 }}>
          <Avatar name={user} size={34} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user}</div>
            <div style={{ fontSize:11, color:'var(--text-2)' }}>Member</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={logOut} style={{ width:'100%', justifyContent:'center', fontSize:13, padding:'9px' }}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
