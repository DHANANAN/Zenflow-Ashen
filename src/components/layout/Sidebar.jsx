import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import {
  LayoutDashboard, Calendar, CalendarDays, CalendarRange,
  Layers, BarChart3, Sun, Moon, Menu, X, Sparkles
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'daily',     icon: LayoutDashboard, label: 'Daily',    desc: 'Today\'s tasks' },
  { id: 'weekly',    icon: CalendarDays,    label: 'Weekly',   desc: '7-day planner' },
  { id: 'monthly',   icon: CalendarRange,   label: 'Monthly',  desc: 'Month overview' },
  { id: 'kanban',    icon: Layers,          label: 'Kanban',   desc: 'Project board' },
  { id: 'calendar',  icon: Calendar,        label: 'Calendar', desc: 'Deadline view' },
  { id: 'analytics', icon: BarChart3,       label: 'Analytics','desc': 'Progress graphs' },
]

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

export default function Sidebar() {
  const { currentView, setView, theme, toggleTheme, sidebarOpen, toggleSidebar, currentUser, logout } = useAppStore()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        variants={sidebarVariants}
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--color-mint-300))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px var(--accent-glow)',
          }}>
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
              Zenflow
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Productivity Sanctuary
            </div>
          </div>
          <button className="btn-icon md:hidden ml-auto" onClick={toggleSidebar}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ gap: 4, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 8px' }}>
            Planners
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = currentView === item.id
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  background: active ? 'linear-gradient(135deg, var(--accent), rgba(124,58,237,0.7))' : 'transparent',
                  color: active ? 'white' : 'var(--text-secondary)',
                  boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
                  transition: 'all var(--transition-fast)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                )}
                <Icon size={17} style={{ flexShrink: 0, position: 'relative' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{item.desc}</div>
                </div>
              </motion.button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'var(--bg-input)',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all var(--transition-fast)', width: '100%',
            }}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* User */}
          {currentUser ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-hover)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--color-mint-300))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 13,
              }}>
                {currentUser.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                <button onClick={logout} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign out</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px', fontSize: 12, color: 'var(--text-muted)' }}>
              Guest mode • <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth')) }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}
