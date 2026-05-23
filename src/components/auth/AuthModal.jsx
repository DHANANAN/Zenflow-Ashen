import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { X, LogIn } from 'lucide-react'

export default function AuthModal({ onClose }) {
  const { login } = useAppStore()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (tab === 'signup' && !form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.email.includes('@')) { setError('Please enter a valid email.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    // localStorage-based "auth"
    const users = JSON.parse(localStorage.getItem('zf-users') || '[]')
    if (tab === 'login') {
      const user = users.find((u) => u.email === form.email && u.password === form.password)
      if (!user) { setError('Invalid email or password.'); return }
      login(user.name, user.email)
    } else {
      if (users.find((u) => u.email === form.email)) { setError('Email already registered.'); return }
      const newUser = { name: form.name, email: form.email, password: form.password }
      localStorage.setItem('zf-users', JSON.stringify([...users, newUser]))
      login(form.name, form.email)
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 30 } }}
        exit={{ opacity: 0, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: '100%', maxWidth: 420, padding: 32, background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
              {tab === 'login' ? 'Welcome back 👋' : 'Join Zenflow 🌿'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {tab === 'login' ? 'Sign in to sync your tasks.' : 'Create an account to save progress.'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ marginLeft: 'auto' }}><X size={16} /></button>
        </div>

        {/* Guest note */}
        <div style={{
          background: 'var(--bg-hover)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--text-muted)',
        }}>
          💡 You can use Zenflow without signing in. Login is only needed for cross-device sync.
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--bg-input)',
          borderRadius: 10, padding: 4, marginBottom: 20,
        }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t} onClick={() => { setTab(t); setError('') }}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}
            >{t === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'signup' && (
            <input
              className="input" placeholder="Your name"
              value={form.name} onChange={(e) => setField('name', e.target.value)}
            />
          )}
          <input
            className="input" type="email" placeholder="Email address"
            value={form.email} onChange={(e) => setField('email', e.target.value)}
          />
          <input
            className="input" type="password" placeholder="Password"
            value={form.password} onChange={(e) => setField('password', e.target.value)}
          />

          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <motion.button
            type="submit" className="btn btn-primary"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: '100%', padding: 12, fontSize: 14, gap: 8 }}
          >
            <LogIn size={15} />
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
