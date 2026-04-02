'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Check, Zap } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    const res = await fetch('/api/create-checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 border border-accent bg-surface px-4 py-2 rounded-full text-sm text-accent font-semibold mb-6">
          <Zap className="w-4 h-4" />
          Your trial has ended
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Keep your streak going!</h1>
        <p className="text-textSecondary mb-8">Subscribe to MacroMate Pro to continue tracking your macros and hitting your goals.</p>

        <div className="bg-surface rounded-3xl p-8 text-white shadow-2xl shadow-black/30 border border-accent mb-6">
          <div className="text-6xl font-black mb-1">$9.99</div>
          <div className="text-textSecondary mb-6">/month</div>
          <ul className="space-y-3 mb-8 text-left">
            {['AI photo meal logging', 'Unlimited meal logs', 'Custom macro targets', 'Daily streak tracking', 'Cancel anytime'].map(f => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-black" />
                </div>
                <span className="text-white/90">{f}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="block w-full bg-accent hover:bg-accentSoft text-black font-black text-lg py-4 rounded-2xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
