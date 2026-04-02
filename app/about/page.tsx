import Image from 'next/image'
import { Play } from 'lucide-react'
import Navbar from '../../components/Navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-primary text-white">
      <Navbar />

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-black text-white text-center mb-8">
            Built by a college student, for college students
          </h1>
          <p className="text-xl text-textSecondary text-center mb-10 max-w-3xl mx-auto leading-relaxed">
            MacroMate was born out of frustration with existing nutrition apps that require tedious manual logging. As a Penn State Aerospace Engineering student focused on body recomposition, I wanted something smarter — an app that uses AI to do the heavy lifting so you can focus on your goals.
          </p>
          <div className="flex justify-center mb-10">
            <Image
              src="/Professional.jpg"
              width={200}
              height={200}
              objectFit="cover"
              className="rounded-full"
              alt="Cassini headshot"
            />
          </div>

          {/* Video Placeholder */}
          <div className="mb-16">
            <div className="relative w-full max-w-2xl mx-auto aspect-video bg-surface rounded-2xl flex items-center justify-center border border-borderSlate">
              <Play className="w-16 h-16 text-white" />
              <span className="absolute bottom-4 left-4 text-white text-lg font-semibold">
                30-Second Pitch Video — Coming Soon
              </span>
            </div>
          </div>

          {/* Mission */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-textSecondary max-w-2xl mx-auto">
              To make professional-level nutrition tracking accessible to every college student — regardless of their budget or background.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}