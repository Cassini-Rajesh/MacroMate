'use client'

import { useState } from 'react'

export default function EmailCaptureForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="bg-surface border border-borderSlate text-success px-4 py-3 rounded-lg">
        You&apos;re on the list! We&apos;ll be in touch soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
        required
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
        required
      />
      <button
        type="submit"
        className="w-full bg-accent hover:bg-accentSoft text-black font-semibold py-3 rounded-lg transition-colors"
      >
        Join the Waitlist
      </button>
    </form>
  )
}