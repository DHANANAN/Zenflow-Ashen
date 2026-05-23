import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { Play, Pause, X, Music, Volume2 } from 'lucide-react'

// Hardcoded ambient tracks (public domain or placeholders)
const AMBIENT_TRACKS = [
  { id: 'rain', label: 'Rain on Leaves', icon: '🌧️', theme: '#3B82F6' },
  { id: 'river', label: 'Flowing River', icon: '🌊', theme: '#10B981' },
  { id: 'zen', label: 'Singing Bowl', icon: '🥣', theme: '#7C3AED' },
]

export default function FocusMode() {
  const { tasks, activeFocusTask, setFocusTask, toggleTask } = useAppStore()
  const task = tasks.find(t => t.id === activeFocusTask)

  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
  const [isActive, setIsActive] = useState(false)
  const [track, setTrack] = useState(AMBIENT_TRACKS[0])
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Timer logic
  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  // Simple formatting
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  if (!task) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="washi-texture fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-auto"
      style={{
        background: 'var(--bg-base)', border: `8px solid ${track.theme}22`
      }}
    >
      {/* Top Bar for escaping */}
      <button 
        onClick={() => setFocusTask(null)}
        style={{ position: 'absolute', top: 32, right: 32, background: 'var(--bg-hover)', color: 'var(--text-primary)', border: 'none', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
      >
        <X size={24} />
      </button>

      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', position: 'relative' }}>
        
        <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 24 }}>
          Focusing On
        </div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, marginBottom: 60, color: 'var(--text-primary)'}}>
          {task.title}
        </h2>

        {/* Breathing Timer Ring */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Animated Background Ring */}
          <motion.div 
            animate={{ scale: isActive ? [1, 1.1, 1] : 1, opacity: isActive ? [0.1, 0.3, 0.1] : 0.1 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: track.theme }}
          />

          {/* Core Timer UI */}
          <div style={{ position: 'relative', zIndex: 10, width: 220, height: 220, borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${track.theme}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 56, fontWeight: 800, color: task.completed ? 'var(--success)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {task.completed ? '00:00' : timeStr}
            </div>
            
            <button
              disabled={task.completed}
              onClick={() => setIsActive(!isActive)}
              style={{ marginTop: 12, width: 44, height: 44, borderRadius: '50%', background: task.completed ? 'var(--bg-input)' : track.theme, color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: task.completed ? 'default' : 'pointer' }}
            >
              {isActive ? <Pause size={20} fill="white"/> : <Play size={20} fill="white" style={{ marginLeft: 3 }}/>}
            </button>
          </div>
        </div>

        {/* Action Bottom */}
        <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
          
          <button 
            onClick={() => toggleTask(task.id)}
            style={{ padding: '14px 32px', borderRadius: 99, border: 'none', background: task.completed ? 'var(--success)' : 'var(--text-primary)', color: 'var(--bg-base)', fontSize: 16, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
          >
            {task.completed ? 'Completed ✨' : 'Complete Task'}
          </button>

          {/* Sound Controls */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 99, border: '1px solid var(--border)' }}>
            <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: 'transparent', border: 'none', color: soundEnabled ? track.theme : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {soundEnabled ? <Volume2 size={18}/> : <Music size={18}/>}
            </button>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            {AMBIENT_TRACKS.map(t => (
              <button 
                key={t.id} onClick={() => setTrack(t)}
                style={{ background: track.id === t.id ? `${t.theme}20` : 'transparent', border: 'none', padding: '4px 8px', borderRadius: 12, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: track.id === t.id ? t.theme : 'var(--text-muted)' }}
              >
                {t.icon} <span style={{ fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
