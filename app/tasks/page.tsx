'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { supabase, Task } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'
import EditTaskModal from '@/components/EditTaskModal'
import TaskChart from '@/components/TaskChart'

const COLUMNS: { status: Task['status']; label: string; color: string }[] = [
  { status: 'todo', label: 'To do', color: 'var(--todo)' },
  { status: 'in_progress', label: 'In progress', color: 'var(--progress)' },
  { status: 'done', label: 'Done', color: 'var(--done)' },
]

const NEXT_STATUS: Record<Task['status'], { status: Task['status']; label: string } | null> = {
  todo: { status: 'in_progress', label: 'Start' },
  in_progress: { status: 'done', label: 'Mark done' },
  done: { status: 'todo', label: 'Reopen' },
}

export default function TasksPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!user) return

    async function fetchTasks() {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setTasks(data ?? [])
      }
      setLoading(false)
    }

    fetchTasks()
  }, [user])

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !user) return

    setSubmitting(true)
    setError(null)

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, description, due_date: dueDate || null, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setTasks((prev) => [data, ...prev])
      setTitle('')
      setDescription('')
      setDueDate('')
    }
    setSubmitting(false)
  }

  async function handleDeleteTask(id: string) {
    const previousTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== id))

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setTasks(previousTasks)
    }
  }

  async function handleEditSave(
    id: string,
    updates: { title: string; description: string; due_date: string | null }
  ) {
    const previousTasks = tasks
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))

    const { error } = await supabase.from('tasks').update(updates).eq('id', id)

    if (error) {
      setError(error.message)
      setTasks(previousTasks)
    }
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId as Task['status']
    const previousTasks = tasks

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId)

    if (error) {
      setError(error.message)
      setTasks(previousTasks)
    }
  }

  async function handleStatusChange(id: string, newStatus: Task['status']) {
    const previousTasks = tasks
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    )

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      setError(error.message)
      setTasks(previousTasks)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (authLoading) {
    return <div className="p-8 text-[var(--ink-soft)]">Checking your session…</div>
  }

  if (!user) {
    return (
      <div className="p-8 text-[var(--ink-soft)]">
        You need to be signed in to view your tasks.{' '}
        <a href="/login" className="underline">
          Go to login
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[var(--ink)]">Focus Board</h1>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-sm text-sm border border-red-200">
            {error}
          </div>
        )}

        {!loading && <TaskChart tasks={tasks} />}

        <form
          onSubmit={handleCreateTask}
          className="mb-10 p-4 bg-[var(--card)] border border-[var(--border)] rounded-sm space-y-3"
        >
          <input
            type="text"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)] placeholder:text-[var(--ink-soft)]"
            required
          />
          <textarea
            placeholder="Any details? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)] placeholder:text-[var(--ink-soft)]"
            rows={2}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)] text-[var(--ink-soft)]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[var(--ink)] text-[var(--paper)] text-sm px-4 py-2 rounded-sm disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add task'}
          </button>
        </form>

        {loading ? (
          <div className="text-[var(--ink-soft)] text-sm">Loading tasks…</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.status)
                return (
                  <Droppable droppableId={col.status} key={col.status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="rounded-sm p-1 min-h-[220px] transition-colors"
                        style={{
                          background: snapshot.isDraggingOver
                            ? 'rgba(0,0,0,0.03)'
                            : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: col.color }}
                          />
                          <h2 className="font-serif text-base text-[var(--ink)]">
                            {col.label}
                          </h2>
                          <span className="text-xs text-[var(--ink-soft)]">
                            {columnTasks.length}
                          </span>
                        </div>

                        {columnTasks.length === 0 && (
                          <div className="text-xs text-[var(--ink-soft)] border border-dashed border-[var(--border)] rounded-sm p-4 text-center">
                            Nothing here yet
                          </div>
                        )}

                        {columnTasks.map((task, index) => (
                          <Draggable draggableId={task.id} index={index} key={task.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setEditingTask(task)}
                                className="bg-[var(--card)] border border-[var(--border)] rounded-sm p-3 mb-2 cursor-pointer"
                                style={{
                                  borderLeft: `3px solid ${col.color}`,
                                  boxShadow: snapshot.isDragging
                                    ? '0 4px 14px rgba(0,0,0,0.12)'
                                    : 'none',
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-[var(--ink)]">{task.title}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteTask(task.id)
                                    }}
                                    className="text-xs text-[var(--ink-soft)] hover:text-red-600 shrink-0"
                                  >
                                    Delete
                                  </button>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-[var(--ink-soft)] mt-1">
                                    {task.description}
                                  </p>
                                )}
                                {task.due_date && (() => {
                                  const overdue =
                                    task.status !== 'done' &&
                                    task.due_date < new Date().toISOString().split('T')[0]
                                  return (
                                    <p
                                      className={`text-xs mt-1 ${
                                        overdue ? 'text-red-600' : 'text-[var(--ink-soft)]'
                                      }`}
                                    >
                                      {overdue ? 'Overdue: ' : 'Due '}
                                      {new Date(task.due_date + 'T00:00:00').toLocaleDateString(
                                        'en-US',
                                        { month: 'short', day: 'numeric' }
                                      )}
                                    </p>
                                  )
                                })()}
                                {NEXT_STATUS[task.status] && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(
                                        task.id,
                                        NEXT_STATUS[task.status]!.status
                                      )
                                    }}
                                    className="mt-2 text-xs px-2 py-1 rounded-sm border"
                                    style={{
                                      borderColor: col.color,
                                      color: col.color,
                                    }}
                                  >
                                    {NEXT_STATUS[task.status]!.label}
                                  </button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>
          </DragDropContext>
        )}

        {editingTask && (
          <EditTaskModal
            task={editingTask}
            onSave={handleEditSave}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </div>
  )
}