import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TaskCard from '../components/tasks/TaskCard'
import { AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getFirstDay(year, month) { return new Date(year, month, 1).getDay() }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const CAT_COLORS = {
  work: '#3B82F6', personal: '#EC4899', health: '#10B981',
  learning: '#F59E0B', creative: '#7C3AED',
}

export default function CalendarView() {
  const tasks = useAppStore((s) => s.tasks)
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [selected, setSelected] = useState(null)

  const days = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  const getKey = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const prev = () => { if (month === 0) { setMonth(11); setYear(y=>y-1) } else setMonth(m=>m-1); setSelected(null) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y=>y+1) } else setMonth(m=>m+1); setSelected(null) }

  // Tasks with deadlines this month
  const overdueCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayKey).length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            {cat}
          </div>
        ))}
        {overdueCount > 0 && (
          <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, marginLeft: 'auto' }}>
            ⚠️ {overdueCount} overdue
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 20 }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 20 }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button className="btn-icon" onClick={prev}><ChevronLeft size={16} /></button>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, flex: 1, color: 'var(--text-primary)' }}>
              {FULL_MONTHS[month]} {year}
            </h3>
            <button className="btn-icon" onClick={next}><ChevronRight size={16} /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, rowGap: 16 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`p${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1
              const key = getKey(d)
              const isToday = key === todayKey
              const isSelected = selected === d
              const dayTasks = tasks.filter(t => t.dueDate === key)
              const overdue = dayTasks.filter(t => !t.completed && key < todayKey)
              const hasTasks = dayTasks.length > 0

              return (
                <motion.button
                  key={d} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setSelected(d === selected ? null : d)}
                  className={`zen-stone ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '8px',
                    background: isSelected ? 'rgba(124,58,237,0.1)' : overdue.length > 0 ? 'rgba(239,68,68,0.05)' : 'var(--bg-input)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--accent)' : 'var(--text-primary)' }}>{d}</span>
                  {/* Category dot strips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                    {dayTasks.slice(0,6).map((t) => (
                      <div key={t.id} style={{
                        width: 6, height: 6, borderRadius: 2,
                        background: CAT_COLORS[t.category] || 'var(--accent)',
                        opacity: t.completed ? 0.4 : 1,
                      }} />
                    ))}
                  </div>
                  {overdue.length > 0 && (
                    <div style={{ position: 'absolute', top: 2, right: 3, width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card"
              style={{ padding: 20, height: 'fit-content', position: 'sticky', top: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, flex: 1, color: 'var(--text-primary)' }}>
                  {FULL_MONTHS[month]} {selected}
                </h4>
                <button className="btn-icon" onClick={() => setSelected(null)}><X size={13} /></button>
              </div>
              {tasks.filter(t => t.dueDate === getKey(selected)).length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tasks this day.</p>
              ) : (
                tasks.filter(t => t.dueDate === getKey(selected)).map(t => <TaskCard key={t.id} task={t} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
