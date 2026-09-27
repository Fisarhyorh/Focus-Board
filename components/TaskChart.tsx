'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Task } from '@/lib/supabase'

type Props = {
  tasks: Task[]
}

function getLast7DaysData(tasks: Task[]) {
  const days: { date: string; label: string; count: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    days.push({ date: dateKey, label, count: 0 })
  }

  const doneTasks = tasks.filter((t) => t.status === 'done')

  for (const task of doneTasks) {
    // Uses updated_at as a proxy for "completion date" since we don't
    // track a separate completed_at timestamp
    const dateKey = task.updated_at.split('T')[0]
    const day = days.find((d) => d.date === dateKey)
    if (day) day.count += 1
  }

  return days
}

export default function TaskChart({ tasks }: Props) {
  const data = getLast7DaysData(tasks)
  const totalDone = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-sm p-4 mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-lg text-[var(--ink)]">Completed this week</h2>
        <span className="text-sm text-[var(--ink-soft)]">{totalDone} tasks</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--ink-soft)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'var(--ink-soft)' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--done)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--done)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}