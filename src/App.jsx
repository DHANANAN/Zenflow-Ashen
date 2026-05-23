import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from './store/useAppStore'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import DailyView from './views/DailyView'
import WeeklyView from './views/WeeklyView'
import MonthlyView from './views/MonthlyView'
import KanbanView from './views/KanbanView'
import CalendarView from './views/CalendarView'
import AnalyticsView from './views/AnalyticsView'
import LoadingScreen from './components/layout/LoadingScreen'
import CommandPalette from './components/layout/CommandPalette'
import FocusMode from './views/FocusMode'
import { useState, useEffect } from 'react'

const views = {
  daily: DailyView,
  weekly: WeeklyView,
  monthly: MonthlyView,
  kanban: KanbanView,
  calendar: CalendarView,
  analytics: AnalyticsView,
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function App() {
  const currentView = useAppStore((s) => s.currentView)
  const ViewComponent = views[currentView] || DailyView
  const [isLoaded, setIsLoaded] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    // Mindful delay for loading screen
    const t = setTimeout(() => setIsLoaded(true), 2000)

    // Global Command Palette Shortcut
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(prev => !prev)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {!isLoaded && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <AnimatePresence>
        {isLoaded && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="app-layout"
          >
            <Sidebar />
            <div className="main-content">
              <Header />
              <main className="page-container">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ViewComponent />
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>

            {/* Omnipresent Overlays */}
            <AnimatePresence>
              {cmdOpen && <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />}
            </AnimatePresence>
            <AnimatePresence>
              {useAppStore.getState().activeFocusTask && <FocusMode />}
            </AnimatePresence>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
