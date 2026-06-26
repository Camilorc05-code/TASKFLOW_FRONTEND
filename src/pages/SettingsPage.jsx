import { useState } from 'react'
import { changePassword } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import Avatar from '../components/ui/Avatar'

export default function SettingsPage() {
  const { user, logOut } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState('profile')

  return (
    <div className="page-content" style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
      <div style={{ marginBottom:22 }}>
        <h1 className="a-slidel" style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:3 }}>Settings</h1>
        <p style={{ color:'var(--text-2)', fontSize:13 }}>Manage your account</p>
      </div>

      {/* En móvil: tabs horizontales. En desktop: side nav */}
      <div className="settings-grid" style={{ display:'grid', gridTemplateColumns:'180px 1fr', gap:22, alignItems:'start' }}>

        {/* Side nav / tabs */}
        <div className="settings-sidenav card a-fadein" style={{ padding:8 }}>
          {[['profile','👤 Profile'],['security','🔐 Security'],['danger','⚠ Account']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`nav-link ${tab===id?'active':''}`}
              style={{ width:'100%', textAlign:'left', border:'none', fontFamily:"'Inter',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        <div className="a-slider" style={{ animationDelay:'.08s' }}>
          {tab==='profile'  && <ProfilePanel user={user} />}
          {tab==='security' && <SecurityPanel toast={toast} />}
          {tab==='danger'   && <DangerPanel logOut={logOut} toast={toast} />}
        </div>
      </div>
    </div>
  )
}

function ProfilePanel({ user }) {
  return (
    <div className="card">
      <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:18 }}>Profile</h2>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--bg-input)', borderRadius:12, border:'1px solid var(--border)', marginBottom:18 }}>
        <Avatar name={user} size={52} />
        <div>
          <div style={{ fontSize:17, fontWeight:700, marginBottom:3 }}>{user}</div>
          <div style={{ fontSize:13, color:'var(--text-2)' }}>Member · TaskFlow</div>
        </div>
      </div>
      <div>
        <label className="label">Username</label>
        <input className="input" value={user||''} readOnly style={{ opacity:.6, cursor:'not-allowed' }} />
      </div>
      <div style={{ padding:'12px 14px', background:'rgba(124,109,250,.06)', borderRadius:10, border:'1px solid rgba(124,109,250,.15)', fontSize:13, color:'var(--text-2)', lineHeight:1.6, marginTop:14 }}>
        💡 To update your profile, add a <code style={{ color:'var(--accent)', fontSize:12 }}>PUT /users/me</code> endpoint to the backend.
      </div>
    </div>
  )
}

function SecurityPanel({ toast }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ current_password:'', new_password:'', confirm:'' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const match    = form.new_password && form.confirm && form.new_password === form.confirm
  const mismatch = form.confirm && form.new_password !== form.confirm

  const handleSubmit = async () => {
    if (!form.current_password || !form.new_password || !form.confirm) { toast('Fill all fields', 'warn'); return }
    if (!match) { toast('Passwords do not match', 'warn'); return }
    if (form.new_password.length < 6) { toast('Min 6 characters', 'warn'); return }
    setLoading(true)
    try {
      await changePassword({ current_password:form.current_password, new_password:form.new_password })
      toast('Password changed! 🔐')
      setForm({ current_password:'', new_password:'', confirm:'' })
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>Change Password</h2>
      <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:20, lineHeight:1.5 }}>At least 6 characters.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div><label className="label">Current Password</label>
          <input className="input" type="password" placeholder="Your current password" value={form.current_password} onChange={e=>set('current_password',e.target.value)}/></div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
          <label className="label">New Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={form.new_password} onChange={e=>set('new_password',e.target.value)}/></div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" placeholder="Repeat new password" value={form.confirm}
            onChange={e=>set('confirm',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
            style={{ borderColor:mismatch?'var(--red)':match?'var(--green)':'' }}/>
          {mismatch && <p style={{ fontSize:12, color:'var(--red)', marginTop:5 }}>⚠ Do not match</p>}
          {match    && <p style={{ fontSize:12, color:'var(--green)', marginTop:5 }}>✓ Match</p>}
        </div>
        {form.new_password && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[['6+ chars', form.new_password.length>=6],['Uppercase',/[A-Z]/.test(form.new_password)],['Number',/\d/.test(form.new_password)]].map(([h,ok])=>(
              <span key={h} style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:ok?'rgba(0,229,160,.12)':'var(--bg-input)', color:ok?'var(--green)':'var(--text-3)', border:`1px solid ${ok?'rgba(0,229,160,.25)':'var(--border)'}`, fontWeight:500 }}>
                {ok?'✓':'○'} {h}
              </span>
            ))}
          </div>
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button className="btn-ghost" onClick={()=>setForm({current_password:'',new_password:'',confirm:''})}>Clear</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading?<Spinner size={16} color="#fff"/>:'🔐 Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DangerPanel({ logOut, toast }) {
  return (
    <div className="card">
      <h2 style={{ fontSize:16, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>Account Actions</h2>
      <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:20 }}>Manage session and account.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid var(--border)', borderRadius:12, background:'var(--bg-input)', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>Sign Out</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>End your current session</div>
          </div>
          <button className="btn-ghost" onClick={logOut}>Sign Out</button>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', border:'1px solid rgba(255,84,112,.22)', borderRadius:12, background:'rgba(255,84,112,.04)', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:2, color:'var(--red)' }}>Delete Account</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>Permanently remove account and data</div>
          </div>
          <button className="btn-danger" onClick={()=>toast('Requires DELETE /users/me endpoint','warn')}>Delete</button>
        </div>
      </div>
    </div>
  )
}
