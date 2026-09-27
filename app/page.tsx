'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    router.replace(user ? '/tasks' : '/login')
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
      <p className="text-sm text-[var(--ink-soft)]">Loading…</p>
    </div>
  )
}