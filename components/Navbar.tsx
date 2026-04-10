'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

type AuthState = 'loading' | 'loggedOut' | 'free' | 'premium'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('loading')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthState('loggedOut'); return }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      setAuthState(sub?.status === 'active' ? 'premium' : 'free')
    }
    checkAuth()
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-accent">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3 md:gap-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-black text-xl text-white">MacroMate</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 transition-colors font-medium ${
                isActive(item.href) ? 'text-accent' : 'text-white hover:text-accent'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {authState === 'loggedOut' && (
            <Link
              href="/subscribe"
              className={`px-3 py-2 transition-colors font-medium ${
                isActive('/subscribe') ? 'text-accent' : 'text-white hover:text-accent'
              }`}
            >
              Pricing
            </Link>
          )}
          {authState === 'free' && (
            <Link
              href="/subscribe"
              className="px-3 py-2 font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#D4A017' }}
            >
              Upgrade
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-white font-medium hover:text-accent transition-colors px-4 py-2 rounded-lg"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-accent hover:bg-accentSoft text-black font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-accent hover:bg-surface transition-colors"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-primary border-t border-borderSlate">
          <div className="flex flex-col">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`min-h-[56px] flex items-center px-4 text-lg font-medium transition-colors ${
                  isActive(item.href) ? 'text-accent' : 'text-white hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {authState === 'loggedOut' && (
              <Link
                href="/subscribe"
                onClick={() => setMenuOpen(false)}
                className={`min-h-[56px] flex items-center px-4 text-lg font-medium transition-colors ${
                  isActive('/subscribe') ? 'text-accent' : 'text-white hover:text-accent'
                }`}
              >
                Pricing
              </Link>
            )}
            {authState === 'free' && (
              <Link
                href="/subscribe"
                onClick={() => setMenuOpen(false)}
                className="min-h-[56px] flex items-center px-4 text-lg font-semibold"
                style={{ color: '#D4A017' }}
              >
                Upgrade
              </Link>
            )}
            <div className="border-t border-borderSlate px-4 py-4 flex items-center gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 min-h-[56px] flex items-center justify-center rounded-xl border border-borderSlate text-white hover:text-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex-1 min-h-[56px] flex items-center justify-center rounded-xl bg-accent text-black font-semibold hover:bg-accentSoft transition-colors"
              >
                Start
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
