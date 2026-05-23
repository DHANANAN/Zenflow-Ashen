import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, LayoutDashboard, Layers, Calendar as CalendarIcon, BarChart3 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function CommandPalette({ open, onClose }) {
  const { tasks, setView, addTask } = useAppStore()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [open])

  if (!open) return null

  // ── Search Logic ──
  const q = query.toLowerCase()
  const isAction = q.startsWith('>')
  const isNew = q.startsWith('new ') || q.startsWith('add ')
  
  const filteredTasks = !isAction && !isNew && q 
    ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
    : []

  const ACTIONS = [
    { label: 'Go to Daily View', icon: LayoutDashboard, view: 'daily' },
    { label: 'Go to Kanban Board', icon: Layers, view: 'kanban' },
    { label: 'Go to Calendar', icon: CalendarIcon, view: 'calendar' },
    { label: 'Go to Analytics', icon: BarChart3, view: 'analytics' },
  ]
  const filteredActions = (isAction || q) 
    ? ACTIONS.filter(a => a.label.toLowerCase().includes(q.replace('>','').trim()))
    : ACTIONS

  const handleCreateTask = (e) => {
    e.preventDefault()
    const taskTitle = q.replace(/^new\s+|^add\s+/, '').trim()
    if (!taskTitle) return
    addTask({ title: taskTitle, kanbanCol: 'backlog', priority: 'medium' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      />

      {/* Palette Box */}
      <motion.div 
        role="dialog" aria-modal="true" aria-label="Command Palette"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="shoji-panel"
        style={{
          position: 'relative', width: '90%', maxWidth: 640,
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Input area */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: 12 }} />
          <form style={{ flex: 1 }} onSubmit={isNew ? handleCreateTask : (e)=>e.preventDefault()}>
            <input
              ref={inputRef}
              aria-label="Search or add task command input"
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Type 'new' to add a task, '>' for actions, or search..."
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                fontSize: 18, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)'
              }}
            />
          </form>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>ESC</div>
        </div>

        {/* Results area */}
        <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '12px 12px' }}>
          
          {/* Create Task Mode */}
          {isNew && (
            <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-hover)', borderRadius: 8 }}>
              <div style={{ background: 'var(--accent)', padding: 6, borderRadius: '50%' }}><Plus size={16} color="white" /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Create New Task</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Press Enter to save "{query.replace(/^new\s+|^add\s+/, '')}" to Backlog</div>
              </div>
            </div>
          )}

          {/* Navigation Actions */}
          {!isNew && filteredActions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 12px' }}>Navigation</div>
              {filteredActions.map(action => (
                <button
                  key={action.view}
                  onClick={() => { setView(action.view); onClose() }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 8, border: 'none', background: 'transparent',
                    cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <action.icon size={16} color="var(--text-muted)" />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Task Search Results */}
          {!isAction && !isNew && filteredTasks.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 12px' }}>Tasks</div>
              {filteredTasks.map(task => (
                <div key={task.id} style={{
                  padding: '12px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: task.completed ? 'var(--success)' : 'var(--accent)' }} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{task.title}</div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isNew && query && filteredTasks.length === 0 && filteredActions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 14 }}>
              No results found for "{query}".
            </div>
          )}

          {!query && (
            <div style={{ textAlign: 'center', padding: '24px', opacity: 0.5 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎋</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Focus on the essential. Search for anything.</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
