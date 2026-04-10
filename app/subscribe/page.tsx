'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)

  async function handleStartTrial() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Choose Your Plan</h1>
          <p className="text-textSecondary text-lg">Start free, upgrade when you&apos;re ready</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Card */}
          <div
            className="rounded-3xl p-8 flex flex-col"
            style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A' }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white mb-2">Free</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-textSecondary">/ month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { label: '3 AI photo scans per day', included: true },
                { label: 'Unlimited barcode scanning', included: true },
                { label: 'Unlimited manual entry', included: true },
                { label: 'PSU Dining Hall tab', included: true },
                { label: 'Full macro tracking dashboard', included: true },
                { label: 'Unlimited AI photo scans', included: false },
                { label: 'Extended nutrition details', included: false },
              ].map(({ label, included }) => (
                <li key={label} className="flex items-center gap-3">
                  {included ? (
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-surface2 flex items-center justify-center flex-shrink-0">
                      <X className="w-3 h-3 text-textSecondary" />
                    </div>
                  )}
                  <span className={included ? 'text-white' : 'text-textSecondary line-through'}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-4 rounded-2xl font-bold text-base cursor-not-allowed"
              style={{ backgroundColor: '#2A2A2A', color: '#6B7280' }}
            >
              Current Plan
            </button>
          </div>

          {/* Premium Card */}
          <div
            className="rounded-3xl p-8 flex flex-col"
            style={{ backgroundColor: '#141414', border: '2px solid #D4A017' }}
          >
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-2xl font-black" style={{ color: '#D4A017' }}>Premium</h2>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: '#2A1F00', color: '#D4A017', border: '1px solid #D4A017' }}
                >
                  14-day free trial
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$4.99</span>
                <span className="text-textSecondary">/ month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Everything in Free',
                'Unlimited AI photo scans',
                'Extended nutrition details',
                'Priority support',
              ].map(label => (
                <li key={label} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#D4A017' }}
                  >
                    <Check className="w-3 h-3 text-black" />
                  </div>
                  <span className="text-white">{label}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#D4A017', color: '#0A0A0A' }}
            >
              {loading ? 'Redirecting...' : 'Start Free Trial'}
            </button>
          </div>
        </div>

        <p className="text-center text-textSecondary text-sm mt-8">
          Already have an account?{' '}
          <Link href="/dashboard" className="underline hover:text-white transition-colors">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
