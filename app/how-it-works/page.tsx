'use client'

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Camera, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import { useState } from 'react'

export default function HowItWorksPage() {
  const [step, setStep] = useState(1)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        setStep(2)
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          setStep(3)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-primary text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-primary border-b border-accent">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-black text-xl text-white">MacroMate</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white font-medium hover:text-accent transition-colors px-3 py-2">
              Home
            </Link>
            <Link href="/how-it-works" className="text-accent font-medium hover:text-accentSoft transition-colors px-3 py-2">
              How It Works
            </Link>
            <Link href="/about" className="text-white font-medium hover:text-accent transition-colors px-3 py-2">
              About
            </Link>
            <Link href="/contact" className="text-white font-medium hover:text-accent transition-colors px-3 py-2">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white font-medium hover:text-accent transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="bg-accent hover:bg-accentSoft text-black font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black text-white text-center mb-16">
            See MacroMate in action
          </h1>

          {/* Demo */}
          <div className="mb-20">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className={`text-center p-6 rounded-2xl border-2 ${step === 1 ? 'border-accent bg-surface' : 'border-borderSlate bg-surface2'}`}>
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Snap a Photo</h3>
                <p className="text-textSecondary mb-4">Upload an image of your meal</p>
                {step === 1 && (
                  <label className="inline-block bg-accent hover:bg-accentSoft text-black font-semibold px-6 py-3 rounded-lg cursor-pointer transition-colors">
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
                {image && step > 1 && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mx-auto border border-borderSlate">
                    <Image src={image} alt="Uploaded meal" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className={`text-center p-6 rounded-2xl border-2 ${step === 2 ? 'border-accent bg-surface' : 'border-borderSlate bg-surface2'}`}>
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  {loading ? <Loader2 className="w-8 h-8 text-accent animate-spin" /> : <span className="text-accent font-bold text-2xl">AI</span>}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Analyzes Your Meal</h3>
                <p className="text-textSecondary">
                  {loading ? 'Analyzing your meal...' : 'Our AI identifies food and calculates macros'}
                </p>
              </div>

              {/* Step 3 */}
              <div className={`text-center p-6 rounded-2xl border-2 ${step === 3 ? 'border-accent bg-surface' : 'border-borderSlate bg-surface2'}`}>
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent font-bold text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get Your Macros</h3>
                <p className="text-textSecondary mb-4">Instant macro breakdown</p>
                {step === 3 && (
                  <div className="bg-surface rounded-lg p-4 border border-borderSlate text-left">
                    <h4 className="font-bold text-white mb-2">Grilled Chicken & Rice Bowl</h4>
                    <div className="space-y-1 text-sm text-textSecondary">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span className="font-semibold">620</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-semibold text-success">48g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs:</span>
                        <span className="font-semibold text-macroBlue">65g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span className="font-semibold text-macroPurple">12g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div>
            <h2 className="text-4xl font-black text-white text-center mb-12">
              Why MacroMate beats manual logging
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ComparisonCard
                title="MyFitnessPal"
                description="Requires manual search and entry for every ingredient"
                color="dark"
              />
              <ComparisonCard
                title="Lose It"
                description="No AI photo recognition on free tier"
                color="dark"
              />
              <ComparisonCard
                title="MacroMate"
                description="Just snap a photo. Done in seconds."
                color="gold"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ComparisonCard({ title, description, color }: { title: string; description: string; color: string }) {
  const bgColor = color === 'gold' ? 'bg-surface2 border-surface' : 'bg-surface border-surface2'
  const titleColor = color === 'gold' ? 'text-accent' : 'text-white'

  return (
    <div className={`p-6 rounded-2xl border-2 ${bgColor}`}>
      <h3 className={`text-xl font-bold ${titleColor} mb-3`}>{title}</h3>
      <p className="text-textSecondary">{description}</p>
    </div>
  )
}