'use client'

import { useEffect, useState } from 'react'

export default function UpgradedBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-white bg-green-800 border border-green-600">
        Welcome to MacroMate Premium! Unlimited AI scans unlocked.
      </div>
    </div>
  )
}
