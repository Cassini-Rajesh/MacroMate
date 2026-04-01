import Link from 'next/link'
import { Play } from 'lucide-react'
import Logo from '../../components/Logo'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-black text-xl text-gray-900">MacroMate</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              How It Works
            </Link>
            <Link href="/about" className="text-green-500 font-medium hover:text-green-600 transition-colors px-3 py-2">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-gray-900 text-center mb-8">
            Built by a college student, for college students
          </h1>
          <p className="text-xl text-gray-500 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
            MacroMate was born out of frustration with existing nutrition apps that require tedious manual logging. As a Penn State Aerospace Engineering student focused on body recomposition, I wanted something smarter — an app that uses AI to do the heavy lifting so you can focus on your goals.
          </p>

          {/* Video Placeholder */}
          <div className="mb-16">
            <div className="relative w-full max-w-2xl mx-auto aspect-video bg-gray-800 rounded-2xl flex items-center justify-center">
              <Play className="w-16 h-16 text-white" />
              <span className="absolute bottom-4 left-4 text-white text-lg font-semibold">
                30-Second Pitch Video — Coming Soon
              </span>
            </div>
          </div>

          {/* Mission */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To make professional-level nutrition tracking accessible to every college student — regardless of their budget or background.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}