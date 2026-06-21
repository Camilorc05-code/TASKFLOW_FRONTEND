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
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
      <div style={{ marginBottom:28 }}>
        <h1 className="a-slidel" style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>Settings</h1>
        <p className="a-slidel" style={{ color:'var(--text-2)', fontSize:13, animationDelay:'.06s' }}>Manage your account and preferences</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24, alignItems:'start', maxWidth:820 }}>

        {/* Side nav */}
        <div className="card a-fadein" style={{ padding:8 }}>
          {[
            ['profile',  '👤 Profile'],
            ['security', '🔐 Security'],
            ['danger',   '⚠  Account'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`nav-link ${tab === id ? 'active' : ''}`}
              style={{ width:'100%', textAlign:'left', border:'none', fontFamily:"'Inter',sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="a-slider" style={{ animationDelay:'.08s' }}>
          {tab === 'profile'  && <ProfilePanel user={user} />}
          {tab === 'security' && <SecurityPanel toast={toast} />}
          {tab === 'danger'   && <DangerPanel logOut={logOut} toast={toast} />}
        </div>
      </div>
    </div>
  )
}

/* ── Profile ─────────────────────────────────────────────────────────────── */
function ProfilePanel({ user }) {
  return (
    <div className="card">
      <h2 style={{ fontSize:17, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:20 }}>Profile</h2>

      {/* Avatar row */}
      <div style={{ display:'flex', alignItems:'center', gap:18, padding:'18px 20px', background:'var(--bg-input)', borderRadius:12, border:'1px solid var(--border)', marginBottom:20 }}>
        <Avatar name={user} size={60} />
        <div>
          <div style={{ fontSize:19, fontWeight:700, marginBottom:4 }}>{user}</div>
          <div style={{ fontSize:13, color:'var(--text-2)' }}>Member · TaskFlow</div>
        </div>
      </div>

      {/* Info fields (read-only for now) */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label className="label">Username</label>
          <input className="input" value={user || ''} readOnly style={{ opacity:.6, cursor:'not-allowed' }} />
        </div>
        <div style={{ padding:'14px 16px', background:'rgba(124,109,250,.06)', borderRadius:10, border:'1px solid rgba(124,109,250,.15)', fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
          💡 To update your username or email, add a <code style={{ color:'var(--accent)', fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>PUT /users/me</code> endpoint to the backend and connect it here.
        </div>
      </div>
    </div>
  )
}

/* ── Security (Change Password) ──────────────────────────────────────────── */
function SecurityPanel({ toast }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ current_password:'', new_password:'', confirm:'' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const passwordsMatch  = form.new_password && form.confirm && form.new_password === form.confirm
  const passwordsMismatch = form.confirm && form.new_password !== form.confirm

  const handleSubmit = async () => {
    if (!form.current_password || !form.new_password || !form.confirm) {
      toast('Please fill all fields', 'warn'); return
    }
    if (!passwordsMatch) { toast('New passwords do not match', 'warn'); return }
    if (form.new_password.length < 6) { toast('Password must be at least 6 characters', 'warn'); return }
    setLoading(true)
    try {
      await changePassword({ current_password: form.current_password, new_password: form.new_password })
      toast('Password changed successfully! 🔐')
      setForm({ current_password:'', new_password:'', confirm:'' })
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h2 style={{ fontSize:17, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>Change Password</h2>
      <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:22, lineHeight:1.5 }}>
        Use a strong password with at least 6 characters, mixing letters and numbers.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label className="label">Current Password</label>
          <input className="input" type="password" placeholder="Your current password" value={form.current_password}
            onChange={e => set('current_password', e.target.value)} />
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <label className="label">New Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={form.new_password}
            onChange={e => set('new_password', e.target.value)} />
        </div>

        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" placeholder="Repeat new password" value={form.confirm}
            onChange={e => set('confirm', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ borderColor: passwordsMismatch ? 'var(--red)' : passwordsMatch ? 'var(--green)' : '' }} />
          {passwordsMismatch && (
            <p style={{ fontSize:12, color:'var(--red)', marginTop:6 }}>⚠ Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p style={{ fontSize:12, color:'var(--green)', marginTop:6 }}>✓ Passwords match</p>
          )}
        </div>

        {/* Strength hint */}
        {form.new_password && (
          <div style={{ display:'flex', gap:6 }}>
            {['Length 6+', 'Uppercase', 'Number'].map((hint, i) => {
              const checks = [form.new_password.length >= 6, /[A-Z]/.test(form.new_password), /\d/.test(form.new_password)]
              return (
                <span key={hint} style={{ fontSize:11, padding:'3px 9px', borderRadius:6, background: checks[i] ? 'rgba(0,229,160,.12)' : 'var(--bg-input)', color: checks[i] ? 'var(--green)' : 'var(--text-3)', border:`1px solid ${checks[i] ? 'rgba(0,229,160,.25)' : 'var(--border)'}`, fontWeight:500 }}>
                  {checks[i] ? '✓' : '○'} {hint}
                </span>
              )
            })}
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
          <button className="btn-ghost" onClick={() => setForm({ current_password:'', new_password:'', confirm:'' })}>
            Clear
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner size={16} color="#fff" /> : '🔐 Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Danger Zone ─────────────────────────────────────────────────────────── */
function DangerPanel({ logOut, toast }) {
  return (
    <div className="card">
      <h2 style={{ fontSize:17, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>Account Actions</h2>
      <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:22 }}>Manage session and account lifecycle.</p>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {/* Sign out */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', border:'1px solid var(--border)', borderRadius:12, background:'var(--bg-input)' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>Sign Out</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>End your current session on this device</div>
          </div>
          <button className="btn-ghost" onClick={logOut}>Sign Out</button>
        </div>

        {/* Delete account */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', border:'1px solid rgba(255,84,112,.22)', borderRadius:12, background:'rgba(255,84,112,.04)' }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:3, color:'var(--red)' }}>Delete Account</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>Permanently remove your account and all data</div>
          </div>
          <button className="btn-danger"
            onClick={() => toast('Requires DELETE /users/me endpoint on backend', 'warn')}>
            Delete
          </button>
        </div>

        {/* Info */}
        <div style={{ padding:'14px 16px', background:'rgba(255,181,71,.05)', borderRadius:10, border:'1px solid rgba(255,181,71,.18)', fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
          ⚠ Account deletion requires a <code style={{ color:'var(--amber)', fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>DELETE /users/me</code> endpoint. Add it to the backend and connect it here.
        </div>
      </div>
    </div>
  )
}
