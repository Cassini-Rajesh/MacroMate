'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="p-2 text-textSecondary hover:text-white hover:bg-surface2 rounded-xl transition-colors">
      <LogOut className="w-5 h-5" />
    </button>
  )
}
