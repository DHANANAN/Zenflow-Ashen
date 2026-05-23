import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1, ease: 'easeIn' } }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', color: 'var(--text-primary)',
      }}
      className="washi-texture shoji-lattice"
    >
      <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Ripple 1 */}
        <motion.div
          animate={{ scale: [0.8, 2], opacity: [0.6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
            border: '2px solid var(--accent)',
          }}
        />
        {/* Ripple 2 */}
        <motion.div
          animate={{ scale: [0.6, 1.8], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
          style={{
            position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
            border: '2px solid var(--accent-light)',
          }}
        />
        {/* Deep center stone */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            boxShadow: '0 0 16px var(--accent-glow)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ marginTop: 24, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}
      >
        Breathe In...
      </motion.div>
    </motion.div>
  )
}
