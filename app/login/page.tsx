'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '../../components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Logo />
            <span className="font-black text-2xl text-white">MacroMate</span>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back!</h1>
          <p className="text-textSecondary mt-2">Sign in to track your macros</p>
        </div>

        <div className="bg-surface rounded-3xl shadow-sm border border-borderSlate p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-borderSlate bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-danger text-sm bg-[#2b0f0f] px-4 py-3 rounded-xl">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-textSecondary mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-accent font-semibold hover:text-accentSoft">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
