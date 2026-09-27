import { createClient } from '@supabase/supabase-js'

// Add these to a .env.local file at your project root:
// NEXT_PUBLIC_SUPABASE_URL=your-project-url
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
// (Find both in Supabase dashboard > Project Settings > API Keys tab)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  updated_at: string
}