import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar,
} from 'recharts'
import { CheckCircle2, Flame, Target, TrendingUp, Star } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const CATS = ['work', 'personal', 'health', 'learning', 'creative']
const CAT_COLORS = {
  work: '#3B82F6', personal: '#EC4899', health: '#10B981',
  learning: '#F59E0B', creative: '#7C3AED',
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

function HeatmapCalendar({ streakData }) {
  const weeks = []
  const today = new Date()
  // Build 52 weeks back
  const start = new Date(today)
  start.setDate(today.getDate() - 363)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  for (let w = 0; w < 52; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      const key = date.toISOString().split('T')[0]
      const count = streakData[key] || 0
      week.push({ key, count, future: date > today })
    }
    weeks.push(week)
  }

  const getHeat = (count) => {
    if (count === 0) return 'heat-0'
    if (count <= 1) return 'heat-1'
    if (count <= 3) return 'heat-2'
    if (count <= 5) return 'heat-3'
    return 'heat-4'
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day) => (
              <div
                key={day.key}
                className={`zen-tooltip ${day.future ? 'heat-0' : getHeat(day.count)}`}
                data-tooltip={`${day.key}: ${day.count} tasks`}
                style={{
                  width: 14, height: 14, borderRadius: '50%',
                  opacity: day.future ? 0.2 : 1,
                  transition: 'transform 0.1s',
                  cursor: 'default',
                  border: day.count > 0 ? 'none' : '1px solid var(--border)',
                  boxShadow: day.count > 0 ? 'inset -1px -1px 3px rgba(0,0,0,0.1), inset 1px 1px 3px rgba(255,255,255,0.7)' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Less</span>
        {['heat-0','heat-1','heat-2','heat-3','heat-4'].map((c) => (
          <div key={c} className={c} style={{ width: 10, height: 10, borderRadius: 2 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

// ─── Recharts custom tooltip ─────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      fontSize: 12, color: 'var(--text-primary)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card"
      style={{
        padding: '20px 22px',
        background: `linear-gradient(135deg, ${color}15 0%, var(--bg-card) 100%)`,
        border: `1px solid ${color}30`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsView() {
  const { tasks, streakData, getStats } = useAppStore()
  const stats = getStats()

  const last30 = getLast30Days()
  const last7 = getLast7Days()

  // Cumulative completions over 30 days
  const cumulativeData = (() => {
    let cumulative = 0
    return last30.map((d) => {
      const count = tasks.filter((t) => t.completedAt && t.completedAt.startsWith(d)).length
      cumulative += count
      return {
        date: d.slice(5), // MM-DD
        completed: count,
        total: cumulative,
      }
    })
  })()

  // Category breakdown (last 7 days)
  const categoryData = CATS.map((cat) => ({
    name: cat,
    done: tasks.filter((t) => t.category === cat && t.completed).length,
    pending: tasks.filter((t) => t.category === cat && !t.completed).length,
  }))

  // Daily completion rate (last 7 days)
  const weekData = last7.map((d) => {
    const dayTasks = tasks.filter((t) => t.dueDate === d)
    const done = dayTasks.filter((t) => t.completed).length
    return {
      day: new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      done,
      total: dayTasks.length,
      rate: dayTasks.length ? Math.round((done / dayTasks.length) * 100) : 0,
    }
  })

  const milestones = [
    { label: 'First Task', done: tasks.length >= 1, emoji: '🌱' },
    { label: '5 Tasks', done: tasks.filter(t => t.completed).length >= 5, emoji: '⭐' },
    { label: '3-Day Streak', done: stats.streak >= 3, emoji: '🔥' },
    { label: '7-Day Streak', done: stats.streak >= 7, emoji: '🏆' },
    { label: '20 Completed', done: tasks.filter(t => t.completed).length >= 20, emoji: '💎' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={CheckCircle2} label="Total Completed" value={tasks.filter(t=>t.completed).length} sub="all time" color="#10B981" delay={0} />
        <StatCard icon={Target} label="Completion Rate" value={`${stats.rate}%`} sub={`${stats.completed}/${stats.total} tasks`} color="#7C3AED" delay={0.05} />
        <StatCard icon={Flame} label="Current Streak" value={`${stats.streak}`} sub="days in a row" color="#F59E0B" delay={0.1} />
        <StatCard icon={TrendingUp} label="This Week" value={weekData.reduce((a,d)=>a+d.done,0)} sub="tasks done" color="#3B82F6" delay={0.15} />
      </div>

      {/* Main charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Area chart — cumulative */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card" style={{ padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>
            Productivity Growth
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Cumulative tasks completed — last 30 days
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#A78BFA" strokeWidth={3} fill="url(#totalGrad)" dot={false} strokeLinecap="round" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* River Line chart — weekly */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card" style={{ padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>
            Flowing River
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Daily completions this week
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
              <defs>
                 <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                 </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="done" name="Done" stroke="url(#riverGrad)" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#34D399', strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category mini charts + heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card" style={{ padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20, color: 'var(--text-primary)' }}>
            Category Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categoryData.map((cat) => {
              const total = cat.done + cat.pending
              const pct = total ? (cat.done / total) * 100 : 0
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cat.done}/{total}</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 8 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      style={{ height: '100%', borderRadius: 99, background: CAT_COLORS[cat.name] || 'var(--accent)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card" style={{ padding: 24 }}
        >
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20, color: 'var(--text-primary)' }}>
            Milestones
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {milestones.map((m) => (
              <div key={m.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10,
                background: m.done ? 'rgba(16,185,129,0.1)' : 'var(--bg-input)',
                border: `1px solid ${m.done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                opacity: m.done ? 1 : 0.6,
                transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: m.done ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
                  {m.label}
                </span>
                {m.done && <CheckCircle2 size={16} color="#10B981" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="card" style={{ padding: 24 }}
      >
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>
          Activity Heatmap
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Task completion intensity over the past year
        </p>
        <HeatmapCalendar streakData={streakData} />
      </motion.div>
    </div>
  )
}
