'use client'

import { useEffect, useState } from 'react'
import { supabase, Task } from '@/lib/supabase'
import { useAuth } from '@/lib/useAuth'

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks once we know who the user is
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
      .insert({ title, description, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      // Prepend the new task instead of refetching everything
      setTasks((prev) => [data, ...prev])
      setTitle('')
      setDescription('')
    }
    setSubmitting(false)
  }

  async function handleDeleteTask(id: string) {
    // Optimistically remove from UI, roll back if the delete fails
    const previousTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== id))

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      setError(error.message)
      setTasks(previousTasks)
    }
  }

  if (authLoading) {
    return <div className="p-8 text-gray-500">Checking your session…</div>
  }

  if (!user) {
    return (
      <div className="p-8 text-gray-500">
        You need to be signed in to view your tasks.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Tasks</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTask} className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          rows={2}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add Task'}
        </button>
      </form>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500 text-sm border border-dashed border-gray-300 rounded-md p-6 text-center">
          No tasks yet. Add your first one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="border border-gray-200 rounded-md p-3 flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-medium text-sm">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                )}
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-xs text-red-600 hover:underline shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}