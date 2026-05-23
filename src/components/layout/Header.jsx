import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { Menu, Plus, Search, X, LogIn } from 'lucide-react'
import TaskModal from '../tasks/TaskModal'
import AuthModal from '../auth/AuthModal'

export default function Header() {
  const { toggleSidebar, currentView, getStats } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [search, setSearch] = useState('')

  const stats = getStats()
  const viewLabel = {
    daily: 'Daily Planner', weekly: 'Weekly Planner',
    monthly: 'Monthly Planner', kanban: 'Kanban Board',
    calendar: 'Calendar', analytics: 'Analytics',
  }[currentView] || 'Zenflow'

  useEffect(() => {
    const handler = () => setShowAuth(true)
    window.addEventListener('open-auth', handler)
    return () => window.removeEventListener('open-auth', handler)
  }, [])

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 'var(--sidebar-width)',
        right: 0,
        height: 'var(--header-height)',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Mobile menu */}
        <button className="btn-icon md:hidden" onClick={toggleSidebar}>
          <Menu size={18} />
        </button>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {viewLabel}
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {stats.completed} completed · {stats.streak}🔥 day streak
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{
            position: 'absolute', left: 10,
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ paddingLeft: 32, width: 200, fontSize: 13 }}
          />
          {search && (
            <button className="btn-icon" onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 6 }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Quick Add */}
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          style={{ gap: 6, padding: '8px 16px', fontSize: 13 }}
        >
          <Plus size={15} />
          Add Task
        </motion.button>

        {/* Auth */}
        <motion.button
          className="btn btn-ghost"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAuth(true)}
          style={{ gap: 6, padding: '8px 14px', fontSize: 13 }}
        >
          <LogIn size={14} />
          <span className="hidden sm:inline">Sign In</span>
        </motion.button>
      </header>

      <AnimatePresence>
        {showModal && <TaskModal onClose={() => setShowModal(false)} />}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </AnimatePresence>
    </>
  )
}
