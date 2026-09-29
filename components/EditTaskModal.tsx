'use client'

import { useState } from 'react'
import { Task } from '@/lib/supabase'

type Props = {
  task: Task
  onSave: (
    id: string,
    updates: { title: string; description: string; due_date: string | null }
  ) => Promise<void>
  onClose: () => void
}

export default function EditTaskModal({ task, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave(task.id, { title, description, due_date: dueDate || null })
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-sm p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-lg text-[var(--ink)] mb-4">Edit Task</h2>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)]"
            placeholder="Task title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)]"
            rows={3}
            placeholder="Description (optional)"
          />
          <div>
            <label className="block text-xs text-[var(--ink-soft)] mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-[var(--border)] rounded-sm px-3 py-2 text-sm bg-transparent focus:outline-none focus:border-[var(--ink-soft)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-sm border border-[var(--border)] text-[var(--ink-soft)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-3 py-1.5 rounded-sm bg-[var(--ink)] text-[var(--paper)] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}