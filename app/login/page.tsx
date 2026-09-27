'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // Supabase sends a confirmation email by default.
        // If you've disabled email confirmation in Supabase Auth settings,
        // the user is signed in immediately instead.
        setMessage('Check your email to confirm your account, then log in.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/tasks')
      }
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setError(null)
          setMessage(null)
        }}
        className="mt-4 text-sm text-gray-500 hover:underline"
      >
        {mode === 'login'
          ? "Don't have an account? Sign up"
          : 'Already have an account? Log in'}
      </button>
    </div>
  )
}