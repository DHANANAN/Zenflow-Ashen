import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import TaskCard from '../components/tasks/TaskCard'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function MonthlyView() {
  const tasks = useAppStore((s) => s.tasks)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  const days = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayKey = now.toISOString().split('T')[0]

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const getKey = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const selectedKey = selectedDay ? getKey(selectedDay) : null
  const selectedTasks = selectedKey ? tasks.filter((t) => t.dueDate === selectedKey) : []

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
          {MONTHS[month]} {year}
        </h2>
        <button className="btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ padding: 20 }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DAYS.map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              color: 'var(--text-muted)', padding: '4px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1
            const key = getKey(d)
            const isToday = key === todayKey
            const isSelected = selectedDay === d
            const dayTasks = tasks.filter((t) => t.dueDate === key)
            const completed = dayTasks.filter((t) => t.completed).length

            return (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(d === selectedDay ? null : d)}
                style={{
                  aspectRatio: '1', borderRadius: 10, padding: '6px 4px',
                  border: isToday ? '2px solid var(--accent)' : isSelected ? '2px solid var(--accent-light)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(124,58,237,0.15)' : isToday ? 'rgba(124,58,237,0.08)' : 'var(--bg-input)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                }}
              >
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 800 : 500,
                  color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                }}>{d}</span>
                {/* Task dots */}
                {dayTasks.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dayTasks.slice(0, 4).map((t) => (
                      <div key={t.id} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: t.completed ? '#10B981' :
                          t.priority === 'high' ? '#EF4444' :
                          t.priority === 'medium' ? '#F59E0B' : 'var(--accent)',
                        opacity: t.completed ? 0.6 : 1,
                      }} />
                    ))}
                    {dayTasks.length > 4 && (
                      <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>+{dayTasks.length - 4}</span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="card"
            style={{ marginTop: 20, padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                {MONTHS[month]} {selectedDay}, {year}
              </h3>
              <button className="btn-icon" onClick={() => setSelectedDay(null)}><X size={14} /></button>
            </div>
            {selectedTasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tasks scheduled for this day.</p>
            ) : (
              selectedTasks.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
