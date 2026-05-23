import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { X, Sparkles, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { uid } from '../../store/useAppStore'

const CATEGORIES = ['work', 'personal', 'health', 'learning', 'creative']
const PRIORITIES = ['high', 'medium', 'low']
const KANBAN_COLS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } },
  exit: { opacity: 0, x: 100, transition: { duration: 0.2 } },
}

export default function TaskModal({ onClose, initialTask = null }) {
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)

  const [form, setForm] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'medium',
    category: initialTask?.category || 'personal',
    dueDate: initialTask?.dueDate || new Date().toISOString().split('T')[0],
    kanbanCol: initialTask?.kanbanCol || 'backlog',
    pebbles: initialTask?.pebbles || [],
  })

  const [newPebble, setNewPebble] = useState('')

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleAddPebble = (e) => {
    e.preventDefault()
    if (!newPebble.trim()) return
    set('pebbles', [...form.pebbles, { id: uid(), title: newPebble, completed: false }])
    setNewPebble('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (initialTask) {
      updateTask(initialTask.id, form)
    } else {
      addTask(form)
    }
    onClose()
  }

  return (
    <motion.div
      variants={overlayVariants}
      initial="initial" animate="animate" exit="exit"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      }}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-label={initialTask ? 'Edit Task' : 'New Task'}
        variants={modalVariants}
        initial="initial" animate="animate" exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%', maxWidth: 520, height: '100vh',
          padding: '32px 40px',
          background: 'var(--bg-surface)',
          borderRadius: '24px 0 0 24px',
          overflowY: 'auto',
          borderRight: 'none'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), var(--color-mint-300))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', flex: 1 }}>
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Task Title *
            </label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What do you want to accomplish?"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Notes
            </label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Add details, context, or steps…"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Row: Priority + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Priority
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIORITIES.map((p) => {
                  const colors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }
                  const active = form.priority === p
                  return (
                    <button
                      key={p} type="button"
                      onClick={() => set('priority', p)}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid`,
                        borderColor: active ? colors[p] : 'var(--border)',
                        background: active ? `${colors[p]}20` : 'transparent',
                        color: active ? colors[p] : 'var(--text-muted)',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Category
              </label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                style={{ fontSize: 13, textTransform: 'capitalize' }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Due Date + Kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Due Date
              </label>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                style={{ fontSize: 13, colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Board Column
              </label>
              <select
                className="input"
                value={form.kanbanCol}
                onChange={(e) => set('kanbanCol', e.target.value)}
                style={{ fontSize: 13 }}
              >
                {KANBAN_COLS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Subtasks (Pebbles) */}
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pebbles (Subtasks)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {form.pebbles.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-input)', padding: '8px 12px', borderRadius: 8 }}>
                  <button type="button" onClick={() => set('pebbles', form.pebbles.map(x => x.id === p.id ? { ...x, completed: !x.completed } : x))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: p.completed ? 'var(--success)' : 'var(--text-muted)' }}>
                    {p.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </button>
                  <span style={{ flex: 1, fontSize: 14, color: p.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: p.completed ? 'line-through' : 'none' }}>{p.title}</span>
                  <button type="button" onClick={() => set('pebbles', form.pebbles.filter(x => x.id !== p.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                className="input" placeholder="Add a pebble..." value={newPebble} onChange={e => setNewPebble(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAddPebble(e)}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddPebble} style={{ padding: '0 16px' }}><Plus size={16}/></button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: 4, width: '100%', padding: '12px', fontSize: 15, borderRadius: 12 }}
          >
            {initialTask ? 'Save Changes' : '✨ Create Task'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
