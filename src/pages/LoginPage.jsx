import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, requestPasswordReset, confirmPasswordReset } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import { AuthShell } from '../components/AuthShell'

export default function LoginPage() {
  const navigate = useNavigate()
  const { logIn } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async () => {
    if (!form.email || !form.password) { toast('Please fill all fields', 'warn'); return }
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
     logIn(data.user.username, data.access_token)
      toast(`Welcome back, ${data.user.username}! 🎉`)
       navigate('/dashboard')
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />

  return (
    <AuthShell title="Welcome back" sub="Sign in to your workspace">
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <div style={{ textAlign:'right', marginTop:8 }}>
            <button onClick={() => setShowForgot(true)}
              style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', fontSize:13, fontFamily:"'Inter',sans-serif", transition:'color .15s' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-2)'}>
              Forgot password?
            </button>
          </div>
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15, marginTop:4 }}>
          {loading ? <Spinner size={18} color="#fff" /> : 'Sign In'}
        </button>
      </div>
      <p style={{ textAlign:'center', marginTop:24, color:'var(--text-2)', fontSize:14 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one</Link>
      </p>
    </AuthShell>
  )
}

/* ── Forgot Password flow ────────────────────────────────────────────────── */
function ForgotPassword({ onBack }) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequest = async () => {
    if (!email.trim()) { toast('Enter your email', 'warn'); return }
    setLoading(true)
    try {
      const res = await requestPasswordReset(email)
      toast('Reset token generated!')
      if (res.reset_token) setToken(res.reset_token)
      setStep(2)
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!token || !newPass) { toast('Fill all fields', 'warn'); return }
    if (newPass.length < 6) { toast('Password must be at least 6 characters', 'warn'); return }
    setLoading(true)
    try {
      await confirmPasswordReset(token, newPass)
      toast('Password reset successfully! You can now sign in.')
      onBack()
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell
      title="Reset Password"
      sub={step === 1 ? 'We will generate a reset token for you' : 'Enter your new password'}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {step === 1 ? (
          <>
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRequest()} autoFocus />
            <button className="btn-primary" onClick={handleRequest} disabled={loading}>
              {loading ? <Spinner size={16} color="#fff" /> : 'Send Reset Token →'}
            </button>
          </>
        ) : (
          <>
            <label className="label">Reset Token</label>
            <input className="input" placeholder="Paste your reset token here" value={token}
              onChange={e => setToken(e.target.value)} />
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="At least 6 characters" value={newPass}
              onChange={e => setNewPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()} />
            <button className="btn-primary" onClick={handleReset} disabled={loading}>
              {loading ? <Spinner size={16} color="#fff" /> : '🔐 Reset Password'}
            </button>
          </>
        )}
        <button onClick={onBack} className="btn-ghost" style={{ width:'100%', justifyContent:'center' }}>
          ← Back to Sign In
        </button>
      </div>
    </AuthShell>
  )
}
