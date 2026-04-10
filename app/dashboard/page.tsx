import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import DashboardMeals from '@/components/DashboardMeals'
import UpgradedBanner from '@/components/UpgradedBanner'
import { Flame } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string }
}) {
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

  const isPremium = sub?.status === 'active'

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

  const isFreeAtLimit = !isPremium && (meals?.length ?? 0) >= 3

  return (
    <div className="min-h-screen bg-primary text-textPrimary">
      {searchParams.upgraded === 'true' && <UpgradedBanner />}

      {isFreeAtLimit && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
            style={{
              backgroundColor: '#1C1C1C',
              borderLeft: '3px solid #D4A017',
            }}
          >
            <p className="text-sm font-medium" style={{ color: '#D4A017' }}>
              Upgrade to Premium for unlimited AI scans — $4.99/month
            </p>
            <Link
              href="/subscribe"
              className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: '#D4A017', color: '#0A0A0A' }}
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary border-b border-borderSlate">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-textSecondary text-sm">{dateStr}</p>
            <h1 className="text-2xl font-black text-textPrimary">Hey, {firstName}!</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-accent text-textPrimary px-3 py-1.5 rounded-xl text-sm font-bold">
              <Flame className="w-4 h-4" />
              {streak} day streak
            </div>
            {!isPremium && (
              <Link
                href="/subscribe"
                className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-opacity hover:opacity-80 whitespace-nowrap"
                style={{ borderColor: '#D4A017', color: '#D4A017' }}
              >
                Upgrade
              </Link>
            )}
            {isPremium && (
              <Link
                href="/subscribe"
                className="text-xs font-medium text-textSecondary hover:text-white transition-colors whitespace-nowrap"
              >
                Manage Plan
              </Link>
            )}
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
