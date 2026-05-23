import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'
import { Plus, MoreHorizontal } from 'lucide-react'
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COL_COLORS = {
  backlog: { bg: 'transparent', accent: '#3B82F6', border: 'rgba(59,130,246,0.2)' },
  inprogress: { bg: 'transparent', accent: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
  review: { bg: 'transparent', accent: '#7C3AED', border: 'rgba(124,58,237,0.2)' },
  done: { bg: 'transparent', accent: '#10B981', border: 'rgba(16,185,129,0.2)' },
}

function SortableTaskMini({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} dragging={isDragging} />
    </div>
  )
}

export default function KanbanView() {
  const { tasks, kanbanColLabels, moveTaskToCol, reorderTasks } = useAppStore()
  const [activeId, setActiveId] = useState(null)
  const [showModal, setShowModal] = useState(null) // col id or null

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const COLS = Object.keys(kanbanColLabels)

  const getCol = (col) => tasks.filter((t) => t.kanbanCol === col)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    // Check if dropped on a column
    if (COLS.includes(over.id)) {
      moveTaskToCol(active.id, over.id)
    } else {
      // Dropped on another task — reorder or move to that task's column
      const overTask = tasks.find((t) => t.id === over.id)
      const activeTask = tasks.find((t) => t.id === active.id)
      if (overTask && activeTask && overTask.kanbanCol !== activeTask.kanbanCol) {
        moveTaskToCol(active.id, overTask.kanbanCol)
      } else {
        reorderTasks(active.id, over.id)
      }
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, minHeight: '70vh' }}>
        {COLS.map((col) => {
          const colTasks = getCol(col)
          const colStyle = COL_COLORS[col] || { bg: 'var(--bg-card)', accent: 'var(--accent)', border: 'var(--border)' }

          return (
            <motion.div
              key={col}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="kanban-col shoji-panel"
              style={{
                padding: 16,
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: colStyle.accent,
                  boxShadow: `0 0 8px ${colStyle.accent}60`,
                }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
                  {kanbanColLabels[col]}
                </span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 99,
                  background: `${colStyle.accent}20`, color: colStyle.accent, fontWeight: 700,
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div style={{ flex: 1, minHeight: 80 }}>
                  <AnimatePresence>
                    {colTasks.map((task) => (
                      <SortableTaskMini key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div style={{
                      border: `2px dashed ${colStyle.border}`,
                      borderRadius: 10, padding: '20px 12px', textAlign: 'center',
                      color: 'var(--text-placeholder)', fontSize: 12,
                    }}>
                      Drop tasks here
                    </div>
                  )}
                </div>
              </SortableContext>

              {/* Add to column */}
              <button
                onClick={() => setShowModal(col)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  marginTop: 8, width: '100%',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Plus size={13} /> Add task
              </button>
            </motion.div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} dragging />}
      </DragOverlay>

      <AnimatePresence>
        {showModal && (
          <TaskModal
            onClose={() => setShowModal(null)}
            initialTask={{ kanbanCol: showModal }}
          />
        )}
      </AnimatePresence>
    </DndContext>
  )
}
