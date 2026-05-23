import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { Trash2, GripVertical, ChevronDown, ChevronUp, Tag, Calendar, Crosshair, CheckSquare } from 'lucide-react'

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }
const PRIORITY_BG = { high: 'rgba(239,68,68,0.12)', medium: 'rgba(245,158,11,0.12)', low: 'rgba(16,185,129,0.12)' }
const CATEGORY_COLORS = {
  work: '#3B82F6', personal: '#EC4899', health: '#10B981',
  learning: '#F59E0B', creative: '#7C3AED',
}
const CATEGORY_BG = {
  work: 'rgba(59,130,246,0.12)', personal: 'rgba(236,72,153,0.12)',
  health: 'rgba(16,185,129,0.12)', learning: 'rgba(245,158,11,0.12)',
  creative: 'rgba(124,58,237,0.12)',
}

export default function TaskCard({ task, dragging = false }) {
  const { toggleTask, deleteTask, setFocusTask } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const completedPebbles = task.pebbles?.filter(p => p.completed).length || 0
  const totalPebbles = task.pebbles?.length || 0

  const handleToggle = () => {
    if (!task.completed) {
      setJustCompleted(true)
      setTimeout(() => setJustCompleted(false), 1200)
    }
    toggleTask(task.id)
  }

  const formatDate = (d) => {
    if (!d) return null
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: dragging ? 0.5 : 1, y: 0, scale: dragging ? 1.03 : 1 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="card task-card-row shoji-panel"
      style={{
        padding: '14px 16px',
        marginBottom: 8,
        opacity: task.completed ? 0.65 : 1,
        boxShadow: dragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        cursor: dragging ? 'grabbing' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Completion glow */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: '50%', left: 32,
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid rgba(16,185,129,0.8)`,
              background: 'rgba(16,185,129,0.2)',
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Drag handle */}
        <span className="drag-handle" style={{ marginTop: 2 }}>
          <GripVertical size={15} />
        </span>

        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleToggle}
          style={{
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${task.completed ? PRIORITY_COLORS[task.priority] : 'var(--border-strong)'}`,
            background: task.completed ? `linear-gradient(135deg, ${PRIORITY_COLORS[task.priority]}, ${PRIORITY_COLORS[task.priority]}88)` : 'transparent',
            cursor: 'pointer', flexShrink: 0, marginTop: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.svg
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontWeight: 500, fontSize: 14,
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: task.completed ? 'line-through' : 'none',
              transition: 'all 0.3s',
            }}>
              {task.title}
            </span>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            {/* Priority */}
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 99,
              color: PRIORITY_COLORS[task.priority], background: PRIORITY_BG[task.priority],
            }}>
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
                color: CATEGORY_COLORS[task.category] || 'var(--text-muted)',
                background: CATEGORY_BG[task.category] || 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Tag size={9} />
                {task.category}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </span>
            )}
            
            {/* Pebbles Progress */}
            {totalPebbles > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckSquare size={10} />
                {completedPebbles}/{totalPebbles}
                <div style={{ width: 40, height: 4, background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden', marginLeft: 2 }}>
                  <div style={{ width: `${(completedPebbles/totalPebbles)*100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }}/>
                </div>
              </span>
            )}
          </div>

          {/* Expanded description */}
          <AnimatePresence>
            {expanded && task.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                  {task.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: -2 }}>
          <button
            className="btn-icon"
            title="Enter Focus Mode"
            onClick={() => setFocusTask(task.id)}
            style={{ color: 'var(--accent)' }}
          >
            <Crosshair size={13} />
          </button>
          {task.description && (
            <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
          <button
            className="btn-icon"
            onClick={() => deleteTask(task.id)}
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
