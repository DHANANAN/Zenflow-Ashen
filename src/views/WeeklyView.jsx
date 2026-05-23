import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import TaskCard from '../components/tasks/TaskCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

function getWeekDays(startDate) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    days.push(d)
  }
  return days
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

export default function WeeklyView() {
  const tasks = useAppStore((s) => s.tasks)
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))

  const days = getWeekDays(weekStart)

  const fmt = (d) => d.toISOString().split('T')[0]
  const todayKey = new Date().toISOString().split('T')[0]

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }
  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const weekLabel = () => {
    const start = days[0]
    const end = days[6]
    const opts = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
  }

  return (
    <div>
      {/* Week navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn-icon" onClick={prevWeek}><ChevronLeft size={18} /></button>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>
          {weekLabel()}
        </h3>
        <button className="btn-icon" onClick={nextWeek}><ChevronRight size={18} /></button>
      </div>

      {/* Day columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, overflowX: 'auto' }}>
        {days.map((day) => {
          const key = fmt(day)
          const isToday = key === todayKey
          const dayTasks = tasks.filter((t) => t.dueDate === key)
          const completedCount = dayTasks.filter((t) => t.completed).length
          const pct = dayTasks.length ? (completedCount / dayTasks.length) * 100 : 0

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: days.indexOf(day) * 0.05 }}
              style={{
                minWidth: 160,
                background: isToday ? 'linear-gradient(180deg, rgba(124,58,237,0.1) 0%, var(--bg-card) 100%)' : 'var(--bg-card)',
                border: `1px solid ${isToday ? 'var(--border-strong)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '14px 12px',
                minHeight: 200,
              }}
            >
              {/* Day header */}
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                  color: isToday ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 2,
                }}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)',
                  color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                }}>
                  {day.getDate()}
                </div>
                {/* Mini progress */}
                {dayTasks.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ background: 'var(--border)', borderRadius: 99, height: 3 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'var(--accent)', borderRadius: 99 }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                      {completedCount}/{dayTasks.length} done
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks */}
              {dayTasks.length === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-placeholder)', textAlign: 'center', paddingTop: 16 }}>
                  No tasks
                </div>
              ) : (
                dayTasks.map((task) => (
                  <div key={task.id} style={{
                    padding: '6px 8px', borderRadius: 8, marginBottom: 6,
                    background: task.completed ? 'var(--bg-hover)' : 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    fontSize: 12, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981',
                    }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
