import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/ui/Spinner'
import { AuthShell } from '../components/AuthShell'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) { toast('Please fill all fields', 'warn'); return }
    if (form.password.length < 6) { toast('Password must be at least 6 characters', 'warn'); return }
    setLoading(true)
    try {
      await register(form)
      toast('Account created! Sign in to get started 🚀')
      navigate('/login')
    } catch (e) { toast(e.message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Create your account" sub="Start managing projects like a pro">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label className="label">Username</label>
          <input className="input" placeholder="cooldev_2025" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width:'100%', justifyContent:'center', padding:14, fontSize:15, marginTop:4 }}>
          {loading ? <Spinner size={18} color="#fff" /> : 'Create Account'}
        </button>
      </div>
      <p style={{ textAlign:'center', marginTop:24, color:'var(--text-2)', fontSize:14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign In</Link>
      </p>
    </AuthShell>
  )
}
