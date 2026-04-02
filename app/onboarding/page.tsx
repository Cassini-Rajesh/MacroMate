'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { calculateMacros } from '@/lib/macros'
import Logo from '../../components/Logo'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: 'active', label: 'Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
]

export default function OnboardingPage() {
  const [activityLevel, setActivityLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (!activityLevel) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('weight_lbs, height_inches, age, goal')
      .eq('id', user.id)
      .single()

    if (!profile) return

    const macros = calculateMacros(
      profile.weight_lbs,
      profile.height_inches,
      profile.age,
      profile.goal,
      activityLevel
    )

    await supabase.from('users').update({
      activity_level: activityLevel,
      daily_calories: macros.calories,
      daily_protein: macros.protein,
      daily_carbs: macros.carbs,
      daily_fat: macros.fat,
      onboarding_complete: true,
    }).eq('id', user.id)

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">One last thing!</h1>
          <p className="text-textSecondary">How active are you on a typical day? This helps us nail your calorie targets.</p>
        </div>

        <div className="space-y-3 mb-8">
          {ACTIVITY_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => setActivityLevel(level.value)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                activityLevel === level.value
                  ? 'border-accent bg-surface'
                  : 'border-borderSlate bg-surface2 hover:border-accentSoft'
              }`}
            >
              <div className="font-bold text-white">{level.label}</div>
              <div className="text-textSecondary text-sm mt-0.5">{level.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!activityLevel || loading}
          className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-colors text-lg"
        >
          {loading ? 'Calculating your targets...' : "Let's go!"}
        </button>
      </div>
    </div>
  )
}
