import Image from 'next/image'
import Link from 'next/link'
import { Camera, Target, TrendingUp, Check, Zap } from 'lucide-react'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary text-textPrimary">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-accent text-accent font-semibold px-4 py-2 rounded-full text-sm mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Nutrition Tracking
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Track your macros<br />
            <span className="text-white">in seconds.</span><br />
            <span className="text-accent">Just snap a photo.</span>
          </h1>
          <p className="text-xl text-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Built for college students who actually care about what they eat. No more manual logging, no more guessing — just real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
            <Link href="/signup" className="w-full sm:w-auto bg-accent hover:bg-accentSoft text-black font-bold text-lg px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-accent/20 text-center">
              Start Free 14-Day Trial
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-surface border border-borderSlate text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors hover:bg-surface2 text-center">
              Sign In
            </Link>
          </div>
          <p className="text-sm text-textSecondary mt-4">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4" style={{ backgroundColor: '#141414' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Ready to start tracking?
          </h2>
          <p className="text-lg mb-10" style={{ color: '#A0A0A0' }}>
            Join hundreds of Penn State students already hitting their macro goals.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 rounded-2xl font-black text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#D4A017', color: '#0A0A0A' }}
          >
            Get Started Free
          </Link>
          <p className="mt-4 text-sm" style={{ color: '#A0A0A0' }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Everything you need to eat smarter</h2>
            <p className="text-textSecondary text-lg">Three features that make MacroMate actually worth using.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Camera className="w-7 h-7 text-accent" />}
              iconBg="bg-accentSoft/10"
              title="AI Photo Meal Logging"
              description="Snap a photo of your meal and our AI instantly identifies the food, estimates portions, and calculates your macros. It takes 3 seconds."
            />
            <FeatureCard
              icon={<Target className="w-7 h-7 text-accent" />}
              iconBg="bg-accentSoft/10"
              title="Custom Macro Targets"
              description="Tell us your goal — cut, bulk, or maintain — and we'll calculate your personalized daily calorie and macro targets using proven formulas."
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7 text-macroPurple" />}
              iconBg="bg-macroPurple/10"
              title="Weekly Progress Tracking"
              description="Watch your streak grow. See your weekly averages, hit your goals consistently, and build the habits that actually stick long-term."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-textPrimary mb-4">Simple, honest pricing.</h2>
          <p className="text-textSecondary mb-10">One plan. Everything included. No hidden fees.</p>
          <div className="rounded-3xl p-8 text-textPrimary shadow-2xl shadow-black/20 border border-borderSlate bg-surface">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-1 rounded-full bg-accent" />
              <div>
                <div className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">MacroMate Pro</div>
                <div className="text-5xl md:text-6xl font-black mb-1">$4.99</div>
              </div>
            </div>
            <div className="text-textSecondary mb-8">/month after free trial</div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                'AI photo meal logging',
                'Unlimited meal logs',
                'Custom macro targets',
                'Daily streak tracking',
                '14-day free trial',
                'Cancel anytime',
              ].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <span className="text-textSecondary">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full bg-accent hover:bg-accentSoft text-white font-black text-lg py-4 rounded-2xl transition-colors">
              Start Free 14-Day Trial
            </Link>
            <p className="text-textSecondary text-sm mt-3">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl font-black text-textPrimary mb-12">Meet the Founder</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-full h-80 sm:h-[400px] overflow-hidden rounded-2xl border border-[#2A2A2A] mb-4">
                <Image
                  src="/Rock.jpg"
                  fill={true}
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                  alt="Rock Climbing"
                />
              </div>
              <p className="text-accent font-medium text-center">Rock Climbing</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-full h-80 sm:h-[400px] overflow-hidden rounded-2xl border border-[#2A2A2A] mb-4">
                <Image
                  src="/Professional.jpg"
                  fill={true}
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  alt="Founder & Developer"
                />
              </div>
              <p className="text-accent font-medium text-center">Founder & Developer</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-full h-80 sm:h-[400px] overflow-hidden rounded-2xl border border-[#2A2A2A] mb-4">
                <Image
                  src="/Football.jpg"
                  fill={true}
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                  alt="Playing Football"
                />
              </div>
              <p className="text-accent font-medium text-center">Playing Football</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-borderSlate">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-black text-textPrimary">MacroMate</span>
          </div>
          <p className="text-textSecondary text-sm">Eat smart. Stay fueled. Crush your goals.</p>
          <p className="text-textSecondary text-sm">© 2026 MacroMate</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, iconBg, title, description }: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
}) {
  return (
    <div className="bg-surface rounded-3xl p-8 shadow-sm border border-borderSlate hover:shadow-lg transition-shadow">
      <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-textSecondary leading-relaxed">{description}</p>
    </div>
  )
}
