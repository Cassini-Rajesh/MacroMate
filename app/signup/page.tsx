'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    weightLbs: '',
    heightFt: '',
    heightIn: '',
    goal: 'maintain',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const heightInches = parseInt(formData.heightFt) * 12 + parseInt(formData.heightIn)

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError || !data.user) {
      setError(authError?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    const userId = data.user.id

    const profileResponse = await fetch('/api/create-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name: formData.name,
        age: parseInt(formData.age, 10),
        weightLbs: parseInt(formData.weightLbs, 10),
        heightInches,
        goal: formData.goal,
      }),
    })

    const profileResult = await profileResponse.json()
    if (!profileResponse.ok || profileResult.error) {
      setError(profileResult.error || 'Failed to save profile')
      setLoading(false)
      return
    }

    await fetch('/api/create-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: formData.email }),
    })

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Logo />
            <span className="font-black text-2xl text-white">MacroMate</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Start your free trial</h1>
          <p className="text-textSecondary mt-2">14 days free — no credit card needed</p>
        </div>

        <div className="bg-surface rounded-3xl shadow-sm border border-borderSlate p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="Alex Johnson" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="you@college.edu" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Age</label>
                <input type="number" value={formData.age} onChange={e => update('age', e.target.value)} required min="16" max="40" className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="21" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Weight (lbs)</label>
                <input type="number" value={formData.weightLbs} onChange={e => update('weightLbs', e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="160" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Height</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" value={formData.heightFt} onChange={e => update('heightFt', e.target.value)} required min="4" max="7" className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="5 ft" />
                <input type="number" value={formData.heightIn} onChange={e => update('heightIn', e.target.value)} required min="0" max="11" className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" placeholder="10 in" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Your Goal</label>
              <div className="grid grid-cols-3 gap-3">
                {['cut', 'maintain', 'bulk'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update('goal', g)}
                    className={`py-3 rounded-xl font-semibold text-sm capitalize transition-all ${
                      formData.goal === g
                        ? 'bg-accent text-black shadow-md'
                        : 'bg-surface text-white hover:bg-surface2'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-danger text-sm bg-[#2a0f0f] px-4 py-3 rounded-xl">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-colors mt-2">
              {loading ? 'Creating account...' : 'Create Account — Free'}
            </button>
          </form>
          <p className="text-center text-textSecondary mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-semibold hover:text-accentSoft">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
