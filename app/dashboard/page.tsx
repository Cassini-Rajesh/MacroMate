import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import DashboardMeals from '@/components/DashboardMeals'
import { Flame } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_complete) redirect('/onboarding')

  // Check subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const now = new Date()
  const isExpired = sub && sub.status !== 'active' && new Date(sub.trial_ends_at) < now
  if (isExpired) redirect('/subscribe')

  // Today's meals
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .order('logged_at', { ascending: false })

  // Streak: count consecutive days with at least one meal
  const { data: allMeals } = await supabase
    .from('meals')
    .select('logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  const streak = calculateStreak(allMeals ?? [])

  const firstName = profile.name?.split(' ')[0] ?? 'there'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{dateStr}</p>
            <h1 className="text-2xl font-black text-gray-900">Hey, {firstName}!</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl text-sm font-bold">
              <Flame className="w-4 h-4" />
              {streak} day streak
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <DashboardMeals initialMeals={meals ?? []} profile={profile} />
    </div>
  )
}

function calculateStreak(meals: { logged_at: string }[]): number {
  if (!meals.length) return 0
  const days = new Set(meals.map(m => m.logged_at.slice(0, 10)))
  let streak = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}
