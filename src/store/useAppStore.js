import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Helpers ────────────────────────────────────────────────────────────────

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const today = () => new Date().toISOString().split('T')[0]

// ─── Initial demo tasks ──────────────────────────────────────────────────────

const DEMO_TASKS = [
  {
    id: uid(), title: 'Set up morning routine', completed: true,
    priority: 'high', category: 'health', dueDate: today(),
    description: 'Wake up at 6am, meditate 10 min, journal.', createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(), kanbanCol: 'done', tags: ['morning', 'wellness'],
    pebbles: [{ id: uid(), title: 'Meditate 10 min', completed: true }, { id: uid(), title: 'Journal thoughts', completed: true }],
  },
  {
    id: uid(), title: 'Read 20 pages of Atomic Habits', completed: false,
    priority: 'medium', category: 'learning', dueDate: today(),
    description: '', createdAt: new Date().toISOString(), completedAt: null,
    kanbanCol: 'inprogress', tags: ['reading'], pebbles: [],
  },
  {
    id: uid(), title: 'Finish project proposal deck', completed: false,
    priority: 'high', category: 'work', dueDate: today(),
    description: 'Slides 1–10 with market analysis.', createdAt: new Date().toISOString(),
    completedAt: null, kanbanCol: 'inprogress', tags: ['project'],
    pebbles: [{ id: uid(), title: 'Draft outline', completed: true }, { id: uid(), title: 'Design slides', completed: false }],
  },
  {
    id: uid(), title: 'Go for a 5km run', completed: false,
    priority: 'medium', category: 'health', dueDate: today(),
    description: '', createdAt: new Date().toISOString(), completedAt: null,
    kanbanCol: 'backlog', tags: ['fitness'], pebbles: [],
  },
  {
    id: uid(), title: 'Reply to pending emails', completed: true,
    priority: 'low', category: 'work', dueDate: today(),
    description: '', createdAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    kanbanCol: 'done', tags: [], pebbles: [],
  },
  {
    id: uid(), title: 'Plan weekend trip itinerary', completed: false,
    priority: 'low', category: 'personal', dueDate: today(),
    description: '', createdAt: new Date().toISOString(), completedAt: null,
    kanbanCol: 'backlog', tags: ['travel'], pebbles: [],
  },
]

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      theme: 'dark',
      currentView: 'daily',
      activeFocusTask: null, // Stores task ID active in focus mode
      sidebarOpen: true,
      currentUser: null, // null = guest
      tasks: DEMO_TASKS,
      kanbanCols: ['backlog', 'inprogress', 'review', 'done'],
      kanbanColLabels: { backlog: 'Backlog', inprogress: 'In Progress', review: 'Review', done: 'Done' },
      streakData: {}, // { '2026-04-01': 3, ... } tasks completed per day
      snippetIndex: 0,

      // ── Theme ──────────────────────────────────────────────────────────────
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        document.documentElement.classList.add('theme-transition')
        setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500)
        set({ theme: next })
      },

      // ── View ───────────────────────────────────────────────────────────────
      setView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Auth ───────────────────────────────────────────────────────────────
      login: (name, email) => set({ currentUser: { id: uid(), name, email, avatar: name[0].toUpperCase() } }),
      logout: () => set({ currentUser: null }),

      // ── Tasks ──────────────────────────────────────────────────────────────
      addTask: (taskData) => {
        const task = {
          id: uid(),
          title: taskData.title,
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          category: taskData.category || 'personal',
          dueDate: taskData.dueDate || today(),
          tags: taskData.tags || [],
          completed: false,
          completedAt: null,
          kanbanCol: taskData.kanbanCol || 'backlog',
          pebbles: taskData.pebbles || [],
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },

      updateTask: (id, updates) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),

      toggleTask: (id) => set((s) => {
        const tasks = s.tasks.map((t) => {
          if (t.id !== id) return t
          const completed = !t.completed
          const completedAt = completed ? new Date().toISOString() : null
          return { ...t, completed, completedAt }
        })
        // Update streak data
        const streakData = { ...s.streakData }
        const dateKey = today()
        const completedToday = tasks.filter(
          (t) => t.completedAt && t.completedAt.startsWith(dateKey)
        ).length
        streakData[dateKey] = completedToday
        return { tasks, streakData }
      }),

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTaskToCol: (taskId, col) => set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === taskId ? { ...t, kanbanCol: col, completed: col === 'done', completedAt: col === 'done' ? new Date().toISOString() : t.completedAt } : t
        ),
      })),

      reorderTasks: (activeId, overId) => set((s) => {
        const tasks = [...s.tasks]
        const from = tasks.findIndex((t) => t.id === activeId)
        const to = tasks.findIndex((t) => t.id === overId)
        if (from === -1 || to === -1) return {}
        const [item] = tasks.splice(from, 1)
        tasks.splice(to, 0, item)
        return { tasks }
      }),

      // ── Pebbles (Subtasks) ──────────────────────────────────────────────────
      togglePebble: (taskId, pebbleId) => set((s) => ({
        tasks: s.tasks.map(t => {
          if (t.id !== taskId) return t
          const pebbles = t.pebbles.map(p => p.id === pebbleId ? { ...p, completed: !p.completed } : p)
          return { ...t, pebbles }
        })
      })),
      
      addPebble: (taskId, title) => set((s) => ({
        tasks: s.tasks.map(t => {
          if (t.id !== taskId) return t
          return { ...t, pebbles: [...(t.pebbles||[]), { id: uid(), title, completed: false }] }
        })
      })),

      deletePebble: (taskId, pebbleId) => set((s) => ({
        tasks: s.tasks.map(t => {
          if (t.id !== taskId) return t
          return { ...t, pebbles: t.pebbles.filter(p => p.id !== pebbleId) }
        })
      })),

      // ── Focus Mode ────────────────────────────────────────────────────────
      setFocusTask: (taskId) => set({ activeFocusTask: taskId }),

      // ── Selectors ──────────────────────────────────────────────────────────
      getTasksForDate: (dateStr) => get().tasks.filter((t) => t.dueDate === dateStr),
      getTasksForCol: (col) => get().tasks.filter((t) => t.kanbanCol === col),
      getStats: () => {
        const tasks = get().tasks
        const completed = tasks.filter((t) => t.completed).length
        const total = tasks.length
        const rate = total ? Math.round((completed / total) * 100) : 0
        const streakData = get().streakData
        const dates = Object.keys(streakData).sort()
        let streak = 0
        let d = new Date()
        while (true) {
          const key = d.toISOString().split('T')[0]
          if (streakData[key] > 0) {
            streak++
            d.setDate(d.getDate() - 1)
          } else break
        }
        return { completed, total, rate, streak }
      },

      // ── Snippets ───────────────────────────────────────────────────────────
      nextSnippet: () => set((s) => ({ snippetIndex: (s.snippetIndex + 1) % 30 })),
    }),
    {
      name: 'zenflow-storage',
      partialize: (s) => ({
        theme: s.theme, tasks: s.tasks, streakData: s.streakData,
        currentUser: s.currentUser, snippetIndex: s.snippetIndex,
        kanbanColLabels: s.kanbanColLabels,
      }),
    }
  )
)

// Apply saved theme on load
const savedTheme = JSON.parse(localStorage.getItem('zenflow-storage') || '{}')?.state?.theme || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)
