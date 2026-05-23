import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { SNIPPETS } from '../../data/snippets'
import { RefreshCw, BookOpen, Lightbulb, Quote, Heart } from 'lucide-react'

const TYPE_META = {
  quote: { icon: Quote, label: 'Quote', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
  tip: { icon: Lightbulb, label: 'Tip', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  book: { icon: BookOpen, label: 'Book', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  mindful: { icon: Heart, label: 'Mindful', color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
}

export default function MindfulSnippet() {
  const { snippetIndex, nextSnippet } = useAppStore()
  const [flipped, setFlipped] = useState(false)

  const snippet = SNIPPETS[snippetIndex % SNIPPETS.length]
  const meta = TYPE_META[snippet.type] || TYPE_META.tip
  const Icon = meta.icon

  // Auto-advance every 5 minutes
  useEffect(() => {
    const timer = setInterval(nextSnippet, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [nextSnippet])

  const handleNext = () => {
    setFlipped(true)
    setTimeout(() => {
      nextSnippet()
      setFlipped(false)
    }, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
        🧘 Mindful Break
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={snippetIndex}
          initial={{ opacity: 0, rotateX: 90, scaleY: 0.5, originY: 1 }}
          animate={{ opacity: 1, rotateX: 0, scaleY: 1, originY: 0.5 }}
          exit={{ opacity: 0, rotateX: -90, scaleY: 0.5, originY: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="card"
          style={{
            padding: '20px', borderRadius: 'var(--radius-lg)',
            background: `linear-gradient(135deg, ${meta.bg}, var(--bg-card))`,
            border: `1px solid ${meta.color}30`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', right: -20, top: -20,
            width: 80, height: 80, borderRadius: '50%',
            background: `${meta.color}15`,
            pointerEvents: 'none',
          }} />

          {/* Type badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99,
            background: meta.bg, color: meta.color,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            marginBottom: 12,
          }}>
            <Icon size={10} />
            {meta.label}
          </div>

          {/* Emoji */}
          <div style={{ fontSize: 28, marginBottom: 10 }}>{snippet.emoji}</div>

          {/* Content */}
          {snippet.type === 'quote' ? (
            <>
              <p style={{
                fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)',
                fontStyle: 'italic', fontWeight: 500, marginBottom: 10,
              }}>
                {snippet.content}
              </p>
              <p style={{ fontSize: 12, color: meta.color, fontWeight: 600 }}>
                — {snippet.author}
              </p>
            </>
          ) : (
            <>
              {(snippet.title) && (
                <h4 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14,
                  color: 'var(--text-primary)', marginBottom: 8,
                }}>
                  {snippet.title}
                  {snippet.author && (
                    <span style={{ fontSize: 11, fontWeight: 400, color: meta.color, marginLeft: 8 }}>
                      by {snippet.author}
                    </span>
                  )}
                </h4>
              )}
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                {snippet.content}
              </p>
            </>
          )}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 14, justifyContent: 'center' }}>
            {Array.from({ length: Math.min(8, SNIPPETS.length) }).map((_, i) => {
              const active = i === snippetIndex % 8
              return (
                <div key={i} style={{
                  width: active ? 16 : 5, height: 5, borderRadius: 99,
                  background: active ? meta.color : 'var(--border)',
                  transition: 'all 0.3s',
                }} />
              )
            })}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 28, height: 28, borderRadius: '50%',
              background: meta.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: meta.color,
            }}
          >
            <RefreshCw size={12} />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
